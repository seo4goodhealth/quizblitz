import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get current week's Monday
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // Get all game results for this week
    const weekResults = await db.gameResult.findMany({
      where: {
        createdAt: {
          gte: monday,
          lte: sunday,
        },
      },
      orderBy: {
        score: 'desc',
      },
    })

    // Group by playerName (or userId if available), take the BEST score per player
    const playerBestScores = new Map<string, {
      playerName: string
      bestScore: number
      totalGames: number
      totalCorrectAnswers: number
      userId?: string
    }>()

    for (const result of weekResults) {
      const key = result.userId || result.playerName
      const existing = playerBestScores.get(key)

      if (!existing) {
        playerBestScores.set(key, {
          playerName: result.playerName,
          bestScore: result.score,
          totalGames: 1,
          totalCorrectAnswers: result.correctAnswers,
          userId: result.userId || undefined,
        })
      } else {
        existing.totalGames += 1
        existing.totalCorrectAnswers += result.correctAnswers
        if (result.score > existing.bestScore) {
          existing.bestScore = result.score
        }
      }
    }

    // Sort by best score descending and take top 50
    const rankings = Array.from(playerBestScores.values())
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 50)
      .map((entry, index) => ({
        rank: index + 1,
        playerName: entry.playerName,
        bestScore: entry.bestScore,
        totalGames: entry.totalGames,
        totalCorrectAnswers: entry.totalCorrectAnswers,
        userId: entry.userId,
      }))

    return NextResponse.json({
      rankings,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching Hall of Fame:', error)
    return NextResponse.json({ error: 'Failed to fetch Hall of Fame' }, { status: 500 })
  }
}
