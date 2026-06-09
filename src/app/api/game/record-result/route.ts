import { NextRequest, NextResponse } from 'next/server'
import { getRoom, getLeaderboard } from '@/lib/game-store'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 })
    }

    const room = getRoom(code)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'finished') {
      return NextResponse.json({ error: 'Game is not finished yet' }, { status: 400 })
    }

    const leaderboard = getLeaderboard(code)

    // Record results for each player
    const results: any[] = []
    for (const player of leaderboard) {
      // Check if result already recorded for this player in this room
      const existing = await db.gameResult.findFirst({
        where: {
          playerName: player.name,
          roomId: code,
          categoryName: room.categoryName,
        },
      })

      if (existing) {
        results.push(existing)
        continue
      }

      const gameResult = await db.gameResult.create({
        data: {
          playerName: player.name,
          score: player.score,
          correctAnswers: player.correctAnswers,
          totalQuestions: room.questions.length,
          categoryName: room.categoryName,
          roomId: code,
        },
      })

      results.push(gameResult)
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error recording game results:', error)
    return NextResponse.json({ error: 'Failed to record results' }, { status: 500 })
  }
}
