import { NextRequest, NextResponse } from 'next/server'
import { getGameState } from '@/lib/game-store'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    const playerId = req.nextUrl.searchParams.get('playerId')

    if (!code || !playerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const state = getGameState(code, playerId)

    if (!state) {
      return NextResponse.json({ error: 'Room not found or player not in room' }, { status: 404 })
    }

    return NextResponse.json(state)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
