import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { name, categoryName, questions, difficulty, timePerQuestion } = await req.json()

    if (!name || !categoryName || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Name, category, and questions are required' },
        { status: 400 }
      )
    }

    const quiz = await db.savedQuiz.create({
      data: {
        name,
        categoryName,
        userId: session.user.id,
        questions: JSON.stringify(questions),
        difficulty: difficulty || 'mixed',
        timePerQuestion: timePerQuestion || 15,
      },
    })

    return NextResponse.json({
      id: quiz.id,
      name: quiz.name,
      categoryName: quiz.categoryName,
      createdAt: quiz.createdAt,
    })
  } catch (error: any) {
    console.error('Save quiz error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
