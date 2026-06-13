// In-memory game store for server-side game state management
// This runs on the Next.js server and handles all game logic
//
// KEY DESIGN PRINCIPLES (v4 — stable):
// - Each player gets their full time limit to answer independently
// - Auto-advance when time expires OR all CONNECTED players have answered
// - Heartbeat tracking: players who don't poll for 8s are considered disconnected
// - Disconnected players don't block game flow
// - No creator-only dependency for game flow
// - Single source of truth: processAdvance is the ONLY function that advances state
// - TV state route must NOT duplicate advance logic

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

export interface GameRoom {
  code: string
  categoryName: string
  status: 'lobby' | 'playing' | 'showing-results' | 'finished'
  players: Map<string, Player>
  questions: Question[]
  currentQuestion: number
  timePerQuestion: number
  answers: Map<string, Answer>
  questionStartTime: number
  createdAt: number
  lastActivity: number
  lastQuestionResults: any | null
  advanceLock: boolean // prevent double-advance from concurrent polls
  autoAdvanceAt: number // timestamp when auto-advance should happen
  resultsReadyAt: number // timestamp when results became available
}

// ===== TIMING CONSTANTS =====
// How long before a player is considered disconnected (no poll)
const DISCONNECT_TIMEOUT_MS = 8 * 1000 // 8 seconds — fast enough for quiz pacing
// How long to wait after all players answer before revealing the answer
const REVEAL_DELAY_MS = 2000 // 2 seconds — brief suspense
// How long to show results before auto-continuing to next question
const RESULTS_DISPLAY_MS = 4000 // 4 seconds — enough time to read with 1.5s polling
// How long the advanceLock stays active to prevent double-advance
const ADVANCE_LOCK_MS = 2000 // 2 seconds — generous safety margin

// Global game store - use globalThis to persist across HMR reloads
const globalForStore = globalThis as any
if (!globalForStore.__gameRooms) {
  globalForStore.__gameRooms = new Map<string, GameRoom>()
}
const rooms: Map<string, GameRoom> = globalForStore.__gameRooms

// Cleanup old rooms (older than 2 hours)
function cleanupOldRooms() {
  const now = Date.now()
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > 2 * 60 * 60 * 1000) {
      rooms.delete(code)
    }
  }
}

// Run cleanup every 10 minutes
if (typeof globalThis !== 'undefined') {
  const g = globalThis as any
  if (!g.__gameCleanupInterval) {
    g.__gameCleanupInterval = setInterval(cleanupOldRooms, 10 * 60 * 1000)
  }
}

function generateRoomCode(): string {
  let code: string
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString()
  } while (rooms.has(code))
  return code
}

/**
 * Get the list of "connected" players — those who are:
 * 1. Not explicitly left (leftAt = 0 or undefined)
 * 2. Have polled within the disconnect timeout
 * This is the key function that prevents ghost players from blocking the game.
 */
export function getConnectedPlayers(room: GameRoom): Player[] {
  const now = Date.now()
  return Array.from(room.players.values()).filter(p => {
    if (p.leftAt) return false
    // If no lastPollAt yet, give them a grace period (they just joined)
    if (!p.lastPollAt) return true
    return (now - p.lastPollAt) < DISCONNECT_TIMEOUT_MS
  })
}

/**
 * Count answers from connected players only.
 * This avoids counting answers from players who left or disconnected.
 */
export function getConnectedAnswerCount(room: GameRoom): number {
  const connectedIds = new Set(getConnectedPlayers(room).map(p => p.id))
  let count = 0
  room.answers.forEach((_, pId) => {
    if (connectedIds.has(pId)) count++
  })
  return count
}

/**
 * Check if all connected players have answered and schedule auto-advance if so.
 * Returns true if all connected players have answered.
 */
function checkAllAnswered(room: GameRoom): boolean {
  if (room.status !== 'playing') return false

  const connected = getConnectedPlayers(room)
  if (connected.length === 0) return false

  const connectedAnswerCount = getConnectedAnswerCount(room)
  const allAnswered = connectedAnswerCount >= connected.length

  if (allAnswered) {
    // All connected players answered! Auto-advance after a brief suspense delay
    // Only set if not already set or if the existing one is further in the future
    const proposedTime = Date.now() + REVEAL_DELAY_MS
    if (room.autoAdvanceAt === 0 || room.autoAdvanceAt > proposedTime) {
      room.autoAdvanceAt = proposedTime
    }
  }

  return allAnswered
}

