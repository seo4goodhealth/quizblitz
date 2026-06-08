'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import {
  Trophy, Clock, Users, Zap, Crown, CheckCircle2, XCircle,
} from 'lucide-react'
import { useI18n, I18nProvider, LANGUAGES } from '@/lib/i18n'

interface PlayerInfo {
  id: string
  name: string
  score: number
  correctAnswers: number
  isCreator: boolean
}

// ==================== LANGUAGE SELECTOR COMPONENT ====================
function LanguageSelectorCompact() {
  const { locale, setLocale } = useI18n()
  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-1.5 py-0.5 rounded text-xs transition-all ${
            locale === lang.code
              ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/50'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  )
}

function TVPageContent() {
  const params = useParams()
  const code = params.code as string
  const { t, tc } = useI18n()

  const [status, setStatus] = useState<string>('loading')
  const [categoryName, setCategoryName] = useState('')
  const [players, setPlayers] = useState<PlayerInfo[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [questionResults, setQuestionResults] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [timePerQuestion, setTimePerQuestion] = useState(15)
  const [showCorrect, setShowCorrect] = useState(false)

  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const [animClass, setAnimClass] = useState('')

  // Poll game state
  useEffect(() => {
    if (!code) return

    const poll = async () => {
      try {
        // Use the TV-specific state API (no playerId required)
        const res = await fetch(`/api/game/tv-state?code=${code}`)
        const data = await res.json()

        if (data.error) {
          setStatus('error')
          return
        }

        setPlayers(data.players || [])
        setStatus(data.status)
        setCategoryName(data.categoryName || '')
        setTotalQuestions(data.totalQuestions || 0)
        setTimePerQuestion(data.timePerQuestion || 15)

        if (data.status === 'playing' && data.currentQuestion) {
          setCurrentQuestion(prev => {
            if (prev?.id !== data.currentQuestion.id) {
              setShowCorrect(false)
              setAnimClass('animate-question-enter')
              setTimeout(() => setAnimClass(''), 500)
            }
            return data.currentQuestion
          })
          setTimeLeft(data.currentQuestion.timeLeft)
        } else if (data.status === 'showing-results') {
          if (data.questionResults) {
            setQuestionResults(data.questionResults)
            setShowCorrect(true)
          }
          setCurrentQuestion(null)
        } else if (data.status === 'finished') {
          setLeaderboard(data.leaderboard || [])
          setCurrentQuestion(null)
        }
      } catch (err) {
        console.error('TV poll error:', err)
      }
    }

    poll()
    pollRef.current = setInterval(poll, 1000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [code])

  // Timer animation
  useEffect(() => {
    if (status !== 'playing' || !currentQuestion) return
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 0.1))
    }, 100)
    return () => clearInterval(timer)
  }, [status, currentQuestion?.id])

  const timerPercent = currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 0
  const isLowTime = timeLeft <= 5

  // Loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <p className="text-2xl text-white font-bold">{t('tv.gameStarting')}</p>
        </div>
      </div>
    )
  }

  // Error
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-2xl text-white font-bold">{t('tv.gameOver')}</p>
          <p className="text-gray-400 mt-2">{t('join.roomCode')}</p>
        </div>
      </div>
    )
  }

  // Finished - Leaderboard
  if (status === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-10">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-2">{t('tv.gameOver')}</h1>
          <p className="text-xl text-gray-400">{categoryName}</p>
        </div>

        {/* Podium */}
        {leaderboard.length >= 1 && (
          <div className="flex items-end justify-center gap-6 mb-10">
            {leaderboard[1] && (
              <div className="text-center w-36">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-900 font-bold text-2xl mx-auto mb-3 shadow-lg">
                  {leaderboard[1].name.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-bold text-lg truncate">{leaderboard[1].name}</p>
                <p className="text-gray-400">{leaderboard[1].score} pts</p>
                <div className="bg-gray-400/30 h-24 mt-3 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-gray-300">2</span>
                </div>
              </div>
            )}
            {leaderboard[0] && (
              <div className="text-center w-44">
                <Crown className="w-14 h-14 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-gray-900 font-bold text-3xl mx-auto mb-3 shadow-lg shadow-yellow-400/30">
                  {leaderboard[0].name.charAt(0).toUpperCase()}
                </div>
                <p className="text-yellow-400 font-bold text-xl truncate">{leaderboard[0].name}</p>
                <p className="text-yellow-300 text-lg">{leaderboard[0].score} pts</p>
                <div className="bg-yellow-400/30 h-32 mt-3 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-6xl font-black text-yellow-400">1</span>
                </div>
              </div>
            )}
            {leaderboard[2] && (
              <div className="text-center w-36">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg">
                  {leaderboard[2].name.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-bold text-lg truncate">{leaderboard[2].name}</p>
                <p className="text-gray-400">{leaderboard[2].score} pts</p>
                <div className="bg-amber-500/30 h-16 mt-3 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-amber-500">3</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full leaderboard */}
        <div className="w-full max-w-lg space-y-2">
          {leaderboard.map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <span className={`font-black text-xl w-10 ${p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-gray-300' : p.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                {p.rank}
              </span>
              <span className="text-white font-bold flex-1 text-lg">{p.name}</span>
              <span className="text-yellow-400 font-bold text-lg">{p.score}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">{t('lobby.roomCode')}: {code}</p>
        </div>
      </div>
    )
  }

  // Showing results
  if (status === 'showing-results' && questionResults) {
    const correctOption = questionResults.correctAnswer
    const correctLabel = correctOption?.replace('option', '').toUpperCase() || ''
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">{t('results.title')}</h2>
          <div className="flex items-center justify-center gap-6 text-lg">
            <span className="text-gray-400">{questionResults.correctCount}/{questionResults.totalAnswers} {t('results.correct')}</span>
            <span className="text-yellow-400 font-bold">{t('results.correctAnswer')}: {correctLabel}</span>
          </div>
        </div>

        {/* Answer distribution visualization */}
        {(() => {
          const optionCounts: Record<string, number> = { optionA: 0, optionB: 0, optionC: 0, optionD: 0 }
          ;(questionResults.results || []).forEach((r: any) => {
            if (optionCounts[r.answer] !== undefined) optionCounts[r.answer]++
          })
          const total = (questionResults.results || []).length || 1
          return (
            <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-8">
              {[
                { key: 'optionA', label: 'A', cls: 'from-red-500 to-red-700', border: 'border-red-500/50' },
                { key: 'optionB', label: 'B', cls: 'from-blue-500 to-blue-700', border: 'border-blue-500/50' },
                { key: 'optionC', label: 'C', cls: 'from-yellow-500 to-yellow-700', border: 'border-yellow-500/50' },
                { key: 'optionD', label: 'D', cls: 'from-green-500 to-green-700', border: 'border-green-500/50' },
              ].map(opt => {
                const pct = Math.round((optionCounts[opt.key] / total) * 100)
                const isCorrect = questionResults.correctAnswer === opt.key
                return (
                  <div key={opt.key} className={`relative p-6 rounded-2xl bg-gradient-to-br ${opt.cls} ${isCorrect ? 'ring-4 ring-white shadow-xl scale-105' : 'opacity-60'} transition-all`}>
                    <div className="text-white font-black text-3xl mb-1">{opt.label}</div>
                    <div className="text-white/80 text-lg font-bold">{pct}%</div>
                    <div className="text-white/60 text-sm">{optionCounts[opt.key]} {t('tv.answered')}</div>
                    {isCorrect && <CheckCircle2 className="absolute top-3 right-3 w-8 h-8 text-white" />}
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Mini leaderboard */}
        <div className="w-full max-w-lg">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />{t('results.standings')}
          </h3>
          <div className="space-y-2">
            {(questionResults.leaderboard || []).slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                <span className={`font-bold w-6 ${p.rank === 1 ? 'text-yellow-400' : 'text-gray-500'}`}>{p.rank}</span>
                <span className="text-white font-medium flex-1">{p.name}</span>
                <span className="text-yellow-400 font-bold">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-gray-500 text-sm">
          {t('lobby.roomCode')}: {code}
        </div>
      </div>
    )
  }

  // Lobby
  if (status === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-10">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-5xl font-black text-white mb-2">{t('app.title')}</h1>
          <p className="text-2xl text-gray-400">{categoryName}</p>
        </div>

        <div className="text-center mb-10">
          <p className="text-gray-400 text-lg mb-3">{t('lobby.roomCode')}</p>
          <div className="text-7xl font-mono font-black tracking-[0.3em] text-yellow-400 mb-2">
            {code}
          </div>
          <p className="text-gray-500">{t('tv.joinWithCode')}</p>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Users className="w-6 h-6 text-gray-400" />
            <span className="text-white font-bold text-xl">{players.length} {t('lobby.players')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-3 bg-white/10 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-gray-500">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          {t('tv.waitingForPlayers')}
        </div>

        <div className="absolute top-4 right-4">
          <LanguageSelectorCompact />
        </div>
      </div>
    )
  }

  // Playing - Main question display
  if (status === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950 flex flex-col p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <span className="text-xl font-bold text-white">{t('app.title')}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelectorCompact />
            <span className="text-gray-400">{t('lobby.roomCode')}: {code}</span>
            <span className="text-purple-300 font-bold">
              {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className={`w-7 h-7 ${isLowTime ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
            <span className={`text-4xl font-black tabular-nums ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {Math.ceil(timeLeft)}{t('create.seconds')}
            </span>
          </div>
          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100 ${isLowTime ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className={`flex-1 flex flex-col items-center justify-center ${animClass}`}>
          <div className="w-full max-w-4xl mb-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {currentQuestion.text}
              </h2>
            </div>
          </div>

          {/* Answer Options - Large colorful blocks */}
          <div className="w-full max-w-4xl grid grid-cols-2 gap-4 md:gap-6">
            {[
              { key: 'optionA', value: currentQuestion.optionA, cls: 'bg-gradient-to-br from-red-500 to-red-700', icon: '▲', isCorrect: showCorrect && currentQuestion.correctAnswer === 'optionA' },
              { key: 'optionB', value: currentQuestion.optionB, cls: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: '◆', isCorrect: showCorrect && currentQuestion.correctAnswer === 'optionB' },
              { key: 'optionC', value: currentQuestion.optionC, cls: 'bg-gradient-to-br from-yellow-500 to-yellow-700', icon: '●', isCorrect: showCorrect && currentQuestion.correctAnswer === 'optionC' },
              { key: 'optionD', value: currentQuestion.optionD, cls: 'bg-gradient-to-br from-green-500 to-green-700', icon: '■', isCorrect: showCorrect && currentQuestion.correctAnswer === 'optionD' },
            ].map((opt) => (
              <div
                key={opt.key}
                className={`${opt.cls} p-6 md:p-8 rounded-2xl text-white shadow-lg transition-all
                  ${opt.isCorrect ? 'ring-4 ring-white scale-105 shadow-2xl' : ''}
                  ${showCorrect && !opt.isCorrect ? 'opacity-40' : ''}
                  hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl md:text-5xl font-black opacity-80">{opt.icon}</span>
                  <span className="text-xl md:text-2xl font-bold">{opt.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Answer count */}
          <div className="mt-6 text-gray-400 text-lg">
            <Users className="w-5 h-5 inline mr-2" />
            {currentQuestion.answerCount || 0} {t('tv.answered')}
          </div>
        </div>
      </div>
    )
  }

  // Fallback - waiting screen
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
        <p className="text-2xl text-white font-bold">{t('tv.waitingForPlayers')}</p>
        <p className="text-gray-500 mt-2">{t('lobby.roomCode')}: {code}</p>
      </div>
    </div>
  )
}

export default function TVPage() {
  return (
    <I18nProvider>
      <TVPageContent />
    </I18nProvider>
  )
}
