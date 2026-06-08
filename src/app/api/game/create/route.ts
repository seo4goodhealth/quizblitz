import { NextRequest, NextResponse } from 'next/server'
import { createRoom } from '@/lib/game-store'

export async function POST(req: NextRequest) {
  try {
    const { playerName, categoryName, questions, timePerQuestion } = await req.json()

    if (!playerName || !categoryName || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = createRoom({ playerName, categoryName, questions, timePerQuestion })
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