export function createRoom(data: {
  playerName: string
  categoryName: string
  questions: Question[]
  timePerQuestion: number
}): { code: string; playerId: string } {
  const code = generateRoomCode()
  const playerId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

  const room: GameRoom = {
    code,
    categoryName: data.categoryName,
    status: 'lobby',
    players: new Map(),
    questions: data.questions.map((q, i) => ({ ...q, order: i })),
    currentQuestion: 0,
    timePerQuestion: data.timePerQuestion || 15,
    answers: new Map(),
    questionStartTime: 0,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    lastQuestionResults: null,
    advanceLock: false,
    autoAdvanceAt: 0,
    resultsReadyAt: 0,
  }

  room.players.set(playerId, {
    id: playerId,
    name: data.playerName,
    score: 0,
    correctAnswers: 0,
    isCreator: true,
    lastPollAt: Date.now(),
  })

  rooms.set(code, room)
  return { code, playerId }
}

export function joinRoom(code: string, playerName: string): { playerId: string; room: GameRoom } | { error: string } {
  const room = rooms.get(code)
  if (!room) return { error: 'Room not found. Check the code and try again.' }
  if (room.status !== 'lobby') return { error: 'Game already in progress.' }
  if (room.players.size >= 50) return { error: 'Room is full (max 50 players).' }

  // Check for duplicate names
  const existingNames = Array.from(room.players.values()).map(p => p.name.toLowerCase())
  if (existingNames.includes(playerName.toLowerCase())) {
    return { error: 'A player with that name already exists.' }
  }

  const playerId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  room.players.set(playerId, {
    id: playerId,
    name: playerName,
    score: 0,
    correctAnswers: 0,
    isCreator: false,
    lastPollAt: Date.now(),
  })
  room.lastActivity = Date.now()

  return { playerId, room }
}

export function getRoom(code: string): GameRoom | null {
  return rooms.get(code) || null
}

export function getRoomPlayers(code: string): Player[] {
  const room = rooms.get(code)
  if (!room) return []
  return Array.from(room.players.values())
}

export function getLeaderboard(code: string): { id: string; name: string; score: number; correctAnswers: number; rank: number }[] {
  const room = rooms.get(code)
  if (!room) return []
  return Array.from(room.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }))
}

export function startGame(code: string, playerId: string): { success: boolean; error?: string } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players.get(playerId)
  if (!player || !player.isCreator) return { success: false, error: 'Only the creator can start the game' }

  room.status = 'playing'
  room.currentQuestion = 0
  room.answers.clear()
  room.questionStartTime = Date.now()
  room.lastActivity = Date.now()
  room.advanceLock = false
  room.autoAdvanceAt = Date.now() + (room.questions[0]?.timeLimit || room.timePerQuestion) * 1000

  // Reset all players' poll timestamps and answer state for new game
  room.players.forEach(p => {
    p.lastPollAt = Date.now()
    p.lastAnswer = undefined
  })

  return { success: true }
}

export function submitAnswer(code: string, playerId: string, answer: string): { success: boolean; error?: string; allAnswered?: boolean } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }
  if (room.status !== 'playing') return { success: false, error: 'Game is not in progress' }
  if (room.answers.has(playerId)) return { success: false, error: 'Already answered' }

  const timeElapsed = Date.now() - room.questionStartTime
  room.answers.set(playerId, { playerId, answer, time: timeElapsed })
  room.lastActivity = Date.now()

  // Save answer on player for reconnect
  const answerPlayer = room.players.get(playerId)
  if (answerPlayer) {
    answerPlayer.lastAnswer = answer
  }

  // Check if ALL CONNECTED players have answered
  const allAnswered = checkAllAnswered(room)

  return { success: true, allAnswered }
}

/**
 * THE ONLY function that processes question results and advances the game.
 * This is the single source of truth — no other code should advance the game state.
 * Exported so tv-state route can use it instead of duplicating logic.
 */
