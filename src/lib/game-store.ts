// Redis-backed game store for server-side game state management
// Uses Vercel KV (Upstash Redis) for persistence across serverless instances
//
// KEY DESIGN PRINCIPLES (v5 — Redis-backed, stable):
// - Each player gets their full time limit to answer independently
// - Auto-advance when time expires OR all CONNECTED players have answered
// - Heartbeat tracking: players who don't poll for 8s are considered disconnected
// - Disconnected players don't block game flow
// - No creator-only dependency for game flow
// - Single source of truth: processAdvance is the ONLY function that advances state
// - All state persisted in Redis so it works across Vercel serverless instances

import { kv } from '@vercel/kv'

export interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  timeLimit: number
  order: number
}

export interface Player {
  id: string
  name: string
  score: number
  correctAnswers: number
  isCreator: boolean
  lastAnswer?: string // Store last answer for reconnect
  leftAt?: number // Timestamp when player explicitly left (0 = active)
  lastPollAt?: number // Timestamp of last poll — used for heartbeat/disconnect detection
}

export interface Answer {
  playerId: string
  answer: string
  time: number // ms since question start
}

// Serializable version of GameRoom (no Maps — uses plain objects for Redis storage)
export interface GameRoomData {
  code: string
  categoryName: string
  status: 'lobby' | 'playing' | 'showing-results' | 'finished'
  players: Record<string, Player>
  questions: Question[]
  currentQuestion: number
  timePerQuestion: number
  answers: Record<string, Answer>
  questionStartTime: number
  createdAt: number
  lastActivity: number
  lastQuestionResults: any | null
  advanceLock: boolean
  autoAdvanceAt: number
  resultsReadyAt: number
}

// ===== TIMING CONSTANTS =====
const DISCONNECT_TIMEOUT_MS = 8 * 1000 // 8 seconds
const REVEAL_DELAY_MS = 2000 // 2 seconds
const RESULTS_DISPLAY_MS = 4000 // 4 seconds
const ADVANCE_LOCK_MS = 2000 // 2 seconds
const ROOM_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

// ===== KV AVAILABILITY CHECK =====
// Check once whether KV is configured (has required env vars)
let kvAvailable: boolean | null = null
async function isKvAvailable(): Promise<boolean> {
  if (kvAvailable !== null) return kvAvailable
  try {
    // Try a simple KV operation to check if it's configured
    await kv.get('__kv_check__')
    kvAvailable = true
    return true
  } catch {
    kvAvailable = false
    return false
  }
}

// ===== KV KEY HELPERS =====
function roomKey(code: string): string {
  return `room:${code}`
}

// ===== SERIALIZATION HELPERS =====
function serializeRoom(room: GameRoomData): string {
  return JSON.stringify(room)
}

// Parse GameRoomData from Redis
function deserializeRoom(data: string): GameRoomData | null {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

// ===== ROOM OPERATIONS =====
async function getRoomData(code: string): Promise<GameRoomData | null> {
  if (!(await isKvAvailable())) {
    return getRoomDataLocal(code)
  }
  try {
    const data = await kv.get<string>(roomKey(code))
    if (!data) return null
    return deserializeRoom(data)
  } catch {
    return getRoomDataLocal(code)
  }
}

async function setRoomData(room: GameRoomData): Promise<void> {
  if (!(await isKvAvailable())) {
    setRoomDataLocal(room)
    return
  }
  try {
    await kv.set(roomKey(room.code), serializeRoom(room), { px: ROOM_TTL_MS })
  } catch {
    setRoomDataLocal(room)
  }
}

async function deleteRoomData(code: string): Promise<void> {
  if (!(await isKvAvailable())) {
    deleteRoomDataLocal(code)
    return
  }
  try {
    await kv.del(roomKey(code))
  } catch {
    deleteRoomDataLocal(code)
  }
}

// ===== IN-MEMORY FALLBACK (for local dev without KV) =====
const localRooms: Map<string, GameRoomData> = new Map()

function getRoomDataLocal(code: string): GameRoomData | null {
  return localRooms.get(code) || null
}

function setRoomDataLocal(room: GameRoomData): void {
  localRooms.set(room.code, room)
}

function deleteRoomDataLocal(code: string): void {
  localRooms.delete(code)
}

// Cleanup old rooms periodically (in-memory fallback only)
if (typeof globalThis !== 'undefined') {
  const g = globalThis as any
  if (!g.__gameCleanupInterval) {
    g.__gameCleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [code, room] of localRooms.entries()) {
        if (now - room.lastActivity > ROOM_TTL_MS) {
          localRooms.delete(code)
        }
      }
    }, 10 * 60 * 1000)
  }
}

