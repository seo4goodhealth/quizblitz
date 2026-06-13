import { NextRequest, NextResponse } from 'next/server'
import { joinRoom } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { code, playerName } = await req.json()

    if (!code || !playerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await joinRoom(code, playerName)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      playerId: result.playerId,
      code,
      categoryName: result.room.categoryName,
      totalQuestions: result.room.questions.length,
      players: Object.values(result.room.players),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
