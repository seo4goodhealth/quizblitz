import { NextRequest, NextResponse } from 'next/server'
import { getBankQuestions } from '@/lib/question-bank'
import { translate } from '@vitalets/google-translate-api'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish (Español)',
  ro: 'Romanian (Română)',
  ca: 'Catalan (Català)',
  it: 'Italian (Italiano)',
  fr: 'French (Français)',
}

const GT_LANG_CODES: Record<string, string> = {
  en: 'en',
  es: 'es',
  ro: 'ro',
  ca: 'ca',
  it: 'it',
  fr: 'fr',
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  // 1. Try DeepSeek (super cheap, works globally, OpenAI-compatible)
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (deepseekKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      })
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (text) return text
    } catch (e) {
      console.error('DeepSeek API error:', e)
    }
  }

  // 2. Try Google Gemini (free tier, but region-restricted)
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

  // 3. Try OpenAI (paid, OpenAI-compatible)
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

  // 4. Try z-ai-web-dev-sdk (works in this dev environment)
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

/**
 * Translate questions using the free Google Translate API
 * Translates each text field individually to preserve structure
 */
async function translateQuestionsWithGoogle(
  questions: any[],
  targetLang: string
): Promise<any[]> {
  const langCode = GT_LANG_CODES[targetLang] || 'en'
  if (langCode === 'en') return questions

  try {
    const translatedQuestions = await Promise.all(
      questions.map(async (q) => {
        try {
          // Translate all text fields in parallel
          const [textRes, optARes, optBRes, optCRes, optDRes] = await Promise.all([
            translate(q.text, { from: 'en', to: langCode }),
            translate(q.optionA, { from: 'en', to: langCode }),
            translate(q.optionB, { from: 'en', to: langCode }),
            translate(q.optionC, { from: 'en', to: langCode }),
            translate(q.optionD, { from: 'en', to: langCode }),
          ])

          return {
            ...q,
            text: textRes.text || q.text,
            optionA: optARes.text || q.optionA,
            optionB: optBRes.text || q.optionB,
            optionC: optCRes.text || q.optionC,
            optionD: optDRes.text || q.optionD,
          }
        } catch (err) {
          console.error('Failed to translate question:', q.id, err)
          return q // Return original on error
        }
      })
    )
    return translatedQuestions
  } catch (err) {
    console.error('Google Translate batch error:', err)
    return questions
  }
}

export async function POST(req: NextRequest) {
  try {
    const { category, count = 10, difficulty = 'mixed', locale = 'en' } = await req.json()

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const targetLanguage = LANGUAGE_NAMES[locale] || LANGUAGE_NAMES.en
    const isNonEnglish = locale !== 'en'

    // STEP 1: Try AI generation first (if any API key is configured)
    const hasAI = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    if (hasAI) {
      const systemPrompt = `You are a quiz question generator. You generate high-quality, accurate multiple choice questions. You always respond with valid JSON only, no markdown or extra text. You generate questions in ${targetLanguage}.`

      const userPrompt = `Generate ${count} multiple choice quiz questions about "${category}". 
Difficulty level: ${difficulty}.
Language: ${targetLanguage}. ALL questions and options MUST be written in ${targetLanguage}.

IMPORTANT: Return ONLY a valid JSON array with no other text. Each question must have this exact structure:
[
  {
    "text": "The question text in ${targetLanguage}",
    "optionA": "First option in ${targetLanguage}",
    "optionB": "Second option in ${targetLanguage}", 
    "optionC": "Third option in ${targetLanguage}",
    "optionD": "Fourth option in ${targetLanguage}",
    "correctAnswer": "optionA",
    "timeLimit": 15
  }
]

Rules:
- correctAnswer must be exactly one of: "optionA", "optionB", "optionC", or "optionD"
- All 4 options must be plausible but only one correct
- Questions should be interesting and challenging
- For Bible Quiz category: ALL questions MUST directly reference specific Bible content (books, verses, stories, characters, events, or places). Questions must be answerable from the Bible itself. Include the Bible reference (book and chapter) in your reasoning. Do NOT include general religious knowledge that isn't in the Bible. Every question should be traceable to a specific Bible passage.
- timeLimit should be between 10-30 seconds based on difficulty
- ALL text MUST be in ${targetLanguage}
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
      // If non-English, translate using free Google Translate API
      let finalQuestions = bankQuestions
      if (isNonEnglish) {
        try {
          finalQuestions = await translateQuestionsWithGoogle(bankQuestions, locale)
        } catch (e) {
          console.error('Google Translate failed, returning English questions')
        }
      }

      return NextResponse.json({ 
        questions: finalQuestions, 
        source: isNonEnglish ? 'bank-translated' : 'bank',
        note: hasAI ? undefined : 'Using built-in questions. Add a DEEPSEEK_API_KEY for unlimited AI-generated questions.'
      })
    }

    // STEP 3: No questions available at all
    return NextResponse.json({ 
      error: 'No questions available for this category. Please try another category.',
      hasAI: false 
    }, { status: 404 })

  } catch (error: any) {
    console.error('Generate questions error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