// ===== CODE GENERATION =====
async function generateRoomCode(): Promise<string> {
  let code: string
  let attempts = 0
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString()
    attempts++
    if (attempts > 100) break // safety valve
  } while (await getRoomData(code) !== null)
  return code
}

// ===== HELPER FUNCTIONS =====

/**
 * Get the list of "connected" players — those who are:
 * 1. Not explicitly left (leftAt = 0 or undefined)
 * 2. Have polled within the disconnect timeout
 */
export function getConnectedPlayers(room: GameRoomData): Player[] {
  const now = Date.now()
  return Object.values(room.players).filter(p => {
    if (p.leftAt) return false
    if (!p.lastPollAt) return true
    return (now - p.lastPollAt) < DISCONNECT_TIMEOUT_MS
  })
}

/**
 * Count answers from connected players only.
 */
export function getConnectedAnswerCount(room: GameRoomData): number {
  const connectedIds = new Set(getConnectedPlayers(room).map(p => p.id))
  let count = 0
  for (const pId of Object.keys(room.answers)) {
    if (connectedIds.has(pId)) count++
  }
  return count
}

/**
 * Check if all connected players have answered and schedule auto-advance if so.
 */
function checkAllAnswered(room: GameRoomData): boolean {
  if (room.status !== 'playing') return false

  const connected = getConnectedPlayers(room)
  if (connected.length === 0) return false

  const connectedAnswerCount = getConnectedAnswerCount(room)
  const allAnswered = connectedAnswerCount >= connected.length

  if (allAnswered) {
    const proposedTime = Date.now() + REVEAL_DELAY_MS
    if (room.autoAdvanceAt === 0 || room.autoAdvanceAt > proposedTime) {
      room.autoAdvanceAt = proposedTime
    }
  }

  return allAnswered
}

// ===== EXPORTED API FUNCTIONS (all async) =====

export async function createRoom(data: {
  playerName: string
  categoryName: string
  questions: Question[]
  timePerQuestion: number
}): Promise<{ code: string; playerId: string }> {
  const code = await generateRoomCode()
  const playerId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

  const room: GameRoomData = {
    code,
    categoryName: data.categoryName,
    status: 'lobby',
    players: {},
    questions: data.questions.map((q, i) => ({ ...q, order: i })),
    currentQuestion: 0,
    timePerQuestion: data.timePerQuestion || 15,
    answers: {},
    questionStartTime: 0,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    lastQuestionResults: null,
    advanceLock: false,
    autoAdvanceAt: 0,
    resultsReadyAt: 0,
  }

  room.players[playerId] = {
    id: playerId,
    name: data.playerName,
    score: 0,
    correctAnswers: 0,
    isCreator: true,
    lastPollAt: Date.now(),
  }

  await setRoomData(room)
  return { code, playerId }
}

export async function joinRoom(code: string, playerName: string): Promise<{ playerId: string; room: GameRoomData } | { error: string }> {
  const room = await getRoomData(code)
  if (!room) return { error: 'Room not found. Check the code and try again.' }
  if (room.status === 'finished') return { error: 'Game has already finished.' }
  if (Object.keys(room.players).length >= 50) return { error: 'Room is full (max 50 players).' }

  const existingNames = Object.values(room.players).map(p => p.name.toLowerCase())
  if (existingNames.includes(playerName.toLowerCase())) {
    return { error: 'A player with that name already exists.' }
  }

  const playerId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  room.players[playerId] = {
    id: playerId,
    name: playerName,
    score: 0,
    correctAnswers: 0,
    isCreator: false,
    lastPollAt: Date.now(),
  }
  room.lastActivity = Date.now()

  // If game is in progress, check if all connected players have answered
  // (the new player hasn't answered yet, so this won't trigger auto-advance prematurely)
  if (room.status === 'playing') {
    checkAllAnswered(room)
  }

  await setRoomData(room)
  return { playerId, room }
}

export async function getRoom(code: string): Promise<GameRoomData | null> {
  return getRoomData(code)
}

