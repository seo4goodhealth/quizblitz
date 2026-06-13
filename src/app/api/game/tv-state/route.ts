import { NextRequest, NextResponse } from 'next/server'
import { getRoom, getRoomPlayers, getLeaderboard, getConnectedPlayers, getConnectedAnswerCount, processAdvance } from '@/lib/game-store'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Missing room code' }, { status: 400 })
    }

    const room = await getRoom(code)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // IMPORTANT: The TV route does NOT trigger state transitions.
    // Only player polls (getGameState) advance the game state.
    // This prevents race conditions and duplicate advances.
    //
    // The only exception: if the TV is the ONLY thing polling (all players disconnected),
    // we need to advance the game so it doesn't get stuck forever.

    if (room.status === 'playing') {
      const connected = getConnectedPlayers(room)
      if (connected.length === 0 && room.autoAdvanceAt > 0 && Date.now() >= room.autoAdvanceAt) {
        await processAdvance(room)
      }
    }

    const players = await getRoomPlayers(code)
    const connectedPlayers = getConnectedPlayers(room)
    const connectedAnswerCount = getConnectedAnswerCount(room)

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
            answerCount: connectedAnswerCount,
            totalPlayers: connectedPlayers.length,
          },
        })
      }
    }

    if (room.status === 'finished') {
      return NextResponse.json({
        ...base,
        leaderboard: await getLeaderboard(code),
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
