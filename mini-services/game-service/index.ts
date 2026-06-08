import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Types
interface Player {
  id: string
  name: string
  score: number
  correctAnswers: number
  isCreator: boolean
  socketId: string
}

interface Question {
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

interface GameRoom {
  code: string
  categoryName: string
  status: 'lobby' | 'playing' | 'question' | 'results' | 'finished'
  players: Map<string, Player>
  questions: Question[]
  currentQuestion: number
  timePerQuestion: number
  answers: Map<string, { answer: string; time: number }>
  questionStartTime: number
  questionTimer: ReturnType<typeof setTimeout> | null
}

const rooms = new Map<string, GameRoom>()

function generateRoomCode(): string {
  let code: string
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString()
  } while (rooms.has(code))
  return code
}

function getRoomPlayers(room: GameRoom) {
  return Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    correctAnswers: p.correctAnswers,
    isCreator: p.isCreator
  }))
}

function getCurrentQuestion(room: GameRoom) {
  if (room.currentQuestion >= room.questions.length) return null
  const q = room.questions[room.currentQuestion]
  return {
    id: q.id,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    timeLimit: q.timeLimit,
    order: q.order,
    questionNumber: room.currentQuestion + 1,
    totalQuestions: room.questions.length
  }
}

function getLeaderboard(room: GameRoom) {
  return Array.from(room.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      correctAnswers: p.correctAnswers,
      rank: index + 1
    }))
}

function processQuestionResults(room: GameRoom) {
  const question = room.questions[room.currentQuestion]
  if (!question) return

  const results: { playerId: string; playerName: string; answer: string; correct: boolean; points: number; timeElapsed: number }[] = []

  room.answers.forEach((answerData, playerId) => {
    const player = room.players.get(playerId)
    if (!player) return

    const isCorrect = answerData.answer === question.correctAnswer
    let points = 0
    const timeElapsed = answerData.time

    if (isCorrect) {
      // Points based on speed: faster = more points (max 1000, min 100)
      const timeRatio = Math.max(0, 1 - (timeElapsed / (question.timeLimit * 1000)))
      points = Math.round(100 + timeRatio * 900)
      player.score += points
      player.correctAnswers += 1
    }

    results.push({
      playerId,
      playerName: player.name,
      answer: answerData.answer,
      correct: isCorrect,
      points,
      timeElapsed
    })
  })

  return {
    correctAnswer: question.correctAnswer,
    results,
    leaderboard: getLeaderboard(room),
    totalAnswers: room.answers.size,
    correctCount: results.filter(r => r.correct).length
  }
}