export async function getRoomPlayers(code: string): Promise<Player[]> {
  const room = await getRoomData(code)
  if (!room) return []
  return Object.values(room.players)
}

export async function getLeaderboard(code: string): Promise<{ id: string; name: string; score: number; correctAnswers: number; rank: number }[]> {
  const room = await getRoomData(code)
  if (!room) return []
  return Object.values(room.players)
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }))
}

export async function startGame(code: string, playerId: string): Promise<{ success: boolean; error?: string }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players[playerId]
  if (!player || !player.isCreator) return { success: false, error: 'Only the creator can start the game' }

  room.status = 'playing'
  room.currentQuestion = 0
  room.answers = {}
  room.questionStartTime = Date.now()
  room.lastActivity = Date.now()
  room.advanceLock = false
  room.autoAdvanceAt = Date.now() + (room.questions[0]?.timeLimit || room.timePerQuestion) * 1000

  for (const p of Object.values(room.players)) {
    p.lastPollAt = Date.now()
    p.lastAnswer = undefined
  }

  await setRoomData(room)
  return { success: true }
}

export async function submitAnswer(code: string, playerId: string, answer: string): Promise<{ success: boolean; error?: string; allAnswered?: boolean }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found' }
  if (room.status !== 'playing') return { success: false, error: 'Game is not in progress' }
  if (room.answers[playerId]) return { success: false, error: 'Already answered' }

  const timeElapsed = Date.now() - room.questionStartTime
  room.answers[playerId] = { playerId, answer, time: timeElapsed }
  room.lastActivity = Date.now()

  const answerPlayer = room.players[playerId]
  if (answerPlayer) {
    answerPlayer.lastAnswer = answer
  }

  const allAnswered = checkAllAnswered(room)

  await setRoomData(room)
  return { success: true, allAnswered }
}

/**
 * THE ONLY function that processes question results and advances the game.
 * Mutates the room object and returns the results.
 */
function processAdvanceOnRoom(room: GameRoomData): { questionResults: any; isFinished: boolean; leaderboard?: any } | null {
  if (room.advanceLock) return null
  room.advanceLock = true

  try {
    const question = room.questions[room.currentQuestion]
    if (!question) {
      room.advanceLock = false
      return null
    }

    const results: any[] = []
    for (const [pId, answerData] of Object.entries(room.answers)) {
      const p = room.players[pId]
      if (!p) continue

      const isCorrect = answerData.answer === question.correctAnswer
      let points = 0

      if (isCorrect) {
        const timeRatio = Math.max(0, 1 - (answerData.time / (question.timeLimit * 1000)))
        points = Math.round(500 + timeRatio * 500)
        p.score += points
        p.correctAnswers += 1
      }

      results.push({
        playerId: pId,
        playerName: p.name,
        answer: answerData.answer,
        correct: isCorrect,
        points,
      })
    }

    // Add players who didn't answer (timed out) with 0 points
    for (const [pId, p] of Object.entries(room.players)) {
      if (!room.answers[pId]) {
        results.push({
          playerId: pId,
          playerName: p.name,
          answer: null,
          correct: false,
          points: 0,
          timedOut: true,
        })
      }
    }

    const leaderboard = Object.values(room.players)
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p, rank: i + 1 }))

    const questionResults = {
      correctAnswer: question.correctAnswer,
      questionText: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      results,
      leaderboard,
      totalAnswers: Object.keys(room.answers).length,
      correctCount: results.filter(r => r.correct).length,
      totalPlayers: Object.keys(room.players).length,
    }

    room.lastQuestionResults = questionResults

    // Clear per-question state
    room.currentQuestion += 1
    room.answers = {}
    room.autoAdvanceAt = 0

    // Clear lastAnswer on all players for the new question
    for (const p of Object.values(room.players)) {
      p.lastAnswer = undefined
    }

    if (room.currentQuestion >= room.questions.length) {
      room.status = 'finished'
      room.lastActivity = Date.now()
      return {
        questionResults,
        leaderboard,
        isFinished: true,
      }
    } else {
      room.status = 'showing-results'
      room.resultsReadyAt = Date.now()
      room.lastActivity = Date.now()
      return {
        questionResults,
        isFinished: false,
      }
    }
  } finally {
    // Release lock after a generous delay
    // Since we're in Redis now, we need to persist the lock state
    // The lock will be released by the next save + the setTimeout
    const roomCode = room.code
    setTimeout(async () => {
      const r = await getRoomData(roomCode)
      if (r) {
        r.advanceLock = false
        await setRoomData(r)
      }
    }, ADVANCE_LOCK_MS)
  }
}

