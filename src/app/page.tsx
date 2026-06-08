'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Trophy, Users, Play, Plus, LogIn, Zap, Clock,
  CheckCircle2, XCircle, Crown, Sparkles, ChevronRight,
  RotateCcw, Trash2, Edit3, Save, ArrowLeft, Loader2,
  Copy, Check, Gamepad2, BookOpen, Brain, Globe,
  FlaskConical, Music, Film, Dumbbell, Utensils, TreePine,
  Rocket, Palette, Landmark, Calculator, PawPrint, Languages,
  Heart, Star, Swords, Award, Mic2, Laptop, Mountain, Shield,
} from 'lucide-react'

// ==================== TYPES ====================
interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
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

type GameView = 'home' | 'create' | 'join' | 'lobby' | 'game' | 'results' | 'leaderboard'

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

// ==================== MAIN APP ====================
export default function QuizBlitzApp() {
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
  const [lastResultsStatus, setLastResultsStatus] = useState<string>('')

  // Leaderboard
  const [finalLeaderboard, setFinalLeaderboard] = useState<any[]>([])

  // Join error
  const [joinError, setJoinError] = useState('')

  // Code copied state
  const [codeCopied, setCodeCopied] = useState(false)

  // Polling ref
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

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
          // Reset answer state if it's a new question
          setCurrentQuestion(prev => {
            if (prev?.id !== data.currentQuestion.id) {
              setSelectedAnswer(null)
              setAnswerSubmitted(false)
              setQuestionResults(null)
            }
            return data.currentQuestion
          })
          setTimeLeft(data.currentQuestion.timeLeft)
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
          if (view !== 'leaderboard') setView('leaderboard')
          if (pollRef.current) clearInterval(pollRef.current)
        } else if (data.status === 'lobby') {
          if (view !== 'lobby') setView('lobby')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 1000)
  }, [view])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  // Timer countdown
  useEffect(() => {
    if (view !== 'game' || !currentQuestion) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) return 0
        return Math.max(0, prev - 0.1)
      })
    }, 100)
    return () => clearInterval(timer)
  }, [view, currentQuestion?.id])

  // Auto-advance for creator when time runs out
  const autoAdvanceRef = useRef(false)
  useEffect(() => {
    if (view !== 'game' || !isCreator || !roomCode || !currentQuestion) return
    if (timeLeft <= 0 && answerSubmitted && !autoAdvanceRef.current) {
      autoAdvanceRef.current = true
      // Auto advance when time runs out
      fetch('/api/game/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId }),
      }).then(res => res.json()).then(data => {
        if (data.success) {
          setQuestionResults(data.questionResults)
          if (data.isFinished) {
            setFinalLeaderboard(data.leaderboard || [])
            setView('leaderboard')
            stopPolling()
          } else {
            setView('results')
          }
        }
        autoAdvanceRef.current = false
      }).catch(() => { autoAdvanceRef.current = false })
    }
  }, [timeLeft, view, isCreator, roomCode, playerId, currentQuestion, answerSubmitted, stopPolling])

  const resetState = useCallback(() => {
    stopPolling()
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
    setTimeLeft(0)
  }, [stopPolling])

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
        }),
      })
      const data = await res.json()
      if (data.questions) {
        setQuestions(data.questions)
      }
    } catch (err) {
      console.error('Failed to generate questions:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!playerName.trim() || !selectedCategory || questions.length === 0) return
    try {
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          categoryName: CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory,
          questions,
          timePerQuestion,
        }),
      })
      const data = await res.json()
      if (data.code) {
        setPlayerId(data.playerId)
        setRoomCode(data.code)
        setIsCreator(true)
        setView('lobby')
        startPolling(data.code, data.playerId)
      }
    } catch (err) {
      console.error('Failed to create room:', err)
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
    } catch (err) {
      console.error('Failed to submit answer:', err)
    }
  }

  const handleAdvanceQuestion = async () => {
    if (!roomCode || !playerId || !isCreator) return
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
        } else {
          setView('results')
        }
      }
    } catch (err) {
      console.error('Failed to advance:', err)
    }
  }

  const handleContinueToNextQuestion = async () => {
    if (!roomCode || !playerId || !isCreator) return
    try {
      await fetch('/api/game/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerId }),
      })
      // The polling will detect the state change
    } catch (err) {
      console.error('Failed to continue:', err)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Save edited question
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

  // Fetch question results when in results view
  useEffect(() => {
    if (view !== 'results' || !roomCode || !playerId || !isCreator) return
    // Creator already has results from advance call
  }, [view])

  // Player in results view needs to get results
  // They'll get them from polling when the status changes back to playing
  // For now, let's also fetch results for players

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      {/* ====== HOME VIEW ====== */}
      {view === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-12 h-12 text-yellow-400" />
              <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-purple-500 bg-clip-text text-transparent">
                QuizBlitz
              </h1>
              <Zap className="w-12 h-12 text-yellow-400" />
            </div>
            <p className="text-xl text-gray-400 max-w-md mx-auto">
              Create live quiz games, compete in real-time, and dominate the leaderboard!
            </p>
          </div>

          <div className="w-full max-w-md space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your nickname..."
              className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
              maxLength={20}
            />

            <Button
              onClick={() => { if (playerName.trim()) setView('create') }}
              disabled={!playerName.trim()}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-quiz-red to-quiz-orange hover:from-quiz-red hover:to-quiz-red text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Game
            </Button>

            <Button
              onClick={() => { if (playerName.trim()) setView('join') }}
              disabled={!playerName.trim()}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-quiz-blue to-quiz-purple hover:from-quiz-blue hover:to-quiz-blue text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-6 h-6 mr-2" />
              Join Game
            </Button>
          </div>
        </div>
      )}

      {/* ====== CREATE GAME VIEW ====== */}
      {view === 'create' && (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => { setView('home'); setQuestions([]) }} className="mb-4 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <h2 className="text-3xl font-bold text-white mb-2">Create a Game</h2>
            <p className="text-gray-400 mb-6">Pick a category, auto-generate questions, then customize anything you want.</p>

            {/* Category Selection */}
            <div className="mb-8">
              <Label className="text-lg font-semibold text-white mb-3 block">Choose a Category</Label>
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
                      <span className={`text-sm font-medium text-center ${isSelected ? 'text-yellow-300' : 'text-gray-300'}`}>{cat.name}</span>
                      {isSelected && <Check className="absolute top-2 right-2 w-4 h-4 text-yellow-400" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Game Settings */}
            {selectedCategory && (
              <Card className="bg-white/5 border-white/10 mb-6 animate-fade-in">
                <CardHeader><CardTitle className="text-white">Game Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300 mb-2 block">Questions</Label>
                      <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{[5, 10, 15, 20, 25, 30].map(n => <SelectItem key={n} value={n.toString()}>{n} Questions</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-2 block">Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-2 block">Time / Question</Label>
                      <Select value={timePerQuestion.toString()} onValueChange={(v) => setTimePerQuestion(parseInt(v))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{[10, 15, 20, 30].map(n => <SelectItem key={n} value={n.toString()}>{n}s</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={generateQuestions} disabled={isGenerating || !selectedCategory}
                    className="w-full h-12 text-lg font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue hover:from-quiz-purple hover:to-quiz-purple text-white">
                    {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Questions...</> : <><Sparkles className="w-5 h-5 mr-2" />Auto-Generate Questions</>}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" />Questions ({questions.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={generateQuestions} disabled={isGenerating} className="border-white/20 text-gray-300 hover:text-white">
                      <RotateCcw className="w-4 h-4 mr-1" />Regenerate
                    </Button>
                    <Button onClick={handleCreateRoom} className="bg-gradient-to-r from-quiz-green to-emerald-600 text-white font-bold">
                      Create Room <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <Card key={q.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        {editingQuestion === index ? (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-400 text-xs mb-1 block">Question {index + 1}</Label>
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
                            <p className="text-xs text-gray-500">Select radio to mark correct answer</p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEditedQuestion(index)} className="bg-green-600 hover:bg-green-700 text-white"><Save className="w-4 h-4 mr-1" />Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingQuestion(null); setEditForm(null) }} className="text-gray-400">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-white font-medium mb-2"><span className="text-yellow-400 mr-2">Q{index + 1}.</span>{q.text}</p>
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
                  <Button onClick={handleCreateRoom} size="lg" className="h-14 px-12 text-lg font-bold bg-gradient-to-r from-quiz-green to-emerald-600 hover:from-quiz-green hover:to-quiz-green text-white shadow-lg shadow-green-500/20">
                    <Play className="w-5 h-5 mr-2" />Create Room & Start
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
            <Button variant="ghost" onClick={() => { setView('home'); setJoinError('') }} className="mb-4 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-center text-2xl">Join a Game</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">Room Code</Label>
                  <Input value={roomCode} onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code" className="h-14 text-2xl text-center tracking-[0.5em] font-mono bg-white/5 border-white/10 text-white placeholder:text-gray-500 placeholder:tracking-normal" maxLength={6} />
                </div>
                <div>
                  <Label className="text-gray-300 mb-2 block">Your Name</Label>
                  <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your nickname" className="h-12 text-lg bg-white/5 border-white/10 text-white" maxLength={20} />
                </div>
                {joinError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">{joinError}</div>}
                <Button onClick={handleJoinRoom} disabled={!roomCode || roomCode.length !== 6 || !playerName.trim()}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-quiz-blue to-quiz-purple hover:from-quiz-blue hover:to-quiz-blue text-white">
                  <LogIn className="w-5 h-5 mr-2" />Join Game
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
              <div className="bg-gradient-to-r from-quiz-purple to-quiz-blue p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Game Lobby</h2>
                <p className="text-white/70">{categoryName}</p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Room Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl font-mono font-black tracking-[0.3em] text-yellow-400">{roomCode}</span>
                    <Button variant="ghost" size="sm" onClick={copyRoomCode} className="text-gray-400 hover:text-white">
                      {codeCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Share this code with players to join</p>
                </div>

                <Separator className="bg-white/10" />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300 font-medium">Players ({players.length})</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {players.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium flex-1">{p.name}</span>
                        {p.isCreator && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="w-3 h-3 mr-1" />Creator</Badge>}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Questions</p>
                    <p className="text-white font-bold text-lg">{questions.length || totalQuestions}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs">Time / Question</p>
                    <p className="text-white font-bold text-lg">{timePerQuestion}s</p>
                  </div>
                </div>

                {isCreator ? (
                  <Button onClick={handleStartGame} disabled={players.length < 1}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-quiz-green to-emerald-600 hover:from-quiz-green hover:to-quiz-green text-white shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Play className="w-5 h-5 mr-2" />Start Game
                  </Button>
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Waiting for creator to start the game...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ====== GAME PLAY VIEW ====== */}
      {view === 'game' && currentQuestion && (
        <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
            </Badge>
            <Badge className="bg-white/10 text-gray-300 border-white/20">{categoryName}</Badge>
          </div>

          {/* Timer */}
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-1">
              <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400 animate-countdown-pulse' : 'text-gray-400'}`} />
              <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 5 ? 'text-red-400 animate-countdown-pulse' : 'text-white'}`}>
                {Math.ceil(timeLeft)}s
              </span>
            </div>
            <Progress value={(timeLeft / currentQuestion.timeLimit) * 100} className={`h-3 ${timeLeft <= 5 ? '[&>div]:bg-red-500' : '[&>div]:bg-quiz-green'}`} />
          </div>

          {/* Question */}
          <Card className="bg-white/5 border-white/10 my-4">
            <CardContent className="p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white text-center">{currentQuestion.text}</h2>
            </CardContent>
          </Card>

          {/* Answer Options */}
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
                  className={`${opt.cls} relative p-4 md:p-6 rounded-xl text-white font-bold text-left transition-all
                    ${answerSubmitted && isSelected ? 'ring-4 ring-white scale-[0.98] opacity-90' : ''}
                    ${answerSubmitted && !isSelected ? 'opacity-60' : ''}
                    ${!answerSubmitted ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black opacity-80">{opt.icon}</span>
                    <span className="text-base md:text-lg">{opt.value}</span>
                  </div>
                  {answerSubmitted && isSelected && <div className="absolute top-2 right-2"><Check className="w-6 h-6 text-white" /></div>}
                </button>
              )
            })}
          </div>

          {/* Submitted indicator & Creator advance button */}
          <div className="mt-4 text-center">
            {answerSubmitted && !isCreator && (
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />Answer submitted! Waiting for results...
              </p>
            )}
            {isCreator && answerSubmitted && (
              <Button onClick={handleAdvanceQuestion} className="bg-gradient-to-r from-quiz-purple to-quiz-blue text-white font-bold">
                <ChevronRight className="w-4 h-4 mr-1" />Show Results & Next
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ====== QUESTION RESULTS VIEW ====== */}
      {view === 'results' && questionResults && (
        <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
          <div className="text-center mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-2">Question Results</h2>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-gray-400">{questionResults.correctCount}/{questionResults.totalAnswers} correct</span>
              <span className="text-gray-500">|</span>
              <span className="text-yellow-400">Correct: {questionResults.correctAnswer.replace('option', '').toUpperCase()}</span>
            </div>
          </div>

          {/* My result */}
          {(() => {
            const myResult = questionResults.results?.find((r: any) => r.playerId === playerId)
            if (!myResult) return null
            return (
              <div className={`w-full p-6 rounded-xl mb-6 text-center animate-slide-up ${myResult.correct ? 'bg-green-500/20 border-2 border-green-500/30' : 'bg-red-500/20 border-2 border-red-500/30'}`}>
                {myResult.correct ? <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-2" /> : <XCircle className="w-16 h-16 text-red-400 mx-auto mb-2" />}
                <p className={`text-2xl font-bold ${myResult.correct ? 'text-green-400' : 'text-red-400'}`}>{myResult.correct ? 'Correct!' : 'Wrong!'}</p>
                {myResult.correct && myResult.points > 0 && <p className="text-yellow-400 text-lg font-bold mt-1">+{myResult.points} points</p>}
              </div>
            )
          })()}

          {/* Standings */}
          <div className="w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Standings</h3>
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

          {/* Creator continue button */}
          {isCreator && (
            <div className="mt-6 text-center">
              <Button onClick={handleContinueToNextQuestion} className="bg-gradient-to-r from-quiz-green to-emerald-600 text-white font-bold h-12 px-8 text-lg">
                <ChevronRight className="w-5 h-5 mr-1" />Next Question
              </Button>
            </div>
          )}

          {!isCreator && (
            <div className="mt-6 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Waiting for next question...
            </div>
          )}
        </div>
      )}

      {/* ====== FINAL LEADERBOARD VIEW ====== */}
      {view === 'leaderboard' && (
        <div className="flex-1 flex flex-col items-center p-4 max-w-lg mx-auto w-full">
          <div className="text-center mb-8 animate-slide-up">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-3xl font-black text-white">Game Over!</h2>
            <p className="text-gray-400">Final Standings</p>
          </div>

          {/* Podium */}
          {finalLeaderboard.length >= 1 && (
            <div className="flex items-end justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {finalLeaderboard[1] && (
                <div className="text-center w-28">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-900 font-bold text-xl mx-auto mb-2">{finalLeaderboard[1].name.charAt(0).toUpperCase()}</div>
                  <p className="text-white font-bold text-sm truncate">{finalLeaderboard[1].name}</p>
                  <p className="text-gray-400 text-xs">{finalLeaderboard[1].score} pts</p>
                  <div className="bg-gray-400/30 h-20 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-3xl font-black text-gray-300">2</span></div>
                </div>
              )}
              {finalLeaderboard[0] && (
                <div className="text-center w-32">
                  <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-1" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-gray-900 font-bold text-2xl mx-auto mb-2">{finalLeaderboard[0].name.charAt(0).toUpperCase()}</div>
                  <p className="text-yellow-400 font-bold truncate">{finalLeaderboard[0].name}</p>
                  <p className="text-yellow-300 text-sm">{finalLeaderboard[0].score} pts</p>
                  <div className="bg-yellow-400/30 h-28 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-4xl font-black text-yellow-400">1</span></div>
                </div>
              )}
              {finalLeaderboard[2] && (
                <div className="text-center w-28">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">{finalLeaderboard[2].name.charAt(0).toUpperCase()}</div>
                  <p className="text-white font-bold text-sm truncate">{finalLeaderboard[2].name}</p>
                  <p className="text-gray-400 text-xs">{finalLeaderboard[2].score} pts</p>
                  <div className="bg-amber-500/30 h-14 mt-2 rounded-t-lg flex items-center justify-center"><span className="text-3xl font-black text-amber-500">3</span></div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="w-full space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {finalLeaderboard.map((p: any) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg ${p.id === playerId ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'}`}>
                <span className={`font-bold text-lg w-8 ${p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-gray-300' : p.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>{p.rank}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">{p.name.charAt(0).toUpperCase()}</div>
                <span className="text-white font-medium flex-1">{p.name}</span>
                <div className="text-right">
                  <span className="text-yellow-400 font-bold block">{p.score} pts</span>
                  <span className="text-gray-500 text-xs">{p.correctAnswers} correct</span>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={resetState} className="mt-8 h-12 px-8 text-lg font-bold bg-gradient-to-r from-quiz-purple to-quiz-blue text-white">
            <RotateCcw className="w-5 h-5 mr-2" />Play Again
          </Button>
        </div>
      )}
    </div>
  )
}
