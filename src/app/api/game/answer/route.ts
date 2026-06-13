import { NextRequest, NextResponse } from 'next/server'
import { submitAnswer } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { code, playerId, answer } = await req.json()

    if (!code || !playerId || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await submitAnswer(code, playerId, answer)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
