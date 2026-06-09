import { NextRequest, NextResponse } from 'next/server'
import { getRoom, getRoomPlayers, getLeaderboard } from '@/lib/game-store'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Missing room code' }, { status: 400 })
    }

    const room = getRoom(code)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Trigger auto-advance check (same logic as getGameState)
    // This ensures the TV display also triggers auto-advance
    if (room.status === 'playing' && room.autoAdvanceAt > 0 && Date.now() >= room.autoAdvanceAt) {
      // Process the advance inline
      if (!room.advanceLock) {
        room.advanceLock = true
        try {
          const question = room.questions[room.currentQuestion]
          if (question) {
            const results: any[] = []
            room.answers.forEach((answerData, pId) => {
              const p = room.players.get(pId)
              if (!p) return
              const isCorrect = answerData.answer === question.correctAnswer
              let points = 0
              if (isCorrect) {
                const timeRatio = Math.max(0, 1 - (answerData.time / (question.timeLimit * 1000)))
                points = Math.round(100 + timeRatio * 900)
                p.score += points
                p.correctAnswers += 1
              }
              results.push({ playerId: pId, playerName: p.name, answer: answerData.answer, correct: isCorrect, points })
            })
            room.players.forEach((p, pId) => {
              if (!room.answers.has(pId)) {
                results.push({ playerId: pId, playerName: p.name, answer: null, correct: false, points: 0, timedOut: true })
              }
            })
            room.lastQuestionResults = {
              correctAnswer: question.correctAnswer,
              results,
              leaderboard: getLeaderboard(code),
              totalAnswers: room.answers.size,
              correctCount: results.filter(r => r.correct).length,
              totalPlayers: room.players.size,
            }
            room.currentQuestion += 1
            room.answers.clear()
            if (room.currentQuestion >= room.questions.length) {
              room.status = 'finished'
            } else {
              room.status = 'showing-results'
              room.resultsReadyAt = Date.now()
            }
            room.lastActivity = Date.now()
          }
        } finally {
          setTimeout(() => { room.advanceLock = false }, 500)
        }
      }
    }

    // Auto-continue from showing-results after 5 seconds
    if (room.status === 'showing-results' && room.resultsReadyAt > 0 && Date.now() - room.resultsReadyAt >= 5000) {
      room.status = 'playing'
      room.questionStartTime = Date.now()
      room.advanceLock = false
      const nextQ = room.questions[room.currentQuestion]
      room.autoAdvanceAt = Date.now() + (nextQ?.timeLimit || room.timePerQuestion) * 1000 + 2000
      room.resultsReadyAt = 0
    }

    const players = getRoomPlayers(code)

    const base = {
      code: room.code,
      categoryName: room.categoryName,
      status: room.status,
      players,
      totalQuestions: room.questions.length,
      currentQuestionIndex: room.currentQuestion,
      timePerQuestion: room.timePerQuestion,
    }

    if (room.status === 'playing') {
      const q = room.questions[room.currentQuestion]
      if (q) {
        const elapsed = (Date.now() - room.questionStartTime) / 1000
        const timeLeft = Math.max(0, q.timeLimit - elapsed)

        return NextResponse.json({
          ...base,
          currentQuestion: {
            id: q.id,
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            timeLimit: q.timeLimit,
            questionNumber: room.currentQuestion + 1,
            totalQuestions: room.questions.length,
            timeLeft: Math.round(timeLeft * 10) / 10,
            answerCount: room.answers.size,
            totalPlayers: room.players.size,
          },
        })
      }
    }

    if (room.status === 'finished') {
      return NextResponse.json({
        ...base,
        leaderboard: getLeaderboard(code),
      })
    }

    if (room.status === 'showing-results') {
      return NextResponse.json({
        ...base,
        questionResults: room.lastQuestionResults,
      })
    }

    return NextResponse.json(base)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