export async function processAdvance(room: GameRoomData): Promise<{ questionResults: any; isFinished: boolean; leaderboard?: any } | null> {
  return processAdvanceOnRoom(room)
}

export async function advanceToNextQuestion(code: string, playerId: string): Promise<{ success: boolean; error?: string; questionResults?: any; leaderboard?: any; isFinished?: boolean }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players[playerId]
  if (!player) return { success: false, error: 'Player not in room' }

  if (room.status !== 'playing') return { success: false, error: 'Game is not in playing state' }

  const result = processAdvanceOnRoom(room)
  if (!result) return { success: false, error: 'Could not advance' }

  await setRoomData(room)
  return {
    success: true,
    questionResults: result.questionResults,
    leaderboard: result.leaderboard,
    isFinished: result.isFinished,
  }
}

/**
 * Start the next question — shared logic for auto-continue and manual continue.
 */
function startNextQuestion(room: GameRoomData) {
  room.status = 'playing'
  room.questionStartTime = Date.now()
  room.lastActivity = Date.now()
  room.advanceLock = false
  room.resultsReadyAt = 0

  const nextQ = room.questions[room.currentQuestion]
  room.autoAdvanceAt = Date.now() + (nextQ?.timeLimit || room.timePerQuestion) * 1000
}

export async function continueToNextQuestion(code: string, playerId: string): Promise<{ success: boolean; error?: string }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players[playerId]
  if (!player) return { success: false, error: 'Player not in room' }

  if (room.status !== 'showing-results') return { success: false, error: 'Not in showing-results state' }

  if (room.resultsReadyAt && Date.now() - room.resultsReadyAt < RESULTS_DISPLAY_MS) {
    return { success: false, error: 'Please wait a moment before continuing' }
  }

  startNextQuestion(room)
  await setRoomData(room)

  return { success: true }
}

export async function updateQuestions(code: string, playerId: string, questions: Question[]): Promise<{ success: boolean; error?: string }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players[playerId]
  if (!player || !player.isCreator) return { success: false, error: 'Only the creator can update questions' }
  if (room.status !== 'lobby') return { success: false, error: 'Can only update questions in lobby' }

  room.questions = questions.map((q, i) => ({ ...q, order: i }))
  room.lastActivity = Date.now()

  await setRoomData(room)
  return { success: true }
}

/**
 * THE MAIN GAME STATE FUNCTION — called by player polling every 1.5s.
 * This is the only place where auto-advance and auto-continue are triggered.
 */
export async function getGameState(code: string, playerId: string): Promise<any> {
  const room = await getRoomData(code)
  if (!room) return null

  const player = room.players[playerId]
  if (!player) return null

  // HEARTBEAT: Update player's last poll time
  player.lastPollAt = Date.now()
  room.lastActivity = Date.now()

  // STATE MACHINE TRANSITIONS
  let roomModified = false

  if (room.status === 'playing') {
    if (room.autoAdvanceAt > 0 && Date.now() >= room.autoAdvanceAt) {
      processAdvanceOnRoom(room)
      roomModified = true
    } else {
      const wasSet = checkAllAnswered(room)
      if (wasSet) roomModified = true
    }
  }

  if (room.status === 'showing-results') {
    if (room.resultsReadyAt > 0 && Date.now() - room.resultsReadyAt >= RESULTS_DISPLAY_MS) {
      startNextQuestion(room)
      roomModified = true
    }
  }

  // Save any state changes back to Redis
  if (roomModified) {
    await setRoomData(room)
  } else {
    // Still save the heartbeat update
    await setRoomData(room)
  }

  // Build the response based on current state
  const connected = getConnectedPlayers(room)
  const connectedCount = connected.length
  const connectedAnswerCount = getConnectedAnswerCount(room)

  const base = {
    code: room.code,
    categoryName: room.categoryName,
    status: room.status,
    players: Object.values(room.players),
    totalQuestions: room.questions.length,
    currentQuestionIndex: room.currentQuestion,
    isCreator: player.isCreator,
    playerId: player.id,
    playerName: player.name,
    playerScore: player.score,
    timePerQuestion: room.timePerQuestion,
    hasLeft: !!player.leftAt,
  }

  if (room.status === 'playing') {
    const q = room.questions[room.currentQuestion]
    if (q) {
      const elapsed = (Date.now() - room.questionStartTime) / 1000
      const timeLeft = Math.max(0, q.timeLimit - elapsed)
      const hasAnswered = !!room.answers[playerId]
      const lastAnswer = player.lastAnswer
      const allAnswered = connectedAnswerCount >= connectedCount && connectedCount > 0

      return {
        ...base,
        currentQuestion: {
          id: q.id,
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          // correctAnswer is NOT sent during playing state to prevent cheating
          timeLimit: q.timeLimit,
          questionNumber: room.currentQuestion + 1,
          totalQuestions: room.questions.length,
          timeLeft: Math.round(timeLeft * 10) / 10,
          hasAnswered,
          lastAnswer,
          answerCount: connectedAnswerCount,
          totalPlayers: connectedCount,
          allAnswered,
        },
      }
    }
  }

  if (room.status === 'finished') {
    return {
      ...base,
      leaderboard: Object.values(room.players)
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({ ...p, rank: i + 1 })),
      questions: room.questions.map(q => ({
        id: q.id,
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        timeLimit: q.timeLimit,
        order: q.order,
      })),
      difficulty: 'mixed',
      timePerQuestion: room.timePerQuestion,
    }
  }

  if (room.status === 'showing-results') {
    return {
      ...base,
      questionResults: room.lastQuestionResults,
      leaderboard: room.lastQuestionResults?.leaderboard || Object.values(room.players)
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({ ...p, rank: i + 1 })),
    }
  }

  return base
}

