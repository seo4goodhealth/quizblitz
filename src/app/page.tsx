'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy, Users, Play, Plus, LogIn, Zap, Clock,
  CheckCircle2, XCircle, Crown, Sparkles, ChevronRight,
  RotateCcw, Trash2, Edit3, Save, ArrowLeft, Loader2,
  Copy, Check, Gamepad2, BookOpen, Brain, Globe,
  FlaskConical, Music, Film, Dumbbell, Utensils, TreePine,
  Rocket, Palette, Landmark, Calculator, PawPrint, Languages,
  Heart, Star, Swords, Award, Mic2, Laptop, Mountain, Shield,
  Monitor, Bookmark, LogOut, User, FolderOpen, X,
} from 'lucide-react'
import { useI18n, LANGUAGES } from '@/lib/i18n'
import { generateFunnyName } from '@/lib/funny-names'

// ==================== TYPES ====================
interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer?: string // Only available in showing-results, NOT during playing
  timeLimit: number
  order: number
}

interface PlayerInfo {
  id: string
  name: string
  score: number
  correctAnswers: number
  isCreator: boolean
}

interface SavedQuizInfo {
  id: string
  name: string
  categoryName: string
  difficulty: string
  timePerQuestion: number
  questionCount: number
  createdAt: string
  updatedAt: string
}

type GameView = 'home' | 'create' | 'join' | 'lobby' | 'game' | 'results' | 'leaderboard' | 'halloffame'

// ==================== CATEGORIES (24) ====================
const CATEGORIES = [
  { id: 'bible', name: 'Bible Quiz', icon: BookOpen, color: 'from-purple-500 to-purple-700' },
  { id: 'science', name: 'Science', icon: FlaskConical, color: 'from-emerald-500 to-emerald-700' },
  { id: 'history', name: 'History', icon: Landmark, color: 'from-amber-500 to-amber-700' },
  { id: 'geography', name: 'Geography', icon: Globe, color: 'from-cyan-500 to-cyan-700' },
  { id: 'sports', name: 'Sports', icon: Dumbbell, color: 'from-red-500 to-red-700' },
  { id: 'music', name: 'Music', icon: Music, color: 'from-pink-500 to-pink-700' },
  { id: 'movies', name: 'Movies & TV', icon: Film, color: 'from-violet-500 to-violet-700' },
  { id: 'literature', name: 'Literature', icon: BookOpen, color: 'from-yellow-500 to-yellow-700' },
  { id: 'technology', name: 'Technology', icon: Laptop, color: 'from-blue-500 to-blue-700' },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'from-indigo-500 to-indigo-700' },
  { id: 'animals', name: 'Animals', icon: PawPrint, color: 'from-orange-500 to-orange-700' },
  { id: 'food', name: 'Food & Cooking', icon: Utensils, color: 'from-rose-500 to-rose-700' },
  { id: 'art', name: 'Art & Culture', icon: Palette, color: 'from-fuchsia-500 to-fuchsia-700' },
  { id: 'nature', name: 'Nature & Environment', icon: TreePine, color: 'from-green-500 to-green-700' },
  { id: 'space', name: 'Space & Astronomy', icon: Rocket, color: 'from-slate-500 to-slate-700' },
  { id: 'mythology', name: 'Mythology', icon: Swords, color: 'from-amber-600 to-amber-800' },
  { id: 'languages', name: 'Languages', icon: Languages, color: 'from-teal-500 to-teal-700' },
  { id: 'health', name: 'Health & Medicine', icon: Heart, color: 'from-red-400 to-red-600' },
  { id: 'famous', name: 'Famous People', icon: Star, color: 'from-yellow-400 to-yellow-600' },
  { id: 'videogames', name: 'Video Games', icon: Gamepad2, color: 'from-purple-400 to-purple-600' },
  { id: 'worldrecords', name: 'World Records', icon: Award, color: 'from-emerald-400 to-emerald-600' },
  { id: 'musictheory', name: 'Music Theory', icon: Mic2, color: 'from-pink-400 to-pink-600' },
  { id: 'politics', name: 'Politics & Government', icon: Shield, color: 'from-blue-400 to-blue-600' },
  { id: 'travel', name: 'Travel & Landmarks', icon: Mountain, color: 'from-cyan-400 to-cyan-600' },
]

