import { NextRequest, NextResponse } from 'next/server'
import { advanceToNextQuestion } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { code, playerId } = await req.json()

    if (!code || !playerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await advanceToNextQuestion(code, playerId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      questionResults: result.questionResults,
      leaderboard: result.leaderboard,
      isFinished: result.isFinished,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