// Reconnect a player to their room after page refresh
export async function reconnectPlayer(code: string, playerId: string): Promise<{ success: boolean; error?: string; gameState?: any }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players[playerId]
  if (!player) return { success: false, error: 'Player not found in room' }

  if (player.leftAt) {
    player.leftAt = 0
  }

  player.lastPollAt = Date.now()
  room.lastActivity = Date.now()

  await setRoomData(room)

  const gameState = await getGameState(code, playerId)
  return { success: true, gameState }
}

export async function leaveRoom(code: string, playerId: string): Promise<{ success: boolean; roomDeleted?: boolean; wasCreator?: boolean }> {
  const room = await getRoomData(code)
  if (!room) return { success: false }

  const player = room.players[playerId]
  if (!player) return { success: false }

  const wasCreator = player.isCreator

  if (room.status === 'lobby') {
    // In lobby: fully remove the player
    delete room.players[playerId]
    room.lastActivity = Date.now()

    if (wasCreator) {
      const remainingPlayers = Object.values(room.players)
      if (remainingPlayers.length > 0) {
        remainingPlayers[0].isCreator = true
        room.lastActivity = Date.now()
        await setRoomData(room)
        return { success: true, roomDeleted: false, wasCreator: true }
      } else {
        await deleteRoomData(code)
        return { success: true, roomDeleted: true, wasCreator: true }
      }
    }

    await setRoomData(room)
    return { success: true, roomDeleted: false, wasCreator: false }
  } else {
    // In game: mark player as left but keep them for scoring
    player.leftAt = Date.now()
    room.lastActivity = Date.now()

    if (wasCreator) {
      const activePlayers = Object.values(room.players).filter(p => !p.leftAt && p.id !== playerId)
      if (activePlayers.length > 0) {
        activePlayers[0].isCreator = true
      }
    }

    if (room.status === 'playing') {
      checkAllAnswered(room)

      const connected = getConnectedPlayers(room)
      if (connected.length === 0) {
        room.autoAdvanceAt = Math.min(room.autoAdvanceAt || Infinity, Date.now() + 1000)
      }
    }

    await setRoomData(room)
    return { success: true, roomDeleted: false, wasCreator }
  }
}

// Rejoin a room after quitting (reactivates the player)
export async function rejoinRoom(code: string, playerId: string): Promise<{ success: boolean; error?: string; gameState?: any }> {
  const room = await getRoomData(code)
  if (!room) return { success: false, error: 'Room not found. It may have ended.' }

  const player = room.players[playerId]
  if (!player) return { success: false, error: 'Player not found in this room.' }

  player.leftAt = 0
  player.lastPollAt = Date.now()
  room.lastActivity = Date.now()

  await setRoomData(room)

  const gameState = await getGameState(code, playerId)
  return { success: true, gameState }
}
