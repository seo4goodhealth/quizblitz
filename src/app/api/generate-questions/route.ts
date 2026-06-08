import { NextRequest, NextResponse } from 'next/server'

async function callAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  // Try OpenAI first (works on Vercel, cPanel, any hosting)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: openaiKey })
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    })
    return completion.choices[0]?.message?.content || null
  }

  // Fallback: try z-ai-web-dev-sdk (works in this dev environment)
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    })
    return completion.choices[0]?.message?.content || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { category, count = 10, difficulty = 'mixed' } = await req.json()

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const systemPrompt = 'You are a quiz question generator. You generate high-quality, accurate multiple choice questions. You always respond with valid JSON only, no markdown or extra text.'

    const userPrompt = `Generate ${count} multiple choice quiz questions about "${category}". 
Difficulty level: ${difficulty}.

IMPORTANT: Return ONLY a valid JSON array with no other text. Each question must have this exact structure:
[
  {
    "text": "The question text",
    "optionA": "First option",
    "optionB": "Second option", 
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correctAnswer": "optionA",
    "timeLimit": 15
  }
]

Rules:
- correctAnswer must be exactly one of: "optionA", "optionB", "optionC", or "optionD"
- All 4 options must be plausible but only one correct
- Questions should be interesting and challenging
- For Bible Quiz category, use accurate biblical references
- timeLimit should be between 10-30 seconds based on difficulty
- Return ONLY the JSON array, no markdown, no explanation`

    const content = await callAI(systemPrompt, userPrompt)

    if (!content) {
      return NextResponse.json({ 
        error: 'AI service not configured. Please set the OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    // Parse the JSON response
    let questions
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      questions = JSON.parse(jsonStr)
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json({ error: 'Failed to parse generated questions', raw: content }, { status: 500 })
    }

    // Validate and format questions
    const validatedQuestions = questions.map((q: any, i: number) => ({
      id: `q_${Date.now()}_${i}`,
      text: q.text || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || 'optionA',
      timeLimit: q.timeLimit || 15,
      order: i
    }))

    return NextResponse.json({ questions: validatedQuestions })
  } catch (error: any) {
    console.error('Generate questions error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