export function processAdvance(room: GameRoom): { questionResults: any; isFinished: boolean; leaderboard?: any } | null {
  if (room.advanceLock) return null
  room.advanceLock = true

  try {
    const question = room.questions[room.currentQuestion]
    if (!question) {
      room.advanceLock = false
      return null
    }

    const results: any[] = []
    room.answers.forEach((answerData, pId) => {
      const p = room.players.get(pId)
      if (!p) return

      const isCorrect = answerData.answer === question.correctAnswer
      let points = 0

      if (isCorrect) {
        // Points decrease with time: max 1000 (instant) down to 500 (50% at time limit)
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
    })

    // Add players who didn't answer (timed out) with 0 points
    room.players.forEach((p, pId) => {
      if (!room.answers.has(pId)) {
        results.push({
          playerId: pId,
          playerName: p.name,
          answer: null,
          correct: false,
          points: 0,
          timedOut: true,
        })
      }
    })

    const questionResults = {
      correctAnswer: question.correctAnswer,
      results,
      leaderboard: getLeaderboard(room.code),
      totalAnswers: room.answers.size,
      correctCount: results.filter(r => r.correct).length,
      totalPlayers: room.players.size,
    }

    // Store results for players to fetch
    room.lastQuestionResults = questionResults

    // Clear per-question state
    room.currentQuestion += 1
    room.answers.clear()
    room.autoAdvanceAt = 0

    // Clear lastAnswer on all players for the new question
    room.players.forEach(p => {
      p.lastAnswer = undefined
    })

    if (room.currentQuestion >= room.questions.length) {
      room.status = 'finished'
      room.lastActivity = Date.now()
      return {
        questionResults,
        leaderboard: getLeaderboard(room.code),
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
    // Release lock after a generous delay to prevent double-advance from concurrent polls
    setTimeout(() => { room.advanceLock = false }, ADVANCE_LOCK_MS)
  }
}

export function advanceToNextQuestion(code: string, playerId: string): { success: boolean; error?: string; questionResults?: any; leaderboard?: any; isFinished?: boolean } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players.get(playerId)
  if (!player) return { success: false, error: 'Player not in room' }

  if (room.status !== 'playing') return { success: false, error: 'Game is not in playing state' }

  const result = processAdvance(room)
  if (!result) return { success: false, error: 'Could not advance' }

  return {
    success: true,
    questionResults: result.questionResults,
    leaderboard: result.leaderboard,
    isFinished: result.isFinished,
  }
}

/**
 * Continue to the next question from showing-results state.
 * Can be triggered manually or automatically after RESULTS_DISPLAY_MS.
 */
export function continueToNextQuestion(code: string, playerId: string): { success: boolean; error?: string } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players.get(playerId)
  if (!player) return { success: false, error: 'Player not in room' }

  if (room.status !== 'showing-results') return { success: false, error: 'Not in showing-results state' }

  // Wait at least RESULTS_DISPLAY_MS before allowing continue
  if (room.resultsReadyAt && Date.now() - room.resultsReadyAt < RESULTS_DISPLAY_MS) {
    return { success: false, error: 'Please wait a moment before continuing' }
  }

  startNextQuestion(room)

  return { success: true }
}

/**
 * Start the next question — shared logic for auto-continue and manual continue.
 */
function startNextQuestion(room: GameRoom) {
  room.status = 'playing'
  room.questionStartTime = Date.now()
  room.lastActivity = Date.now()
  room.advanceLock = false
  room.resultsReadyAt = 0

  // Set auto-advance time for the new question
  const nextQ = room.questions[room.currentQuestion]
  room.autoAdvanceAt = Date.now() + (nextQ?.timeLimit || room.timePerQuestion) * 1000
}

export function updateQuestions(code: string, playerId: string, questions: Question[]): { success: boolean; error?: string } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players.get(playerId)
  if (!player || !player.isCreator) return { success: false, error: 'Only the creator can update questions' }
  if (room.status !== 'lobby') return { success: false, error: 'Can only update questions in lobby' }

  room.questions = questions.map((q, i) => ({ ...q, order: i }))
  room.lastActivity = Date.now()

  return { success: true }
}

/**
 * THE MAIN GAME STATE FUNCTION — called by player polling every 1.5s.
 * This is the only place where auto-advance and auto-continue are triggered.
 * The TV state route just reads the current state without modifying it.
 */
