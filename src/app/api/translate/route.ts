import { NextRequest, NextResponse } from 'next/server'
import { translate } from '@vitalets/google-translate-api'

const GT_LANG_CODES: Record<string, string> = {
  en: 'en',
  es: 'es',
  ro: 'ro',
  ca: 'ca',
  it: 'it',
  fr: 'fr',
}

export async function POST(req: NextRequest) {
  try {
    const { questions, locale = 'en' } = await req.json()

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Questions array is required' }, { status: 400 })
    }

    const langCode = GT_LANG_CODES[locale] || 'en'

    // If English, return as-is
    if (langCode === 'en') {
      return NextResponse.json({ questions, source: 'original' })
    }

    // Translate each question using free Google Translate API
    const translatedQuestions = await Promise.all(
      questions.map(async (q: any) => {
        try {
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

    return NextResponse.json({ questions: translatedQuestions, source: 'translated' })
  } catch (error: any) {
    console.error('Translate error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}
