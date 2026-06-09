import { NextRequest, NextResponse } from 'next/server'
import { rejoinRoom } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { code, playerId } = await req.json()

    if (!code || !playerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = rejoinRoom(code, playerId)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
