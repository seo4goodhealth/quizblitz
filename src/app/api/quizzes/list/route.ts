import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const quizzes = await db.savedQuiz.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        categoryName: true,
        difficulty: true,
        timePerQuestion: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Add question count by parsing the JSON
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (q) => {
        const fullQuiz = await db.savedQuiz.findUnique({
          where: { id: q.id },
          select: { questions: true },
        })
        let questionCount = 0
        if (fullQuiz?.questions) {
          try {
            questionCount = JSON.parse(fullQuiz.questions).length
          } catch {
            questionCount = 0
          }
        }
        return { ...q, questionCount }
      })
    )

    return NextResponse.json({ quizzes: quizzesWithCount })
  } catch (error: any) {
    console.error('List quizzes error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