// ==================== LANGUAGE SELECTOR COMPONENT ====================
function LanguageSelector({ compact = false, onLocaleChange }: { compact?: boolean; onLocaleChange?: (locale: string) => void }) {
  const { locale, setLocale, t } = useI18n()

  const handleChange = (code: string) => {
    if (onLocaleChange) {
      onLocaleChange(code)
    } else {
      setLocale(code as any)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
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
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            locale === lang.code
              ? 'bg-purple-600/30 text-white ring-1 ring-purple-500/50'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  )
}

// ==================== MAIN APP ====================
export default function QuizBlitzApp() {
  const { data: session, status: sessionStatus } = useSession()
  const { t, tc, locale, setLocale } = useI18n()

  // View state
  const [view, setView] = useState<GameView>('home')

  // Player state
  const [playerName, setPlayerName] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [isCreator, setIsCreator] = useState(false)

  // Room state
  const [roomCode, setRoomCode] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [players, setPlayers] = useState<PlayerInfo[]>([])

  // Create game state
  const [selectedCategory, setSelectedCategory] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState('mixed')
  const [timePerQuestion, setTimePerQuestion] = useState(15)
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Question | null>(null)

  // Game play state
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [questionResults, setQuestionResults] = useState<any>(null)
  const [gameStatus, setGameStatus] = useState<string>('lobby')
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Leaderboard
  const [finalLeaderboard, setFinalLeaderboard] = useState<any[]>([])

  // Join error
  const [joinError, setJoinError] = useState('')
  const [createError, setCreateError] = useState('')

  // Code copied state
  const [codeCopied, setCodeCopied] = useState(false)

  // Polling ref
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Save quiz state
  const [saveQuizName, setSaveQuizName] = useState('')
  const [isSavingQuiz, setIsSavingQuiz] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Saved quizzes state
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuizInfo[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  // Custom question form state
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customQuestion, setCustomQuestion] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'optionA',
  })

  // Cast modal
  const [showCastModal, setShowCastModal] = useState(false)

  // Game questions for saving from leaderboard
  const [gameQuestions, setGameQuestions] = useState<Question[]>([])
  const [gameCategoryName, setGameCategoryName] = useState('')
  const [gameDifficulty, setGameDifficulty] = useState('mixed')
  const [isSavingGameQuiz, setIsSavingGameQuiz] = useState(false)
  const [gameQuizSaved, setGameQuizSaved] = useState(false)
  const [gameQuizName, setGameQuizName] = useState('')

  // Quit/Rejoin state
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [lastRoomInfo, setLastRoomInfo] = useState<{ code: string; playerId: string; playerName: string } | null>(null)

  // Hall of Fame state
  const [hallOfFameData, setHallOfFameData] = useState<any[]>([])
  const [isLoadingHallOfFame, setIsLoadingHallOfFame] = useState(false)
  const [hallOfFameWeekStart, setHallOfFameWeekStart] = useState('')
  const [hallOfFameWeekEnd, setHallOfFameWeekEnd] = useState('')

  // Ref for answerSubmitted to avoid stale closure in polling
  const answerSubmittedRef = useRef(false)
  useEffect(() => { answerSubmittedRef.current = answerSubmitted }, [answerSubmitted])

  // ==================== SESSION PERSISTENCE ====================
  const SESSION_KEY = 'quizblitz_session'

  const saveSession = useCallback((pId: string, code: string, creator: boolean, name: string) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        playerId: pId,
        roomCode: code,
        isCreator: creator,
        playerName: name,
        timestamp: Date.now(),
      }))
    } catch (e) {
      // localStorage not available
    }
  }, [])

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (e) {
      // localStorage not available
    }
  }, [])

  const loadSession = useCallback((): { playerId: string; roomCode: string; isCreator: boolean; playerName: string } | null => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      // Session expires after 2 hours
      if (Date.now() - data.timestamp > 2 * 60 * 60 * 1000) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      return data
    } catch (e) {
      return null
    }
  }, [])

  // Reconnect on page load / refresh
  const [isReconnecting, setIsReconnecting] = useState(false)
  useEffect(() => {
    const session = loadSession()
    if (!session) return

    setIsReconnecting(true)
    fetch('/api/game/reconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: session.roomCode, playerId: session.playerId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.gameState) {
          const gs = data.gameState
          setPlayerId(session.playerId)
          setRoomCode(session.roomCode)
          setIsCreator(session.isCreator)
          setPlayerName(session.playerName)
          setCategoryName(gs.categoryName || '')
          setPlayers(gs.players || [])
          setGameStatus(gs.status)

          if (gs.status === 'playing' && gs.currentQuestion) {
            setCurrentQuestion(gs.currentQuestion)
            setTimeLeft(gs.currentQuestion.timeLeft)
            setTotalQuestions(gs.currentQuestion.totalQuestions)
            setCurrentQuestionIndex(gs.currentQuestion.questionNumber - 1)
            setAnswerSubmitted(gs.currentQuestion.hasAnswered)
            if (gs.currentQuestion.hasAnswered) {
              // Use lastAnswer from server to restore the selected answer
              setSelectedAnswer(gs.currentQuestion.lastAnswer || 'submitted')
            }
            setView('game')
          } else if (gs.status === 'showing-results') {
            setQuestionResults(gs.questionResults)
            setView('results')
          } else if (gs.status === 'finished') {
            setFinalLeaderboard(gs.leaderboard || [])
            setView('leaderboard')
          } else if (gs.status === 'lobby') {
            setView('lobby')
          }

          // Resume polling
          startPolling(session.roomCode, session.playerId)
        } else {
          // Session invalid, clear it
          clearSession()
        }
      })
      .catch(() => {
        clearSession()
      })
      .finally(() => {
        setIsReconnecting(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ==================== AUTH FUNCTIONS ====================
  const handleAuth = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      if (authMode === 'register') {
        if (!authEmail || !authName || !authPassword) {
          setAuthError(t('auth.allFieldsRequired'))
          setAuthLoading(false)
          return
        }
        if (authPassword.length < 6) {
          setAuthError(t('auth.passwordMin'))
          setAuthLoading(false)
          return
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, name: authName, password: authPassword }),
        })
        const data = await res.json()
        if (data.error) {
          setAuthError(data.error)
          setAuthLoading(false)
          return
        }
        // Auto sign in after register
        await signIn('credentials', { email: authEmail, password: authPassword, redirect: false })
      } else {
        if (!authEmail || !authPassword) {
          setAuthError(t('auth.emailPasswordRequired'))
          setAuthLoading(false)
          return
        }
        const result = await signIn('credentials', { email: authEmail, password: authPassword, redirect: false })
        if (result?.error) {
          setAuthError(t('auth.invalidCredentials'))
          setAuthLoading(false)
          return
        }
      }
      setShowAuthModal(false)
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
      setAuthError('')
    } catch (err) {
      setAuthError(t('auth.somethingWrong'))
    } finally {
      setAuthLoading(false)
    }
  }

  // ==================== QUIZ SAVE/LOAD FUNCTIONS ====================
  const handleSaveQuiz = async () => {
    if (!session?.user || questions.length === 0) return
    setIsSavingQuiz(true)
    setSaveSuccess(false)
    try {
      const name = saveQuizName || `${tc(selectedCategory) || 'Custom Quiz'} - ${new Date().toLocaleDateString()}`
      const res = await fetch('/api/quizzes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryName: CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Custom',
          questions,
          difficulty,
          timePerQuestion,
        }),
      })
      const data = await res.json()
      if (data.error) {
        console.error('Save quiz error:', data.error)
      } else {
        setSaveSuccess(true)
        setSaveQuizName('')
        fetchSavedQuizzes()
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save quiz:', err)
    } finally {
      setIsSavingQuiz(false)
    }
  }

  const fetchSavedQuizzes = useCallback(async () => {
    if (!session?.user) return
    setIsLoadingSaved(true)
    try {
      const res = await fetch('/api/quizzes/list')
      const data = await res.json()
      if (data.quizzes) {
        setSavedQuizzes(data.quizzes)
      }
    } catch (err) {
      console.error('Failed to fetch saved quizzes:', err)
    } finally {
      setIsLoadingSaved(false)
    }
  }, [session?.user])

  const loadSavedQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`)
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
        setSelectedCategory(CATEGORIES.find(c => c.name === data.categoryName)?.id || '')
        setDifficulty(data.difficulty || 'mixed')
        setTimePerQuestion(data.timePerQuestion || 15)
        setQuestionCount(data.questions.length)
      }
    } catch (err) {
      console.error('Failed to load quiz:', err)
    }
  }

  const deleteSavedQuiz = async (quizId: string) => {
    try {
      await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' })
      fetchSavedQuizzes()
    } catch (err) {
      console.error('Failed to delete quiz:', err)
    }
  }

  // Fetch saved quizzes when session changes
  useEffect(() => {
    if (session?.user) {
      fetchSavedQuizzes()
    } else {
      setSavedQuizzes([])
    }
  }, [session?.user, fetchSavedQuizzes])

  // Pre-fill player name from session
  useEffect(() => {
    if (session?.user?.name && !playerName) {
      setPlayerName(session.user.name)
    }
  }, [session?.user?.name, playerName])

  // Load last room info from localStorage for rejoin option
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quizblitz_lastroom')
      if (saved) {
        const info = JSON.parse(saved)
        // Only show rejoin if less than 2 hours old
        if (info.timestamp && Date.now() - info.timestamp < 2 * 60 * 60 * 1000) {
          setLastRoomInfo({ code: info.code, playerId: info.playerId, playerName: info.playerName })
        } else {
          localStorage.removeItem('quizblitz_lastroom')
        }
      }
    } catch {}
  }, [])

  // ==================== CAST TO TV ====================
  const openTVMode = () => {
    const url = `/tv/${roomCode}`
    window.open(url, '_blank', 'width=1280,height=720')
  }

  // ==================== POLLING ====================
  const startPolling = useCallback((code: string, pId: string) => {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/state?code=${code}&playerId=${pId}`)
        const data = await res.json()

        if (data.error) {
          console.error('Poll error:', data.error)
          return
        }

        setPlayers(data.players || [])
        setGameStatus(data.status)

        if (data.status === 'playing' && data.currentQuestion) {
          setCurrentQuestion(prev => {
            if (prev?.id !== data.currentQuestion.id) {
              // New question detected — reset answer state
              setSelectedAnswer(null)
              setAnswerSubmitted(false)
              setQuestionResults(null)
            }
            return data.currentQuestion
          })
          // Only sync timeLeft from server if we haven't answered yet
          // After answering, the local timer stops and server time doesn't matter
          if (!answerSubmittedRef.current) {
            setTimeLeft(data.currentQuestion.timeLeft)
          }
          setTotalQuestions(data.currentQuestion.totalQuestions)
          setCurrentQuestionIndex(data.currentQuestion.questionNumber - 1)
          if (view !== 'game') setView('game')
        } else if (data.status === 'showing-results') {
          if (data.questionResults) {
            setQuestionResults(data.questionResults)
          }
          if (view !== 'results') setView('results')
        } else if (data.status === 'finished') {
          setFinalLeaderboard(data.leaderboard || [])
          // Store questions from the finished game for save feature
          if (data.questions) {
            setGameQuestions(data.questions)
            setGameCategoryName(data.categoryName || '')
            setGameDifficulty(data.difficulty || 'mixed')
          }
          if (view !== 'leaderboard') setView('leaderboard')
          if (pollRef.current) clearInterval(pollRef.current)
          clearSession()
          // Record game results to Hall of Fame
          fetch('/api/game/record-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          }).catch(err => console.error('Failed to record game results:', err))
        } else if (data.status === 'lobby') {
          if (view !== 'lobby') setView('lobby')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 1500)
  }, [view, clearSession])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  // Timer countdown — only runs while player hasn't answered yet
  // Each player has independent time to answer. Once they submit, their timer stops.
  useEffect(() => {
    if (view !== 'game' || !currentQuestion || answerSubmitted) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) return 0
        return Math.max(0, prev - 0.1)
      })
    }, 100)
    return () => clearInterval(timer)
  }, [view, currentQuestion?.id, answerSubmitted])

  // Anti-cheat: Block keyboard shortcuts during game (copy, search, select all, find, etc.)
  useEffect(() => {
    if (view !== 'game' || !currentQuestion) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl/Cmd + C (copy), F (find), A (select all), S (save/search), P (print)
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && ['c', 'f', 'a', 's', 'p', 'u'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      // Block F3 (search) and Ctrl+G (find next)
      if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && key === 'g')) {
        e.preventDefault()
        return false
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [view, currentQuestion?.id])

  // No more creator-only auto-advance!
  // The server handles auto-advance via polling:
  // - When time expires OR all players answer, the server auto-advances
  // - The next poll returns status='showing-results' which the client handles

  const resetState = useCallback(() => {
    stopPolling()
    clearSession()
    setView('home')
    setPlayerId('')
    setIsCreator(false)
    setRoomCode('')
    setCategoryName('')
    setPlayers([])
    setQuestions([])
    setSelectedCategory('')
    setQuestionCount(10)
    setDifficulty('mixed')
    setTimePerQuestion(15)
    setIsGenerating(false)
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setAnswerSubmitted(false)
    setQuestionResults(null)
    setGameStatus('lobby')
    setFinalLeaderboard([])
    setJoinError('')
    setEditingQuestion(null)
    setEditForm(null)
    setShowCustomForm(false)
    setCustomQuestion({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'optionA' })
    setTimeLeft(0)
    setSaveQuizName('')
    setSaveSuccess(false)
    setOriginalQuestions([])
    setIsTranslating(false)
    setGameQuestions([])
    setGameCategoryName('')
    setGameDifficulty('mixed')
    setIsSavingGameQuiz(false)
    setGameQuizSaved(false)
    setGameQuizName('')
    setCreateError('')
    setShowQuitConfirm(false)
  }, [stopPolling, clearSession])

  // ==================== CUSTOM QUESTIONS ====================
  const addCustomQuestion = () => {
    if (!customQuestion.text.trim() || !customQuestion.optionA.trim() || !customQuestion.optionB.trim() || !customQuestion.optionC.trim() || !customQuestion.optionD.trim()) return
    const newQuestion: Question = {
      id: `q_custom_${Date.now()}`,
      text: customQuestion.text.trim(),
      optionA: customQuestion.optionA.trim(),
      optionB: customQuestion.optionB.trim(),
      optionC: customQuestion.optionC.trim(),
      optionD: customQuestion.optionD.trim(),
      correctAnswer: customQuestion.correctAnswer,
      timeLimit: timePerQuestion,
      order: questions.length,
    }
    setQuestions([...questions, newQuestion])
    setCustomQuestion({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'optionA' })
    setShowCustomForm(false)
  }

  // Store original English questions so we can re-translate when locale changes
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  // ==================== LOCALE CHANGE WITH SERVER-SIDE TRANSLATION ====================
  const handleLocaleChange = async (newLocale: string) => {
    const prevLocale = locale
    setLocale(newLocale as any)

    // If we have questions loaded and the locale actually changed, re-translate them
    if (questions.length > 0 && newLocale !== prevLocale) {
      // Use original English questions as source for translation
      const sourceQuestions = originalQuestions.length > 0 ? originalQuestions : questions

      if (newLocale === 'en') {
        // Switching back to English — restore originals
        setQuestions(sourceQuestions)
      } else {
        // Translate via server API
        setIsTranslating(true)
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: sourceQuestions, locale: newLocale }),
          })
          const data = await res.json()
          if (data.questions) {
            setQuestions(data.questions)
          }
        } catch (err) {
          console.error('Failed to translate questions:', err)
        } finally {
          setIsTranslating(false)
        }
      }
    }
  }

  // ==================== API CALLS ====================
  const generateQuestions = async () => {
    if (!selectedCategory) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory,
          count: questionCount,
          difficulty,
          locale,
        }),
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
        // Store original English questions for re-translation when locale changes
        if (locale === 'en' || data.source === 'bank') {
          setOriginalQuestions(data.questions)
        }
      }
    } catch (err) {
      console.error('Failed to generate questions:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!playerName.trim() || questions.length === 0) return
    setCreateError('')
    try {
      // Determine category name: use selected category, or 'Custom' if only custom questions
      const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || (questions.length > 0 ? 'Custom' : selectedCategory)
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          categoryName,
          questions,
          timePerQuestion,
        }),
      })
      const data = await res.json()
      if (data.code) {
        setPlayerId(data.playerId)
        setRoomCode(data.code)
        setIsCreator(true)
        setCategoryName(categoryName)
        saveSession(data.playerId, data.code, true, playerName.trim())
        setView('lobby')
        startPolling(data.code, data.playerId)
      } else if (data.error) {
        setCreateError(data.error)
      }
    } catch (err) {
      console.error('Failed to create room:', err)
      setCreateError('Failed to create room. Please try again.')
    }
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return
    setJoinError('')
    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode.trim(), playerName: playerName.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setJoinError(data.error)
      } else {
        setPlayerId(data.playerId)
        setIsCreator(false)
        setCategoryName(data.categoryName)
        setTotalQuestions(data.totalQuestions)
        setPlayers(data.players)
        saveSession(data.playerId, data.code, false, playerName.trim())
        setView('lobby')
        startPolling(data.code, data.playerId)
      }
    } catch (err) {
      setJoinError('Failed to join room. Try again.')
    }
  }

  const handleStartGame = async () => {
    if (!roomCode || !playerId) return
    try {
      await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId }),
      })
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }

  const handleSubmitAnswer = async (answer: string) => {
    if (!roomCode || !playerId || answerSubmitted) return
    setSelectedAnswer(answer)
    setAnswerSubmitted(true)
    try {
      await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId, answer }),
      })
      // After answering, the player's timer stops (handled by useEffect)
      // The server will auto-advance when all players answer or time expires
    } catch (err) {
      console.error('Failed to submit answer:', err)
    }
  }

  const handleAdvanceQuestion = async () => {
    if (!roomCode || !playerId) return
    try {
      const res = await fetch('/api/game/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId }),
      })
      const data = await res.json()
      if (data.success) {
        setQuestionResults(data.questionResults)
        if (data.isFinished) {
          setFinalLeaderboard(data.leaderboard || [])
          setView('leaderboard')
          stopPolling()
          clearSession()
        } else {
          setView('results')
        }
      }
    } catch (err) {
      console.error('Failed to advance:', err)
    }
  }

  const handleContinueToNextQuestion = async () => {
    if (!roomCode || !playerId) return
    try {
      await fetch('/api/game/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId }),
      })
    } catch (err) {
      console.error('Failed to continue:', err)
    }
  }

  // ==================== QUIT & REJOIN ====================
  const handleQuitGame = async () => {
    if (!roomCode || !playerId) return
    try {
      // Save room info before quitting so we can offer rejoin
      setLastRoomInfo({ code: roomCode, playerId, playerName: playerName })
      // Also save to localStorage for persistence across refreshes
      localStorage.setItem('quizblitz_lastroom', JSON.stringify({ code: roomCode, playerId, playerName, timestamp: Date.now() }))

      await fetch('/api/game/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId }),
      })
    } catch (err) {
      console.error('Failed to leave room:', err)
    }
    // Reset client state
    stopPolling()
    clearSession()
    setView('home')
    setPlayerId('')
    setIsCreator(false)
    setRoomCode('')
    setCategoryName('')
    setPlayers([])
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setAnswerSubmitted(false)
    setQuestionResults(null)
    setGameStatus('lobby')
    setFinalLeaderboard([])
    setShowQuitConfirm(false)
  }

  const handleRejoinGame = async () => {
    if (!lastRoomInfo) return
    try {
      const res = await fetch('/api/game/rejoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: lastRoomInfo.code, playerId: lastRoomInfo.playerId }),
      })
      const data = await res.json()
      if (data.success && data.gameState) {
        const gs = data.gameState
        setPlayerId(lastRoomInfo.playerId)
        setRoomCode(lastRoomInfo.code)
        setPlayerName(lastRoomInfo.playerName)
        setIsCreator(gs.isCreator)
        setCategoryName(gs.categoryName)
        setPlayers(gs.players || [])
        setGameStatus(gs.status)
        saveSession(lastRoomInfo.playerId, lastRoomInfo.code, gs.isCreator, lastRoomInfo.playerName)

        if (gs.status === 'playing' && gs.currentQuestion) {
          setCurrentQuestion(gs.currentQuestion)
          setTimeLeft(gs.currentQuestion.timeLeft)
          setTotalQuestions(gs.currentQuestion.totalQuestions)
          setCurrentQuestionIndex(gs.currentQuestion.questionNumber - 1)
          setAnswerSubmitted(gs.currentQuestion.hasAnswered)
          if (gs.currentQuestion.hasAnswered) {
            setSelectedAnswer(gs.currentQuestion.lastAnswer || 'submitted')
          }
          setView('game')
        } else if (gs.status === 'showing-results') {
          setQuestionResults(gs.questionResults)
          setView('results')
        } else if (gs.status === 'lobby') {
          setView('lobby')
        } else if (gs.status === 'finished') {
          setFinalLeaderboard(gs.leaderboard || [])
          setView('leaderboard')
        }

        startPolling(lastRoomInfo.code, lastRoomInfo.playerId)
        setLastRoomInfo(null)
        localStorage.removeItem('quizblitz_lastroom')
      } else {
        // Room no longer exists or player was removed
        setLastRoomInfo(null)
        localStorage.removeItem('quizblitz_lastroom')
      }
    } catch (err) {
      console.error('Failed to rejoin room:', err)
      setLastRoomInfo(null)
      localStorage.removeItem('quizblitz_lastroom')
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const saveEditedQuestion = (index: number) => {
    if (!editForm) return
    const updated = [...questions]
    updated[index] = editForm
    setQuestions(updated)
    setEditingQuestion(null)
    setEditForm(null)
  }

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      {/* Reconnecting overlay */}
      {isReconnecting && (
        <div className="fixed inset-0 bg-gray-950/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Reconnecting to game...</p>
          </div>
        </div>
      )}
      {/* ====== AUTH MODAL ====== */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-gray-900 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {authMode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {authMode === 'login' ? t('auth.signInDesc') : t('auth.createDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {authMode === 'register' && (
              <div>
                <Label className="text-gray-300 mb-1 block">{t('auth.name')}</Label>
                <Input value={authName} onChange={(e) => setAuthName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')} className="bg-white/5 border-white/10 text-white" />
              </div>
            )}
            <div>
              <Label className="text-gray-300 mb-1 block">{t('auth.email')}</Label>
              <Input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                type="email" placeholder={t('auth.emailPlaceholder')} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-gray-300 mb-1 block">{t('auth.password')}</Label>
              <Input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                type="password" placeholder={t('auth.passwordPlaceholder')} className="bg-white/5 border-white/10 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
            </div>
            {authError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded text-sm text-center">{authError}</div>}
            <Button onClick={handleAuth} disabled={authLoading} className="w-full h-11 font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
              {authLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{authMode === 'login' ? t('auth.signingIn') : t('auth.creatingAccount')}</> : authMode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
            </Button>
            <p className="text-center text-sm text-gray-400">
              {authMode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('') }} className="text-purple-400 hover:text-purple-300 underline">
                {authMode === 'login' ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====== CAST MODAL ====== */}
      <Dialog open={showCastModal} onOpenChange={setShowCastModal}>
        <DialogContent className="bg-gray-900 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Monitor className="w-5 h-5 text-purple-400" /> {t('cast.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('cast.subtitle')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Button onClick={openTVMode} className="w-full h-12 text-lg font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
              <Monitor className="w-5 h-5 mr-2" /> {t('cast.openTVDisplay')}
            </Button>
            <p className="text-gray-400 text-sm text-center">{t('cast.tvDisplayDesc')}</p>
            <Separator className="bg-white/10" />
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm">{t('cast.otherWays')}</h4>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white font-medium text-sm mb-1">{t('cast.chromecast')}</p>
                <p className="text-gray-400 text-xs">{t('cast.chromecastDesc')}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white font-medium text-sm mb-1">{t('cast.airplay')}</p>
                <p className="text-gray-400 text-xs">{t('cast.airplayDesc')}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white font-medium text-sm mb-1">{t('cast.hdmi')}</p>
                <p className="text-gray-400 text-xs">{t('cast.hdmiDesc')}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====== HOME VIEW ====== */}
      {view === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-12 h-12 text-yellow-400" />
              <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-purple-500 bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
              <Zap className="w-12 h-12 text-yellow-400" />
            </div>
            <p className="text-xl text-gray-400 max-w-md mx-auto">
              {t('app.tagline')}
            </p>
          </div>

          {/* User profile / auth section */}
          {session?.user ? (
            <div className="w-full max-w-md mb-4 animate-slide-up">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{session.user.name}</p>
                  <p className="text-gray-400 text-xs truncate">{session.user.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-400 hover:text-red-400 shrink-0">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md mb-4 animate-slide-up">
              <Button variant="outline" onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                className="w-full border-white/10 text-gray-400 hover:text-white hover:border-white/20 h-10">
                <User className="w-4 h-4 mr-2" /> {t('home.signIn')}
              </Button>
            </div>
          )}

          {/* Saved Quizzes on Homepage */}
          {session?.user && savedQuizzes.length > 0 && (
            <div className="w-full max-w-md mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-yellow-400" /> {t('home.myQuizzes')}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => { if (playerName.trim()) setView('create') }} className="text-purple-400 hover:text-purple-300 text-xs">
                  {t('home.viewAll')} <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedQuizzes.slice(0, 5).map((q) => {
                  const catIcon = CATEGORIES.find(c => c.name === q.categoryName)?.icon || BookOpen
                  const CatIcon = catIcon
                  return (
                    <div key={q.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/8 transition-colors cursor-pointer group"
                      onClick={async () => {
                        await loadSavedQuiz(q.id)
                        if (playerName.trim()) setView('create')
                      }}>
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0">
                        <CatIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{q.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span>{q.categoryName}</span>
                          <span>•</span>
                          <span>{q.questionCount} Qs</span>
                          <span>•</span>
                          <span>{q.difficulty}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="w-full max-w-md space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Name Input with Funny Name Generator */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('home.nickname')}
                  className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 flex-1"
                  maxLength={20}
                />
                <Button
                  onClick={() => setPlayerName(generateFunnyName(locale))}
                  className="h-14 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-500 hover:to-yellow-500 text-white font-bold shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.05] active:scale-[0.95] shrink-0"
                  title={t('home.funnyName')}
                >
                  <Zap className="w-5 h-5" />
                </Button>
              </div>
              <button
                onClick={() => setPlayerName(generateFunnyName(locale))}
                className="text-xs text-yellow-400/70 hover:text-yellow-300 transition-colors flex items-center gap-1 mx-auto"
              >
                <Zap className="w-3 h-3" />
                {t('home.funnyName')}
              </button>
            </div>

            <Button
              onClick={() => { if (playerName.trim()) setView('create') }}
              disabled={!playerName.trim()}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-quiz-red to-quiz-orange hover:from-quiz-red hover:to-quiz-red text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-6 h-6 mr-2" />
              {t('home.createGame')}
            </Button>

            <Button
              onClick={() => { if (playerName.trim()) setView('join') }}
              disabled={!playerName.trim()}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-quiz-blue to-quiz-purple hover:from-quiz-blue hover:to-quiz-blue text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-6 h-6 mr-2" />
              {t('home.joinGame')}
            </Button>

            {/* Rejoin Last Game */}
            {lastRoomInfo && (
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-300 font-bold text-sm">{t('home.rejoinGame')}</p>
                      <p className="text-gray-400 text-xs">{t('home.rejoinRoom')}: <span className="text-yellow-400 font-mono font-bold">{lastRoomInfo.code}</span></p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={handleRejoinGame}
                        className="bg-green-600 hover:bg-green-700 text-white">
                        <RotateCcw className="w-4 h-4 mr-1" />{t('home.rejoin')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setLastRoomInfo(null); localStorage.removeItem('quizblitz_lastroom') }}
                        className="text-gray-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={async () => {
                setIsLoadingHallOfFame(true)
                try {
                  const res = await fetch('/api/hall-of-fame')
                  const data = await res.json()
                  if (data.rankings) {
                    setHallOfFameData(data.rankings)
                    setHallOfFameWeekStart(data.weekStart || '')
                    setHallOfFameWeekEnd(data.weekEnd || '')
                  }
                } catch (err) {
                  console.error('Failed to fetch Hall of Fame:', err)
                } finally {
                  setIsLoadingHallOfFame(false)
                }
                setView('halloffame')
              }}
              variant="outline"
              className="w-full h-12 text-lg font-bold border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 transition-all"
            >
              <Trophy className="w-5 h-5 mr-2" />{t('game.viewHallOfFame')}
            </Button>
          </div>

          {/* Language Selector on Home */}
          <div className="w-full max-w-md mt-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <LanguageSelector onLocaleChange={handleLocaleChange} />
          </div>
        </div>
      )}

      {/* ====== CREATE GAME VIEW ====== */}
      {view === 'create' && (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => { setView('home'); setQuestions([]) }} className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('create.back')}
              </Button>
              <LanguageSelector compact onLocaleChange={handleLocaleChange} />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">{t('create.title')}</h2>
            <p className="text-gray-400 mb-6">{t('create.subtitle')}</p>

            {/* Tabs for Create / Saved Quizzes */}
            <Tabs defaultValue="create" className="mb-6">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="create" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">
                  <Sparkles className="w-4 h-4 mr-1" /> {t('create.createNew')}
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400" disabled={!session?.user}>
                  <Bookmark className="w-4 h-4 mr-1" /> {t('create.mySavedQuizzes')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saved" className="mt-4">
                {!session?.user ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 text-center">
                      <User className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 mb-3">{t('create.signInToView')}</p>
                      <Button onClick={() => { setAuthMode('login'); setShowAuthModal(true) }} className="bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
                        {t('auth.signIn')}
                      </Button>
                    </CardContent>
                  </Card>
                ) : isLoadingSaved ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                  </div>
                ) : savedQuizzes.length === 0 ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 text-center">
                      <Bookmark className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">{t('create.noSavedQuizzes')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {savedQuizzes.map((q) => (
                      <Card key={q.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{q.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span>{q.categoryName}</span>
                                <span>•</span>
                                <span>{q.questionCount} Qs</span>
                                <span>•</span>
                                <span>{q.difficulty}</span>
                                <span>•</span>
                                <span>{q.timePerQuestion}{t('create.seconds')}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" onClick={() => loadSavedQuiz(q.id)} className="bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
                                <FolderOpen className="w-4 h-4 mr-1" />{t('create.load')}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteSavedQuiz(q.id)} className="text-gray-400 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create" className="mt-4">
                {/* Category Selection */}
                <div className="mb-8">
                  <Label className="text-lg font-semibold text-white mb-3 block">{t('create.chooseCategory')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      const isSelected = selectedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.id); setQuestions([]) }}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.03] active:scale-[0.97] ${
                            isSelected ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20' : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <span className={`text-sm font-medium text-center ${isSelected ? 'text-yellow-300' : 'text-gray-300'}`}>{tc(cat.id)}</span>
                          {isSelected && <Check className="absolute top-2 right-2 w-4 h-4 text-yellow-400" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Game Settings */}
                {selectedCategory && (
                  <Card className="bg-white/5 border-white/10 mb-6 animate-fade-in">
                    <CardHeader><CardTitle className="text-white">{t('create.gameSettings')}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-300 mb-2 block">{t('create.questionsLabel')}</Label>
                          <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>{[5, 10, 15, 20, 25, 30].map(n => <SelectItem key={n} value={n.toString()}>{n} {t('create.questionsLabel')}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300 mb-2 block">{t('create.difficulty')}</Label>
                          <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">{t('create.easy')}</SelectItem>
                              <SelectItem value="medium">{t('create.medium')}</SelectItem>
                              <SelectItem value="hard">{t('create.hard')}</SelectItem>
                              <SelectItem value="mixed">{t('create.mixed')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300 mb-2 block">{t('create.timePerQuestion')}</Label>
                          <Select value={timePerQuestion.toString()} onValueChange={(v) => setTimePerQuestion(parseInt(v))}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>{[10, 15, 20, 30].map(n => <SelectItem key={n} value={n.toString()}>{n}{t('create.seconds')}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button onClick={generateQuestions} disabled={isGenerating || !selectedCategory}
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue hover:from-quiz-purple hover:to-quiz-purple text-white">
                        {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t('create.generating')}</> : <><Sparkles className="w-5 h-5 mr-2" />{t('create.autoGenerate')}</>}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Add Custom Question Section */}
            <div className="mb-6">
              {!showCustomForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full h-12 border-dashed border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-200"
                >
                  <Plus className="w-5 h-5 mr-2" />{t('create.addCustomQuestion')}
                </Button>
              ) : (
                <Card className="bg-white/5 border-purple-500/30 border-2 animate-fade-in">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-purple-400" />{t('create.customQuestion')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">{t('create.questionText')}</Label>
                      <Textarea
                        value={customQuestion.text}
                        onChange={(e) => setCustomQuestion(prev => ({ ...prev, text: e.target.value }))}
                        placeholder={t('create.questionTextPlaceholder')}
                        className="bg-white/5 border-white/10 text-white min-h-[60px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="custom-correct"
                            checked={customQuestion.correctAnswer === opt}
                            onChange={() => setCustomQuestion(prev => ({ ...prev, correctAnswer: opt }))}
                            className="accent-yellow-400"
                          />
                          <Input
                            value={customQuestion[opt]}
                            onChange={(e) => setCustomQuestion(prev => ({ ...prev, [opt]: e.target.value }))}
                            placeholder={t(`create.${opt}`)}
                            className={`bg-white/5 border-white/10 text-white text-sm ${customQuestion.correctAnswer === opt ? 'border-green-500 ring-1 ring-green-500/30' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{t('create.markCorrect')}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={addCustomQuestion}
                        disabled={!customQuestion.text.trim() || !customQuestion.optionA.trim() || !customQuestion.optionB.trim() || !customQuestion.optionC.trim() || !customQuestion.optionD.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />{t('create.addQuestion')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setShowCustomForm(false); setCustomQuestion({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'optionA' }) }} className="text-gray-400">
                        {t('create.cancel')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" />{t('create.questionsLabel')} ({questions.length})
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {/* Save Quiz Button */}
                    {session?.user ? (
                      <div className="flex items-center gap-2">
                        <Input value={saveQuizName} onChange={(e) => setSaveQuizName(e.target.value)}
                          placeholder={t('create.quizNamePlaceholder')} className="h-8 w-32 bg-white/5 border-white/10 text-white text-xs" />
                        <Button variant="outline" size="sm" onClick={handleSaveQuiz} disabled={isSavingQuiz}
                          className="border-white/20 text-gray-300 hover:text-white">
                          {saveSuccess ? <><Check className="w-4 h-4 mr-1 text-green-400" />{t('create.saved')}</> :
                            isSavingQuiz ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> :
                            <><Bookmark className="w-4 h-4 mr-1" />{t('create.saveBtn')}</>}
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                        className="border-white/20 text-gray-400 hover:text-white">
                        <Bookmark className="w-4 h-4 mr-1" />{t('create.saveQuiz')}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={generateQuestions} disabled={isGenerating} className="border-white/20 text-gray-300 hover:text-white">
                      <RotateCcw className="w-4 h-4 mr-1" />{t('create.regenerate')}
                    </Button>
                    <Button onClick={handleCreateRoom} className="bg-gradient-to-r from-quiz-green to-emerald-600 text-white font-bold">
                      {t('create.createRoom')} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {isTranslating && (
                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-purple-300 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Translating questions...</span>
                    </div>
                  )}
                  {questions.map((q, index) => (
                    <Card key={q.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        {editingQuestion === index ? (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-400 text-xs mb-1 block">{t('create.question')} {index + 1}</Label>
                              <Textarea value={editForm?.text || ''} onChange={(e) => setEditForm(prev => prev ? { ...prev, text: e.target.value } : null)} className="bg-white/5 border-white/10 text-white min-h-[60px]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((opt) => (
                                <div key={opt} className="flex items-center gap-2">
                                  <input type="radio" name={`correct-${index}`} checked={editForm?.correctAnswer === opt} onChange={() => setEditForm(prev => prev ? { ...prev, correctAnswer: opt } : null)} className="accent-yellow-400" />
                                  <Input value={editForm?.[opt] || ''} onChange={(e) => setEditForm(prev => prev ? { ...prev, [opt]: e.target.value } : null)}
                                    className={`bg-white/5 border-white/10 text-white text-sm ${editForm?.correctAnswer === opt ? 'border-green-500' : ''}`} placeholder={opt.toUpperCase()} />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">{t('create.selectCorrect')}</p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEditedQuestion(index)} className="bg-green-600 hover:bg-green-700 text-white"><Save className="w-4 h-4 mr-1" />{t('create.saveBtn')}</Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingQuestion(null); setEditForm(null) }} className="text-gray-400">{t('create.cancel')}</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-white font-medium mb-2"><span className="text-yellow-400 mr-2">{t('create.question')}{index + 1}.</span>{q.text}</p>
                              <div className="grid grid-cols-2 gap-1.5 text-sm">
                                {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((opt) => (
                                  <div key={opt} className={`px-2 py-1 rounded text-xs ${q.correctAnswer === opt ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-white/5 text-gray-400'}`}>
                                    {opt.charAt(6).toUpperCase()}: {q[opt]}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingQuestion(index); setEditForm({ ...q }) }} className="text-gray-400 hover:text-yellow-400 h-8 w-8 p-0"><Edit3 className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteQuestion(index)} className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  {createError && (
                    <div className="mb-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                      {createError}
                    </div>
                  )}
                  <Button onClick={handleCreateRoom} size="lg" className="h-14 px-12 text-lg font-bold bg-gradient-to-r from-quiz-green to-emerald-600 hover:from-quiz-green hover:to-quiz-green text-white shadow-lg shadow-green-500/20">
                    <Play className="w-5 h-5 mr-2" />{t('create.createRoomStart')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== JOIN GAME VIEW ====== */}
      {view === 'join' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => { setView('home'); setJoinError('') }} className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />{t('create.back')}
              </Button>
              <LanguageSelector compact onLocaleChange={handleLocaleChange} />
            </div>
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-center text-2xl">{t('join.title')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">{t('join.roomCode')}</Label>
                  <Input value={roomCode} onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('join.roomCodePlaceholder')} className="h-14 text-2xl text-center tracking-[0.5em] font-mono bg-white/5 border-white/10 text-white placeholder:text-gray-500 placeholder:tracking-normal" maxLength={6} />
                </div>
                <div>
                  <Label className="text-gray-300 mb-2 block">{t('join.yourName')}</Label>
                  <div className="flex gap-2">
                    <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder={t('join.namePlaceholder')} className="h-12 text-lg bg-white/5 border-white/10 text-white flex-1" maxLength={20} />
                    <Button
                      onClick={() => setPlayerName(generateFunnyName(locale))}
                      className="h-12 px-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-500 hover:to-yellow-500 text-white font-bold shrink-0"
                      title={t('home.funnyName')}
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {joinError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">{joinError}</div>}
                <Button onClick={handleJoinRoom} disabled={!roomCode || roomCode.length !== 6 || !playerName.trim()}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-quiz-blue to-quiz-purple hover:from-quiz-blue hover:to-quiz-blue text-white">
                  <LogIn className="w-5 h-5 mr-2" />{t('join.joinGame')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ====== LOBBY VIEW ====== */}
      {view === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg animate-slide-up">
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-quiz-purple to-quiz-blue p-6 text-center relative">
                <div className="absolute top-3 right-3">
                  <LanguageSelector compact onLocaleChange={handleLocaleChange} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('lobby.title')}</h2>
                <p className="text-white/70">{categoryName}</p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">{t('lobby.roomCode')}</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl font-mono font-black tracking-[0.3em] text-yellow-400">{roomCode}</span>
                    <Button variant="ghost" size="sm" onClick={copyRoomCode} className="text-gray-400 hover:text-white">
                      {codeCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{t('join.shareCode')}</p>
                </div>

                <Separator className="bg-white/10" />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300 font-medium">{t('lobby.players')} ({players.length})</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {players.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium flex-1">{p.name}</span>
                        {p.isCreator && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="w-3 h-3 mr-1" />{t('lobby.creator')}</Badge>}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">{t('lobby.questions')}</p>
                    <p className="text-white font-bold text-lg">{questions.length || totalQuestions}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">{t('lobby.timePerQuestion')}</p>
                    <p className="text-white font-bold text-lg">{timePerQuestion}{t('create.seconds')}</p>
                  </div>
                </div>

                {/* Cast to TV button */}
                {isCreator && (
                  <Button variant="outline" onClick={() => setShowCastModal(true)}
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 h-11">
                    <Monitor className="w-5 h-5 mr-2" /> {t('lobby.castToTV')}
                  </Button>
                )}

                {isCreator ? (
                  <Button onClick={handleStartGame} disabled={players.length < 1}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-quiz-green to-emerald-600 hover:from-quiz-green hover:to-quiz-green text-white shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Play className="w-5 h-5 mr-2" />{t('lobby.startGame')}
                  </Button>
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    {t('lobby.waitingForCreator')}
                  </div>
                )}

                {/* Quit Game Button */}
                {!showQuitConfirm ? (
                  <Button variant="ghost" onClick={() => setShowQuitConfirm(true)}
                    className="w-full text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />{t('lobby.quitGame')}
                  </Button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center space-y-3">
                    <p className="text-red-300 text-sm font-medium">{t('lobby.quitConfirm')}</p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={handleQuitGame} className="bg-red-600 hover:bg-red-700 text-white">
                        <LogOut className="w-4 h-4 mr-1" />{t('lobby.quitYes')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowQuitConfirm(false)} className="text-gray-400 hover:text-white">
                        {t('lobby.quitNo')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ====== GAME PLAY VIEW ====== */}
      {view === 'game' && currentQuestion && (
        <div
          className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full select-none"
          style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
          onContextMenu={e => e.preventDefault()}
          onCopy={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
          onDragStart={e => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
            </Badge>
            <div className="flex items-center gap-2">
              <LanguageSelector compact onLocaleChange={handleLocaleChange} />
              <Button variant="ghost" size="sm" onClick={() => setShowCastModal(true)} className="text-gray-400 hover:text-purple-300 h-8">
                <Monitor className="w-4 h-4" />
              </Button>
              {!showQuitConfirm ? (
                <Button variant="ghost" size="sm" onClick={() => setShowQuitConfirm(true)} className="text-gray-500 hover:text-red-400 h-8">
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowQuitConfirm(false)}>
                  <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-sm w-full text-center space-y-4" onClick={e => e.stopPropagation()}>
                    <LogOut className="w-8 h-8 text-red-400 mx-auto" />
                    <p className="text-white font-bold">{t('game.quitGame')}</p>
                    <p className="text-gray-400 text-sm">{t('game.quitConfirm')}</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleQuitGame} className="bg-red-600 hover:bg-red-700 text-white">
                        <LogOut className="w-4 h-4 mr-1" />{t('game.quitYes')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowQuitConfirm(false)} className="border-white/20 text-gray-300">
                        {t('game.quitNo')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <Badge className="bg-white/10 text-gray-300 border-white/20">{categoryName}</Badge>
            </div>
          </div>

          {/* Timer — independent per player, stops when they answer */}
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-1">
              <Clock className={`w-5 h-5 ${answerSubmitted ? 'text-green-400' : timeLeft <= 5 ? 'text-red-400 animate-countdown-pulse' : 'text-gray-400'}`} />
              <span className={`text-2xl font-bold tabular-nums ${answerSubmitted ? 'text-green-400' : timeLeft <= 5 ? 'text-red-400 animate-countdown-pulse' : 'text-white'}`}>
                {answerSubmitted ? '✓' : `${Math.ceil(timeLeft)}${t('create.seconds')}`}
              </span>
              {!answerSubmitted && (
                <span className="text-xs text-yellow-400/70 font-medium">
                  {t('game.pointsAvailable')}: {Math.round(500 + (timeLeft / currentQuestion.timeLimit) * 500)}
                </span>
              )}
            </div>
            <Progress
              value={answerSubmitted ? 100 : (timeLeft / currentQuestion.timeLimit) * 100}
              className={`h-3 ${answerSubmitted ? '[&>div]:bg-green-500' : timeLeft <= 5 ? '[&>div]:bg-red-500' : '[&>div]:bg-quiz-green'}`}
            />
          </div>

          {/* Question */}
          <Card className="bg-white/5 border-white/10 my-4">
            <CardContent className="p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white text-center">{currentQuestion.text}</h2>
            </CardContent>
          </Card>

          {/* Answer Options — correct answer is NOT revealed until all players answer or time expires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {[
              { key: 'optionA', value: currentQuestion.optionA, cls: 'quiz-option-red', icon: '▲' },
              { key: 'optionB', value: currentQuestion.optionB, cls: 'quiz-option-blue', icon: '◆' },
              { key: 'optionC', value: currentQuestion.optionC, cls: 'quiz-option-yellow', icon: '●' },
              { key: 'optionD', value: currentQuestion.optionD, cls: 'quiz-option-green', icon: '■' },
            ].map((opt) => {
              const isSelected = selectedAnswer === opt.key
              return (
                <button key={opt.key} onClick={() => handleSubmitAnswer(opt.key)} disabled={answerSubmitted}
                  className={`relative p-4 md:p-6 rounded-xl text-white font-bold text-left transition-all
                    ${answerSubmitted && isSelected ? 'ring-4 ring-white/60 scale-[0.98] opacity-80' : ''}
                    ${answerSubmitted && !isSelected ? 'opacity-30' : ''}
                    ${!answerSubmitted ? `${opt.cls} hover:scale-[1.02] active:scale-[0.98] cursor-pointer` : ''}
                    ${!answerSubmitted ? 'cursor-pointer' : 'cursor-default'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black opacity-80">{opt.icon}</span>
                    <span className="text-base md:text-lg">{opt.value}</span>
                  </div>
                  {answerSubmitted && isSelected && <div className="absolute top-2 right-2"><CheckCircle2 className="w-6 h-6 text-white/60" /></div>}
                </button>
              )
            })}
          </div>

          {/* Waiting for answer reveal — shown after answering, NO correct answer shown yet */}
          {answerSubmitted && (
            <div className="mt-3 p-4 rounded-xl text-center bg-purple-500/15 border border-purple-500/25">
              <div className="flex items-center justify-center gap-2 text-purple-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">{t('game.waitingForReveal') || 'Waiting for reveal...'}</span>
              </div>
            </div>
          )}

          {/* Waiting for others — shown after answering, no more creator-only buttons */}
          <div className="mt-4 text-center">
            {answerSubmitted && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{t('game.submitted')}</span>
                </div>
                {currentQuestion.answerCount !== undefined && currentQuestion.totalPlayers && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{currentQuestion.answerCount} / {currentQuestion.totalPlayers} {t('game.playersAnswered')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{t('game.waitingForOthers')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== QUESTION RESULTS VIEW ====== */}
      {view === 'results' && questionResults && (
        <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
          <div className="text-center mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-2">{t('results.title')}</h2>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-gray-400">{questionResults.correctCount}/{questionResults.totalAnswers} {t('results.correct')}</span>
              <span className="text-gray-500">|</span>
              <span className="text-yellow-400">{t('results.correctAnswer')}: {questionResults.correctAnswer.replace('option', '').toUpperCase()}</span>
            </div>
          </div>

          {/* My result */}
          {(() => {
            const myResult = questionResults.results?.find((r: any) => r.playerId === playerId)
            if (!myResult) return null
            return (
              <div className={`w-full p-6 rounded-xl mb-6 text-center animate-slide-up ${myResult.correct ? 'bg-green-500/20 border-2 border-green-500/30' : 'bg-red-500/20 border-2 border-red-500/30'}`}>
                {myResult.correct ? <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-2" /> : <XCircle className="w-16 h-16 text-red-400 mx-auto mb-2" />}
                <p className={`text-2xl font-bold ${myResult.correct ? 'text-green-400' : 'text-red-400'}`}>{myResult.correct ? t('results.correctExclaim') : t('results.wrong')}</p>
                {myResult.correct && myResult.points > 0 && <p className="text-yellow-400 text-lg font-bold mt-1">+{myResult.points} {t('results.points')}</p>}
              </div>
            )
          })()}

          {/* Standings */}
          <div className="w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />{t('results.standings')}</h3>
            <div className="space-y-2">
              {(questionResults.leaderboard || []).slice(0, 10).map((p: any) => (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg ${p.id === playerId ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'}`}>
                  <span className={`font-bold text-lg w-8 ${p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-gray-300' : p.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>{p.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">{p.name.charAt(0).toUpperCase()}</div>
                  <span className="text-white font-medium flex-1">{p.name}</span>
                  <span className="text-yellow-400 font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-continue countdown — results show for 2 seconds then next question starts automatically */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('game.nextQuestionAuto')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ====== FINAL LEADERBOARD VIEW ====== */}
      {view === 'leaderboard' && (
        <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
          {/* Confetti-style celebration header */}
          <div className="text-center mb-6 animate-slide-up">
            <div className="relative inline-block">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              <Sparkles className="w-4 h-4 text-purple-300 absolute -top-2 left-0 animate-pulse delay-300" />
            </div>
            <h2 className="text-3xl font-black text-white">{t('leaderboard.title')}</h2>
          </div>

          {/* Enhanced Podium */}
          {finalLeaderboard.length >= 1 && (
            <div className="flex items-end justify-center gap-2 sm:gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {finalLeaderboard[1] && (
                <div className="text-center w-24 sm:w-28">
                  <div className="text-xs text-gray-300 mb-1 font-bold">{t('leaderboard.second')}</div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-900 font-bold text-xl mx-auto mb-1 ring-2 ring-gray-300/50">{finalLeaderboard[1].name.charAt(0).toUpperCase()}</div>
                  <p className="text-white font-bold text-xs truncate">{finalLeaderboard[1].name}</p>
                  <p className="text-gray-300 text-xs font-semibold">{finalLeaderboard[1].score} pts</p>
                  <div className="bg-gradient-to-t from-gray-400/40 to-gray-400/20 h-20 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-3xl font-black text-gray-300">2</span></div>
                </div>
              )}
              {finalLeaderboard[0] && (
                <div className="text-center w-28 sm:w-32">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-1 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-gray-900 font-bold text-2xl mx-auto mb-1 ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-500/20">{finalLeaderboard[0].name.charAt(0).toUpperCase()}</div>
                  <p className="text-yellow-400 font-bold truncate">{finalLeaderboard[0].name}</p>
                  <p className="text-yellow-300 text-sm font-semibold">{finalLeaderboard[0].score} pts</p>
                  <div className="bg-gradient-to-t from-yellow-400/40 to-yellow-400/20 h-28 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-4xl font-black text-yellow-400">1</span></div>
                </div>
              )}
              {finalLeaderboard[2] && (
                <div className="text-center w-24 sm:w-28">
                  <div className="text-xs text-amber-400 mb-1 font-bold">{t('leaderboard.third')}</div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl mx-auto mb-1 ring-2 ring-amber-500/50">{finalLeaderboard[2].name.charAt(0).toUpperCase()}</div>
                  <p className="text-white font-bold text-xs truncate">{finalLeaderboard[2].name}</p>
                  <p className="text-amber-300 text-xs font-semibold">{finalLeaderboard[2].score} pts</p>
                  <div className="bg-gradient-to-t from-amber-500/40 to-amber-500/20 h-14 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-3xl font-black text-amber-500">3</span></div>
                </div>
              )}
            </div>
          )}

          {/* Game Summary Card */}
          <Card className="bg-white/5 border-white/10 w-full mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('leaderboard.gameSummary')}</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-white font-bold text-lg">{gameCategoryName || categoryName}</p>
                  <p className="text-gray-500 text-xs">{t('leaderboard.category')}</p>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{finalLeaderboard.length > 0 ? finalLeaderboard[0]?.correctAnswers !== undefined ? `${finalLeaderboard.reduce((a: number, p: any) => a + (p.correctAnswers || 0), 0)}` : '-' : '-'}</p>
                  <p className="text-gray-500 text-xs">{t('leaderboard.difficulty')}</p>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{gameQuestions.length || totalQuestions}</p>
                  <p className="text-gray-500 text-xs">{t('leaderboard.totalQuestions')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Leaderboard */}
          <div className="w-full space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {finalLeaderboard.map((p: any) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                p.rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                p.rank === 2 ? 'bg-gray-400/10 border border-gray-400/20' :
                p.rank === 3 ? 'bg-amber-500/10 border border-amber-500/20' :
                p.id === playerId ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'
              }`}>
                <span className={`font-bold text-lg w-8 ${
                  p.rank === 1 ? 'text-yellow-400' :
                  p.rank === 2 ? 'text-gray-300' :
                  p.rank === 3 ? 'text-amber-500' : 'text-gray-500'
                }`}>{p.rank}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  p.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-900' :
                  p.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                  p.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                  'bg-gradient-to-br from-purple-400 to-pink-400'
                }`}>{p.name.charAt(0).toUpperCase()}</div>
                <span className="text-white font-medium flex-1">{p.name}</span>
                <div className="text-right">
                  <span className="text-yellow-400 font-bold block">{p.score} pts</span>
                  <span className="text-gray-500 text-xs">{p.correctAnswers} {t('leaderboard.correctAnswers')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Save Quiz to Dashboard (only for logged-in users) */}
          {session?.user && gameQuestions.length > 0 && (
            <div className="w-full mt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  {!gameQuizSaved ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Save className="w-4 h-4" />
                        <span className="font-semibold text-sm">{t('leaderboard.saveQuiz')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={gameQuizName}
                          onChange={(e) => setGameQuizName(e.target.value)}
                          placeholder={`${gameCategoryName || categoryName} - ${new Date().toLocaleDateString()}`}
                          className="bg-white/5 border-white/10 text-white h-9 text-sm"
                        />
                        <Button
                          onClick={async () => {
                            if (isSavingGameQuiz) return
                            setIsSavingGameQuiz(true)
                            try {
                              const name = gameQuizName || `${gameCategoryName || categoryName} - ${new Date().toLocaleDateString()}`
                              const res = await fetch('/api/quizzes/save', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name,
                                  categoryName: gameCategoryName || categoryName,
                                  questions: gameQuestions,
                                  difficulty: gameDifficulty,
                                  timePerQuestion: 15,
                                }),
                              })
                              const data = await res.json()
                              if (!data.error) {
                                setGameQuizSaved(true)
                              }
                            } catch (err) {
                              console.error('Failed to save game quiz:', err)
                            } finally {
                              setIsSavingGameQuiz(false)
                            }
                          }}
                          disabled={isSavingGameQuiz}
                          className="bg-purple-600 hover:bg-purple-500 text-white h-9 px-4 shrink-0"
                        >
                          {isSavingGameQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">{t('game.quizSaved')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-3 mt-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Button onClick={resetState} className="w-full h-12 text-lg font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
              <RotateCcw className="w-5 h-5 mr-2" />{t('leaderboard.playAgain')}
            </Button>
            <Button
              onClick={async () => {
                setIsLoadingHallOfFame(true)
                try {
                  const res = await fetch('/api/hall-of-fame')
                  const data = await res.json()
                  if (data.rankings) {
                    setHallOfFameData(data.rankings)
                    setHallOfFameWeekStart(data.weekStart || '')
                    setHallOfFameWeekEnd(data.weekEnd || '')
                  }
                } catch (err) {
                  console.error('Failed to fetch Hall of Fame:', err)
                } finally {
                  setIsLoadingHallOfFame(false)
                }
                setView('halloffame')
              }}
              variant="outline"
              className="w-full h-12 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
            >
              <Trophy className="w-5 h-5 mr-2" />{t('leaderboard.viewHallOfFame')}
            </Button>
          </div>
        </div>
      )}

      {/* ====== HALL OF FAME VIEW ====== */}
      {view === 'halloffame' && (
        <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
          <div className="text-center mb-6 animate-slide-up">
            <div className="relative inline-block">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
            </div>
            <h2 className="text-3xl font-black text-white">{t('halloffame.title')}</h2>
            <p className="text-gray-400 text-sm mt-1">{t('halloffame.weeklyRanking')}</p>
            {hallOfFameWeekStart && (
              <p className="text-gray-500 text-xs mt-1">
                {t('halloffame.weekOf')}: {new Date(hallOfFameWeekStart).toLocaleDateString()} - {new Date(hallOfFameWeekEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          {isLoadingHallOfFame ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : hallOfFameData.length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{t('halloffame.noResults')}</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {hallOfFameData.length >= 1 && (
                <div className="flex items-end justify-center gap-2 sm:gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  {hallOfFameData[1] && (
                    <div className="text-center w-24 sm:w-28">
                      <div className="text-xs text-gray-300 mb-1 font-bold">{t('halloffame.runnerUp')}</div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-900 font-bold text-lg mx-auto mb-1 ring-2 ring-gray-300/50">{hallOfFameData[1].playerName.charAt(0).toUpperCase()}</div>
                      <p className="text-white font-bold text-xs truncate">{hallOfFameData[1].playerName}</p>
                      <p className="text-gray-300 text-xs font-semibold">{hallOfFameData[1].bestScore} pts</p>
                      <div className="bg-gradient-to-t from-gray-400/40 to-gray-400/20 h-16 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-2xl font-black text-gray-300">2</span></div>
                    </div>
                  )}
                  {hallOfFameData[0] && (
                    <div className="text-center w-28 sm:w-32">
                      <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-1" />
                      <div className="text-xs text-yellow-400 mb-1 font-bold">{t('halloffame.champion')}</div>
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-gray-900 font-bold text-xl mx-auto mb-1 ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-500/20">{hallOfFameData[0].playerName.charAt(0).toUpperCase()}</div>
                      <p className="text-yellow-400 font-bold text-sm truncate">{hallOfFameData[0].playerName}</p>
                      <p className="text-yellow-300 text-sm font-semibold">{hallOfFameData[0].bestScore} pts</p>
                      <div className="bg-gradient-to-t from-yellow-400/40 to-yellow-400/20 h-24 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-3xl font-black text-yellow-400">1</span></div>
                    </div>
                  )}
                  {hallOfFameData[2] && (
                    <div className="text-center w-24 sm:w-28">
                      <div className="text-xs text-amber-400 mb-1 font-bold">{t('halloffame.thirdPlace')}</div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-lg mx-auto mb-1 ring-2 ring-amber-500/50">{hallOfFameData[2].playerName.charAt(0).toUpperCase()}</div>
                      <p className="text-white font-bold text-xs truncate">{hallOfFameData[2].playerName}</p>
                      <p className="text-amber-300 text-xs font-semibold">{hallOfFameData[2].bestScore} pts</p>
                      <div className="bg-gradient-to-t from-amber-500/40 to-amber-500/20 h-12 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-2xl font-black text-amber-500">3</span></div>
                    </div>
                  )}
                </div>
              )}

              {/* Full Ranking List */}
              <div className="w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">{t('halloffame.top50')}</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {hallOfFameData.map((entry: any) => (
                    <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-lg ${
                      entry.rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      entry.rank === 2 ? 'bg-gray-400/10 border border-gray-400/20' :
                      entry.rank === 3 ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-white/5'
                    }`}>
                      <span className={`font-bold text-lg w-8 ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-amber-500' : 'text-gray-500'
                      }`}>{entry.rank}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-900' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                        entry.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' :
                        'bg-gradient-to-br from-purple-400 to-pink-400 text-white'
                      }`}>{entry.playerName.charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{entry.playerName}</p>
                        <p className="text-gray-500 text-xs">{entry.totalGames} {t('halloffame.gamesPlayed')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-yellow-400 font-bold">{entry.bestScore}</span>
                        <p className="text-gray-500 text-xs">{t('halloffame.bestScore')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button onClick={resetState} className="mt-8 h-12 px-8 font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />{t('halloffame.backToHome')}
          </Button>
        </div>
      )}
    </div>
  )
}