export function getGameState(code: string, playerId: string): any {
  const room = rooms.get(code)
  if (!room) return null

  const player = room.players.get(playerId)
  if (!player) return null

  // HEARTBEAT: Update player's last poll time
  player.lastPollAt = Date.now()
  room.lastActivity = Date.now()

  // STATE MACHINE TRANSITIONS — only triggered by player polls, not TV polls

  if (room.status === 'playing') {
    // AUTO-ADVANCE: If time has expired, advance to results
    if (room.autoAdvanceAt > 0 && Date.now() >= room.autoAdvanceAt) {
      processAdvance(room)
    }
    // Also check if all connected players have answered (in case autoAdvanceAt wasn't set yet)
    // This handles the case where checkAllAnswered was called before and set autoAdvanceAt,
    // but also the edge case where a player disconnects making remaining answers sufficient
    else {
      checkAllAnswered(room)
    }
  }

  if (room.status === 'showing-results') {
    // AUTO-CONTINUE: If results have been shown long enough, move to next question
    if (room.resultsReadyAt > 0 && Date.now() - room.resultsReadyAt >= RESULTS_DISPLAY_MS) {
      startNextQuestion(room)
    }
  }

  // Build the response based on current state
  const connected = getConnectedPlayers(room)
  const connectedCount = connected.length
  const connectedAnswerCount = getConnectedAnswerCount(room)

  const base = {
    code: room.code,
    categoryName: room.categoryName,
    status: room.status,
    players: getRoomPlayers(code),
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
      const hasAnswered = room.answers.has(playerId)
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
      leaderboard: getLeaderboard(code),
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
      leaderboard: room.lastQuestionResults?.leaderboard || getLeaderboard(code),
    }
  }

  return base
}

// Reconnect a player to their room after page refresh
export function reconnectPlayer(code: string, playerId: string): { success: boolean; error?: string; gameState?: any } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  const player = room.players.get(playerId)
  if (!player) return { success: false, error: 'Player not found in room' }

  // If player had left (quit), reactivate them
  if (player.leftAt) {
    player.leftAt = 0
    // Don't clear lastAnswer — they might be reconnecting mid-question
  }

  // Update heartbeat
  player.lastPollAt = Date.now()
  room.lastActivity = Date.now()

  // Return the current game state so the client can restore
  const gameState = getGameState(code, playerId)
  return { success: true, gameState }
}

export function leaveRoom(code: string, playerId: string): { success: boolean; roomDeleted?: boolean; wasCreator?: boolean } {
  const room = rooms.get(code)
  if (!room) return { success: false }

  const player = room.players.get(playerId)
  if (!player) return { success: false }

  const wasCreator = player.isCreator

  if (room.status === 'lobby') {
    // In lobby: fully remove the player
    room.players.delete(playerId)
    room.lastActivity = Date.now()

    // If creator leaves in lobby, transfer creator role or delete room
    if (wasCreator) {
      if (room.players.size > 0) {
        const newCreator = Array.from(room.players.values())[0]
        newCreator.isCreator = true
        room.lastActivity = Date.now()
        return { success: true, roomDeleted: false, wasCreator: true }
      } else {
        rooms.delete(code)
        return { success: true, roomDeleted: true, wasCreator: true }
      }
    }

    return { success: true, roomDeleted: false, wasCreator: false }
  } else {
    // In game (playing/showing-results): mark player as left but keep them for scoring
    player.leftAt = Date.now()
    room.lastActivity = Date.now()

    // If creator leaves mid-game, transfer creator role
    if (wasCreator) {
      const activePlayers = Array.from(room.players.values()).filter(p => !p.leftAt && p.id !== playerId)
      if (activePlayers.length > 0) {
        activePlayers[0].isCreator = true
      }
    }

    // Check if all remaining connected players have answered — if so, trigger auto-advance
    if (room.status === 'playing') {
      checkAllAnswered(room)

      // If no connected players remain, auto-advance immediately
      const connected = getConnectedPlayers(room)
      if (connected.length === 0) {
        room.autoAdvanceAt = Math.min(room.autoAdvanceAt || Infinity, Date.now() + 1000)
      }
    }

    return { success: true, roomDeleted: false, wasCreator }
  }
}

// Rejoin a room after quitting (reactivates the player)
export function rejoinRoom(code: string, playerId: string): { success: boolean; error?: string; gameState?: any } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found. It may have ended.' }

  const player = room.players.get(playerId)
  if (!player) return { success: false, error: 'Player not found in this room.' }

  // Reactivate the player
  player.leftAt = 0
  player.lastPollAt = Date.now()
  room.lastActivity = Date.now()

  // Return the current game state
  const gameState = getGameState(code, playerId)
  return { success: true, gameState }
}
