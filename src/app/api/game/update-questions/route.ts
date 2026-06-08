import { NextRequest, NextResponse } from 'next/server'
import { updateQuestions } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { code, playerId, questions } = await req.json()

    if (!code || !playerId || !questions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = updateQuestions(code, playerId, questions)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
