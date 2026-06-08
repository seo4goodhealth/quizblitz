import { NextRequest, NextResponse } from 'next/server'
import { getBankQuestions } from '@/lib/question-bank'

async function callAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  // 1. Try Google Gemini (FREE - 15 requests/minute, no credit card)
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 4000,
            },
          }),
        }
      )
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch (e) {
      console.error('Gemini API error:', e)
    }
  }

  // 2. Try OpenAI (paid, but user may have a key)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    try {
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
    } catch (e) {
      console.error('OpenAI API error:', e)
    }
  }

  // 3. Try z-ai-web-dev-sdk (works in this dev environment)
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

    // STEP 1: Try AI generation first (if any API key is configured)
    const hasAI = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    if (hasAI) {
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

      if (content) {
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          const jsonStr = jsonMatch ? jsonMatch[0] : content
          const questions = JSON.parse(jsonStr)

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

          return NextResponse.json({ questions: validatedQuestions, source: 'ai' })
        } catch (e) {
          console.error('Failed to parse AI response, falling back to bank')
        }
      }
    }

    // STEP 2: Fall back to built-in question bank (FREE, no API needed)
    const bankQuestions = getBankQuestions(category, count)

    if (bankQuestions.length > 0) {
      return NextResponse.json({ 
        questions: bankQuestions, 
        source: 'bank',
        note: hasAI ? undefined : 'Using built-in questions. Set GEMINI_API_KEY (free) for AI-generated questions.'
      })
    }

    // STEP 3: No questions available at all
    return NextResponse.json({ 
      error: 'No questions available for this category. Please try another category or set up a free Gemini API key at https://aistudio.google.com/apikey',
      hasAI: false 
    }, { status: 404 })

  } catch (error: any) {
    console.error('Generate questions error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
