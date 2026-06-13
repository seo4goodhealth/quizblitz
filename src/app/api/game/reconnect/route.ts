import { NextRequest, NextResponse } from 'next/server'
import { reconnectPlayer } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { code, playerId } = await req.json()

    if (!code || !playerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await reconnectPlayer(code, playerId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({ success: true, gameState: result.gameState })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
