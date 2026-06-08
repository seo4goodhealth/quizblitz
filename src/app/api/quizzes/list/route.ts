import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const quizzes = await db.savedQuiz.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { updatedAt: 'desc' },
    })

    const quizzesWithCount = quizzes.map((q) => {
      let questionCount = 0
      try {
        questionCount = JSON.parse(q.questions).length
      } catch {
        questionCount = 0
      }
      return {
        id: q.id,
        name: q.name,
        categoryName: q.categoryName,
        difficulty: q.difficulty,
        timePerQuestion: q.timePerQuestion,
        questionCount,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      }
    })

    return NextResponse.json({ quizzes: quizzesWithCount })
  } catch (error: any) {
    console.error('List quizzes error:', error)
    if (error?.code === 'P1001' || error?.message?.includes('connect')) {
      return NextResponse.json(
        { error: 'Database not configured. Please set up DATABASE_URL.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to load quizzes' },
      { status: 500 }
    )
  }
}