function advanceToNextQuestion(roomCode: string) {
  const room = rooms.get(roomCode)
  if (!room) return

  // Process current question results
  const result = processQuestionResults(room)

  // Send results to all players
  io.to(roomCode).emit('question-results', result)

  // After showing results, advance to next question or finish
  setTimeout(() => {
    room.currentQuestion += 1
    room.answers.clear()
    room.questionStartTime = 0

    if (room.currentQuestion >= room.questions.length) {
      // Game finished
      room.status = 'finished'
      if (room.questionTimer) {
        clearTimeout(room.questionTimer)
        room.questionTimer = null
      }
      io.to(roomCode).emit('game-over', {
        leaderboard: getLeaderboard(room)
      })
    } else {
      // Next question
      room.status = 'playing'
      room.questionStartTime = Date.now()
      io.to(roomCode).emit('next-question', getCurrentQuestion(room))

      // Set timer for question
      const q = room.questions[room.currentQuestion]
      if (room.questionTimer) clearTimeout(room.questionTimer)
      room.questionTimer = setTimeout(() => {
        advanceToNextQuestion(roomCode)
      }, q.timeLimit * 1000 + 500) // Extra 500ms for buffer
    }
  }, 5000) // 5 seconds to show results
}

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`)

  // Create a new game room
  socket.on('create-room', (data: { playerName: string; categoryName: string; questions: Question[]; timePerQuestion: number }) => {
    const { playerName, categoryName, questions, timePerQuestion } = data
    const code = generateRoomCode()

    const room: GameRoom = {
      code,
      categoryName,
      status: 'lobby',
      players: new Map(),
      questions: questions.map((q, i) => ({ ...q, order: i })),
      currentQuestion: 0,
      timePerQuestion: timePerQuestion || 15,
      answers: new Map(),
      questionStartTime: 0,
      questionTimer: null
    }

    // Add creator as player
    const creatorId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const creator: Player = {
      id: creatorId,
      name: playerName,
      score: 0,
      correctAnswers: 0,
      isCreator: true,
      socketId: socket.id
    }
    room.players.set(creatorId, creator)

    rooms.set(code, room)
    socket.join(code)

    socket.emit('room-created', {
      code,
      playerId: creatorId,
      playerName,
      isCreator: true,
      players: getRoomPlayers(room),
      categoryName,
      totalQuestions: questions.length
    })

    console.log(`Room created: ${code} by ${playerName}, category: ${categoryName}`)
  })

  // Join an existing room
  socket.on('join-room', (data: { code: string; playerName: string }) => {
    const { code, playerName } = data
    const room = rooms.get(code)

    if (!room) {
      socket.emit('join-error', { message: 'Room not found. Check the code and try again.' })
      return
    }

    if (room.status !== 'lobby') {
      socket.emit('join-error', { message: 'Game already in progress.' })
      return
    }

    if (room.players.size >= 50) {
      socket.emit('join-error', { message: 'Room is full (max 50 players).' })
      return
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      correctAnswers: 0,
      isCreator: false,
      socketId: socket.id
    }
    room.players.set(playerId, player)
    socket.join(code)

    socket.emit('room-joined', {
      code,
      playerId,
      playerName,
      isCreator: false,
      players: getRoomPlayers(room),
      categoryName: room.categoryName,
      totalQuestions: room.questions.length
    })

    // Notify everyone in the room
    io.to(code).emit('player-joined', {
      players: getRoomPlayers(room),
      newPlayer: { id: playerId, name: playerName }
    })

    console.log(`${playerName} joined room ${code}`)
  })

  // Start the game (creator only)
  socket.on('start-game', (data: { code: string; playerId: string }) => {
    const { code, playerId } = data
    const room = rooms.get(code)

    if (!room) return

    const player = room.players.get(playerId)
    if (!player || !player.isCreator) return

    room.status = 'playing'
    room.currentQuestion = 0
    room.answers.clear()
    room.questionStartTime = Date.now()

    io.to(code).emit('game-started', {
      totalQuestions: room.questions.length,
      categoryName: room.categoryName
    })

    // Send first question after brief delay
    setTimeout(() => {
      io.to(code).emit('next-question', getCurrentQuestion(room))

      // Set timer for first question
      const q = room.questions[0]
      if (room.questionTimer) clearTimeout(room.questionTimer)
      room.questionTimer = setTimeout(() => {
        advanceToNextQuestion(code)
      }, q.timeLimit * 1000 + 500)
    }, 2000)

    console.log(`Game started in room ${code}`)
  })

  // Submit answer
  socket.on('submit-answer', (data: { code: string; playerId: string; answer: string }) => {
    const { code, playerId, answer } = data
    const room = rooms.get(code)

    if (!room || room.status !== 'playing') return
    if (room.answers.has(playerId)) return // Already answered

    const timeElapsed = Date.now() - room.questionStartTime
    room.answers.set(playerId, { answer, time: timeElapsed })

    // Notify player that answer was received
    socket.emit('answer-received', {
      questionNumber: room.currentQuestion + 1,
      answerCount: room.answers.size,
      totalPlayers: room.players.size
    })

    // If all players answered, advance immediately
    if (room.answers.size >= room.players.size) {
      if (room.questionTimer) {
        clearTimeout(room.questionTimer)
        room.questionTimer = null
      }
      advanceToNextQuestion(code)
    }
  })

  // Update questions (creator modifies)
  socket.on('update-questions', (data: { code: string; playerId: string; questions: Question[] }) => {
    const { code, playerId, questions } = data
    const room = rooms.get(code)

    if (!room) return

    const player = room.players.get(playerId)
    if (!player || !player.isCreator) return
    if (room.status !== 'lobby') return

    room.questions = questions.map((q, i) => ({ ...q, order: i }))
    room.currentQuestion = 0

    io.to(code).emit('questions-updated', {
      totalQuestions: questions.length
    })

    console.log(`Questions updated in room ${code}`)
  })

  // Get room info (reconnection support)
  socket.on('get-room-info', (data: { code: string; playerId: string }) => {
    const { code, playerId } = data
    const room = rooms.get(code)

    if (!room) {
      socket.emit('room-info-error', { message: 'Room not found' })
      return
    }

    const player = room.players.get(playerId)
    if (!player) {
      socket.emit('room-info-error', { message: 'Player not found' })
      return
    }

    // Update socket ID for reconnection
    player.socketId = socket.id
    socket.join(code)

    socket.emit('room-info', {
      code,
      playerId,
      playerName: player.name,
      isCreator: player.isCreator,
      players: getRoomPlayers(room),
      categoryName: room.categoryName,
      status: room.status,
      totalQuestions: room.questions.length,
      currentQuestion: room.currentQuestion
    })
  })

  // Player leaves
  socket.on('leave-room', (data: { code: string; playerId: string }) => {
    const { code, playerId } = data
    const room = rooms.get(code)
    if (!room) return

    const player = room.players.get(playerId)
    if (!player) return

    room.players.delete(playerId)
    socket.leave(code)

    io.to(code).emit('player-left', {
      players: getRoomPlayers(room),
      leftPlayer: { id: playerId, name: player.name }
    })

    // If creator leaves, end game
    if (player.isCreator) {
      io.to(code).emit('game-cancelled', { message: 'The creator left the game.' })
      if (room.questionTimer) clearTimeout(room.questionTimer)
      rooms.delete(code)
    }

    // If room empty, clean up
    if (room.players.size === 0) {
      if (room.questionTimer) clearTimeout(room.questionTimer)
      rooms.delete(code)
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    // Find and handle player disconnect
    for (const [code, room] of rooms.entries()) {
      for (const [playerId, player] of room.players.entries()) {
        if (player.socketId === socket.id) {
          room.players.delete(playerId)
          socket.leave(code)

          io.to(code).emit('player-left', {
            players: getRoomPlayers(room),
            leftPlayer: { id: playerId, name: player.name }
          })

          if (player.isCreator) {
            io.to(code).emit('game-cancelled', { message: 'The creator left the game.' })
            if (room.questionTimer) clearTimeout(room.questionTimer)
            rooms.delete(code)
          } else if (room.players.size === 0) {
            if (room.questionTimer) clearTimeout(room.questionTimer)
            rooms.delete(code)
          }
          break
        }
      }
    }
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Game WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('Shutting down game server...')
  httpServer.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Shutting down game server...')
  httpServer.close(() => {
    process.exit(0)
  })
})
