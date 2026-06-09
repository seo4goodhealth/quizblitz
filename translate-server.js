/**
 * Translation Microservice - Runs as a separate Node.js process on port 3001
 * Uses Google Translate's free public API (no API key needed).
 * Falls back to z-ai-web-dev-sdk only when Google Translate fails.
 * 
 * Usage: node translate-server.js
 */

const http = require('http')
const https = require('https')

const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish (Español)',
  ro: 'Romanian (Română)',
  ca: 'Catalan (Català)',
  it: 'Italian (Italiano)',
  fr: 'French (Français)',
}

/**
 * Translate a single text using Google Translate (free, no API key).
 */
function googleTranslate(text, from, to) {
  return new Promise((resolve) => {
    const path = `/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    const options = {
      hostname: 'translate.google.com',
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000,
      agent: false, // Don't use connection pooling - prevents resource leaks
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        // Clean up the socket to prevent resource leaks
        res.socket?.destroy()
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed?.[0])) {
            let result = ''
            for (const segment of parsed[0]) {
              if (segment?.[0]) result += segment[0]
            }
            resolve(result || text)
          } else {
            resolve(text)
          }
        } catch {
          resolve(text)
        }
      })
    })

    req.on('error', (e) => {
      console.error('Google Translate error:', e.message)
      resolve(text)
    })

    req.on('timeout', () => {
      req.destroy()
      console.error('Google Translate timed out')
      resolve(text)
    })

    req.end()
  })
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Translate questions using Google Translate.
 * Processes one question at a time (5 parallel HTTP requests per question).
 */
async function translateQuestions(questions, locale) {
  if (!locale || locale === 'en') return questions

  const result = []

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    try {
      // Translate all 5 fields of this question in parallel
      const [text, optionA, optionB, optionC, optionD] = await Promise.all([
        googleTranslate(q.text, 'en', locale),
        googleTranslate(q.optionA, 'en', locale),
        googleTranslate(q.optionB, 'en', locale),
        googleTranslate(q.optionC, 'en', locale),
        googleTranslate(q.optionD, 'en', locale),
      ])

      result.push({ ...q, text, optionA, optionB, optionC, optionD })
      console.log(`Translated question ${i + 1}/${questions.length} to ${locale} via Google Translate`)

      // Small delay between questions to avoid rate-limiting
      if (i < questions.length - 1) await delay(300)
    } catch (e) {
      console.error(`Translation failed for question ${i + 1}:`, e.message)
      result.push(q)
    }
  }

  return result
}

const server = http.createServer(async (req, res) => {
  // Enable CORS for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/translate') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', async () => {
      try {
        const { questions, locale } = JSON.parse(body)
        const translated = await translateQuestions(questions, locale)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ questions: translated }))
      } catch (e) {
        console.error('Translate server error:', e)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
    })
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

const PORT = 3001

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (not crashing):', err.message)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (not crashing):', err)
})

server.listen(PORT, () => {
  console.log(`Translation microservice running on port ${PORT} (using Google Translate)`)
})
