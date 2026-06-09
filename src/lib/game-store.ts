// In-memory game store for server-side game state management
// This runs on the Next.js server and handles all game logic
//
// KEY DESIGN PRINCIPLES (v2):
// - Each player gets their full time limit to answer independently
// - Auto-advance when time expires OR all players have answered
// - No creator-only dependency for game flow
// - Session persistence via localStorage on client, reconnect API

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
  leftAt?: number // Timestamp when player left (0 = active)
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
  room.autoAdvanceAt = Date.now() + (room.questions[0]?.timeLimit || room.timePerQuestion) * 1000 // Advance immediately when time expires

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

  // Check if ALL ACTIVE players have answered - if so, schedule auto-advance soon
  const activePlayers = Array.from(room.players.values()).filter(p => !p.leftAt)
  const allAnswered = activePlayers.length > 0 && room.answers.size >= activePlayers.length
  if (allAnswered) {
    // All active players answered! Auto-advance in 2 seconds so they can see correct answer feedback
    room.autoAdvanceAt = Date.now() + 2000
  }

  return { success: true, allAnswered }
}

// Internal function to process question results and advance
function processAdvance(room: GameRoom): { questionResults: any; isFinished: boolean; leaderboard?: any } | null {
  if (room.advanceLock) return null
  room.advanceLock = true

  try {
    const question = room.questions[room.currentQuestion]
    if (!question) return null

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

    // Advance to next question
    room.currentQuestion += 1
    room.answers.clear()

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
    // Release lock after a short delay to prevent concurrent advances
    setTimeout(() => { room.advanceLock = false }, 500)
  }
}

export function advanceToNextQuestion(code: string, playerId: string): { success: boolean; error?: string; questionResults?: any; leaderboard?: any; isFinished?: boolean } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  // Any player can trigger advance (no creator-only restriction)
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

export function continueToNextQuestion(code: string, playerId: string): { success: boolean; error?: string } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: 'Room not found' }

  // Any player can continue (no creator-only restriction)
  const player = room.players.get(playerId)
  if (!player) return { success: false, error: 'Player not in room' }

  if (room.status !== 'showing-results') return { success: false, error: 'Not in showing-results state' }

  // Wait at least 3 seconds on results before continuing
  if (room.resultsReadyAt && Date.now() - room.resultsReadyAt < 3000) {
    return { success: false, error: 'Please wait a moment before continuing' }
  }

  room.status = 'playing'
  room.questionStartTime = Date.now()
  room.lastActivity = Date.now()
  room.advanceLock = false

  // Set auto-advance time for the new question
  const nextQ = room.questions[room.currentQuestion]
  room.autoAdvanceAt = Date.now() + (nextQ?.timeLimit || room.timePerQuestion) * 1000

  return { success: true }
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

export function getGameState(code: string, playerId: string): any {
  const room = rooms.get(code)
  if (!room) return null

  const player = room.players.get(playerId)
  if (!player) return null

  // AUTO-ADVANCE CHECK: If time has expired or all players answered, auto-advance
  if (room.status === 'playing' && room.autoAdvanceAt > 0 && Date.now() >= room.autoAdvanceAt) {
    processAdvance(room)
  }

  // AUTO-CONTINUE CHECK: If showing results for more than 3 seconds, auto-continue
  if (room.status === 'showing-results' && room.resultsReadyAt > 0 && Date.now() - room.resultsReadyAt >= 3000) {
    room.status = 'playing'
    room.questionStartTime = Date.now()
    room.advanceLock = false
    const nextQ = room.questions[room.currentQuestion]
    room.autoAdvanceAt = Date.now() + (nextQ?.timeLimit || room.timePerQuestion) * 1000
    room.resultsReadyAt = 0
  }

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

      return {
        ...base,
        currentQuestion: {
          id: q.id,
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          timeLimit: q.timeLimit,
          questionNumber: room.currentQuestion + 1,
          totalQuestions: room.questions.length,
          timeLeft: Math.round(timeLeft * 10) / 10,
          hasAnswered,
          lastAnswer,
          answerCount: room.answers.size,
          totalPlayers: room.players.size,
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
    player.lastAnswer = undefined
  }

  room.lastActivity = Date.now()

  // Return the current game state so the client can restore
  const gameState = getGameState(code, playerId)
  return { success: true, gameState }
}

// Get count of active (non-left) players in a room
function getActivePlayerCount(room: GameRoom): number {
  return Array.from(room.players.values()).filter(p => !p.leftAt).length
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
        // Transfer creator to the first remaining player
        const newCreator = Array.from(room.players.values())[0]
        newCreator.isCreator = true
        room.lastActivity = Date.now()
        return { success: true, roomDeleted: false, wasCreator: true }
      } else {
        // No players left, delete room
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

    // Check if all remaining active players have answered — if so, trigger auto-advance
    const activePlayers = Array.from(room.players.values()).filter(p => !p.leftAt)
    if (room.status === 'playing' && activePlayers.length > 0) {
      const activeAnswerCount = Array.from(room.answers.keys()).filter(pId => {
        const p = room.players.get(pId)
        return p && !p.leftAt
      }).length
      if (activeAnswerCount >= activePlayers.length) {
        room.autoAdvanceAt = Date.now() + 2000
      }
    } else if (activePlayers.length === 0) {
      // No active players left — delete room
      rooms.delete(code)
      return { success: true, roomDeleted: true, wasCreator }
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
  player.leftAt = 0 // Clear the left timestamp
  player.lastAnswer = undefined
  room.lastActivity = Date.now()

  // Return the current game state
  const gameState = getGameState(code, playerId)
  return { success: true, gameState }
}
