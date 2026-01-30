"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, FastForward, Pause, Maximize2, Minimize2, Users, ArrowRight } from "@/components/icons"
import { AnalysisDisplay } from "@/app/dashboard/workshops/[id]/facilitate/analysis-display"
import type { LocalAnalysisStats, AnalysisResult } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"

// Dummy stats matching the final state of the demo
const MOCK_STATS: LocalAnalysisStats = {
  warmth: 35, // Low warmth -> Vulnerability issue
  heroScores: { hope: 8.5, efficacy: 4.0, resilience: 3.5, optimism: 5.0 }, // Avg 5.25
  focusTags: { mindset: 70, process: 10, environment: 20 }, // Mindset focused (Manager bias)
  responseCount: 4,
  roi: 2.6 // (5.25 / 2) * 1.0 approx
}

// Dummy analysis result matching the "Disconnect" and "Action Blocker" scenario
const MOCK_ANALYSIS: AnalysisResult = {
  gravityStatus: "🌧️ 理想と現実の乖離 (空回り状態)",
  gapScore: 85,
  warmth: 35,
  heroInsight: {
    scores: MOCK_STATS.heroScores,
    strength: "マネージャー層を中心に「未来への希望(Hope: 8.5)」は非常に高く、「良くなる可能性」を強く信じています。",
    pathology: "高い希望に対し、現場の実行効力感(Efficacy: 4.0)が著しく不足しています。「理想は語られるが、足元の手段がない」状態です。",
    risks: ["現場の学習性無力感", "具体策なき精神論への反発"]
  },
  gapAnalysis: {
    managerView: "課題は『メンバーの当事者意識(Mindset)』の欠如にあると認識。",
    memberView: "課題は『失敗を許容しない仕組み(Process)』とリソース不足にあると認識。",
    cognitiveGap: "【認識のズレ】マネージャーは「やる気の問題」と捉え、メンバーは「環境の問題」と捉えています。この前提の違いが対話を噛み合わせなくしています。",
    lemonMarketRisk: "High",
    asymmetryLevel: "High"
  },
  structuralBridge: {
    missingLink: "『精神論』ではなく『明日から使える具体的なツール・制度』",
    bridgeQuality: "Fragile"
  },
  interventionQuestions: {
    mutualUnderstanding: "Q. (Managerへ) メンバーが「やりたくてもできない」と感じている具体的な物理的・制度的障壁は何だと思いますか？",
    suspendedJudgment: "Q. (Memberへ) もし「失敗しても評価が下がらない」としたら、まず何を変えたいですか？",
    smallAgreement: "Q. (All) 明日から試せる「意識を変えずに、仕組みだけで解決できること」を1つだけ決めませんか？"
  },
  comparisonTable: [
    {
      category: "現状 (As-Is)",
      manager: "メンバーの主体性が足りず、指示待ちになっている。",
      member: "何を言っても無駄な空気があり、諦めている。",
      insight: "【視点のズレ】マネージャーは「個人の資質」の問題とし、メンバーは「環境・空気」の問題としている。"
    },
    {
      category: "理想 (To-Be)",
      manager: "全員が当事者意識を持って自走するチーム。",
      member: "失敗しても責められず、安心して挑戦できるチーム。",
      insight: "動機は同じ「良くなりたい」だが、求める条件（責任 vs 安全性）が食い違っている。"
    },
    {
      category: "解決策 (Solution)",
      manager: "意識改革、マインドセット研修。",
      member: "具体的で安全なルール、リソースの拡充。",
      insight: "精神論(Manager) vs 具体論(Member) の対立構造。"
    }
  ],
  tags: MOCK_STATS.focusTags,
  roiScore: 2.6
}

const DEMO_SCRIPT = [
  {
    stage: "intro",
    title: "1. TAIWA AI デモンストレーション",
    description: "「見えない課題」を可視化し、対話の質を変えるプロセスを体験します。",
    duration: 3000,
  },
  {
    stage: "participants-join",
    title: "2. 参加者が匿名で入室",
    description: "QRコードから、メンバーが匿名でセッションに参加します。",
    participants: [
      { name: "マネージャーA", role: "manager", joinTime: 500, avatar: "👔" },
      { name: "メンバーB", role: "member", joinTime: 1200, avatar: "👩‍💻" },
      { name: "メンバーC", role: "member", joinTime: 1800, avatar: "👨‍💻" },
      { name: "メンバーD", role: "member", joinTime: 2400, avatar: "🤔" },
    ],
    duration: 4000,
    showQR: true
  },
  {
    stage: "responses-coming",
    title: "3. 本音と課題の収集",
    description: "「現状(As-is)」と「理想(To-be)」、そして「隠れた感情(Vulnerability)」をリアルタイムに収集。",
    responses: [
      {
        participant: "マネージャーA",
        role: "manager",
        asIs: "メンバーの主体性が足りない",
        solution: "もっと当事者意識を持つべき (Mindset)",
        hero: "Hope: 9, Efficacy: 8",
        vulnerability: "Honesty: 100% (High)",
        time: 500,
      },
      {
        participant: "メンバーB",
        role: "member",
        asIs: "何を言っても変わらない空気がある",
        solution: "失敗を許容するルールが欲しい (Process)",
        hero: "Hope: 4, Efficacy: 2",
        vulnerability: "Honesty: 20% (Low) -> 面従腹背",
        time: 1500,
      },
      {
        participant: "メンバーC",
        role: "member",
        asIs: "理想ばかり語られて疲れる",
        solution: "リソースを増やしてほしい (Environment)",
        hero: "Hope: 5, Efficacy: 3",
        vulnerability: "Honesty: 40% (Low)",
        time: 2500,
        highlight: true
      },
      {
        participant: "メンバーD",
        role: "member",
        asIs: "...",
        solution: "...",
        hero: "...",
        vulnerability: "Typing...",
        time: 3500,
      }
    ],
    duration: 5000, // Shortened for better pacing
  },
  {
    stage: "realtime-analysis",
    title: "4. リアルタイム集計 (Deterministic)",
    description: "AIを待たずに、場の「肯定度」や「心理的資本」が即座に可視化されます。",
    showStats: true,
    duration: 3000,
  },
  {
    stage: "ai-insight",
    title: "5. AIによる構造分析 (Generative)",
    description: "「断絶」や「語られない本音」をAIが鋭く指摘します。",
    showAnalysis: true,
    duration: 10000, // Longer duration to read analysis
  },
]

// Mock Mobile Component
const MockMobileClient = ({ step }: { step: number }) => {
  return (
    <div className="w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden relative mx-auto transform scale-90 sm:scale-100 transition-transform">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>

      {/* Content */}
      <div className="h-full w-full bg-slate-50 pt-12 px-4 pb-4 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="text-xs font-bold text-slate-400">Step {step}/3</div>
          <div className="flex gap-1">
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {step === 1 && (
          <div className="w-full animate-in slide-in-from-right duration-500 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 text-lg mb-2">今の気分は？ (Mood)</h3>
            <p className="text-xs text-slate-500 mb-8">今の正直な気持ちを色で教えてください。</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { emoji: "😤", label: "High Energy", color: "bg-orange-100" },
                { emoji: "😌", label: "Calm", color: "bg-teal-100" },
                { emoji: "😰", label: "Anxious", color: "bg-blue-100" },
                { emoji: "😐", label: "Neutral", color: "bg-gray-100" }
              ].map((item, i) => (
                <div key={i} className={`${item.color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer hover:scale-105 transition-transform border-2 border-transparent hover:border-teal-400`}>
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-bold text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <div className="text-center font-bold text-orange-500 mb-2">あなたの選択</div>
              <div className="w-full h-12 bg-orange-400 rounded-xl shadow-lg flex items-center justify-center text-white font-bold animate-pulse">
                High Energy
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full animate-in slide-in-from-right duration-500">
            <h3 className="font-bold text-slate-800 text-lg mb-2">心理的資本 (HERO)</h3>
            <p className="text-xs text-slate-500 mb-6">以下の4つの質問に直感でスライダーを動かしてください。</p>

            <div className="space-y-6">
              {[
                { label: 'Hope (将来への希望)', val: 80, col: 'bg-teal-500' },
                { label: 'Efficacy (自信・効力感)', val: 40, col: 'bg-indigo-500' },
                { label: 'Resilience (回復力)', val: 30, col: 'bg-orange-500' },
                { label: 'Optimism (楽観性)', val: 50, col: 'bg-lime-500' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2 text-slate-700">
                    <span>{item.label}</span>
                    <span className="text-slate-400">{item.val}%</span>
                  </div>
                  <div className="bg-slate-100 h-3 rounded-full relative overflow-hidden">
                    {/* Track */}
                    <div className="absolute inset-0 bg-slate-200"></div>
                    {/* Fill */}
                    <div
                      className={`absolute top-0 left-0 h-full ${item.col} rounded-full`}
                      style={{ width: `${item.val}%` }}
                    ></div>
                    {/* Knocker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-white rounded-full shadow border border-slate-200"
                      style={{ left: `calc(${item.val}% - 10px)` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full animate-in slide-in-from-right duration-500 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 text-lg mb-2">ギャップの構造化</h3>
            <p className="text-xs text-slate-500 mb-6">課題を「現状・理想・解決策」に分解します。</p>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="p-3 bg-red-50 rounded-xl border-l-4 border-red-400">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">As-Is (現状の事実)</span>
                <p className="text-sm text-slate-700 font-medium">主体性がなく、指示待ちばかり...</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border-l-4 border-teal-400">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">To-Be (理想の状態)</span>
                <p className="text-sm text-slate-700 font-medium">全員が自分ごととして...</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl border-l-4 border-yellow-400 h-28">
                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider block mb-1">Solution (解決策)</span>
                <p className="text-sm text-slate-400 animate-pulse">入力中...</p>
                <div className="w-2 h-4 bg-slate-400 animate-blink inline-block ml-1"></div>
              </div>
            </div>

            <Button className="w-full mt-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
              回答を送信
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-auto w-full pt-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <Button disabled={step === 3} className="w-full bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-full font-bold">
            {step === 3 ? "完了" : "次へ"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [speed, setSpeed] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Mobile simulation state
  const [mobileStep, setMobileStep] = useState(1)

  const currentStep = DEMO_SCRIPT[currentStepIndex]

  // Reset state when step changes or demo resets
  useEffect(() => {
    if (currentStepIndex === 0 && !isPlaying) {
      setParticipants([])
      setResponses([])
      setMobileStep(1)
    }
  }, [currentStepIndex, isPlaying])

  useEffect(() => {
    if (!isPlaying || isPaused) return

    let timer: NodeJS.Timeout
    let cycleTimer: NodeJS.Timeout | null = null // Add cycleTimer reference
    const stepDuration = currentStep.duration / speed

    // Handle step-specific logic
    if (currentStep.stage === "participants-join" && currentStep.participants) {
      if (participants.length === 0) {
        currentStep.participants.forEach(p => {
          setTimeout(() => {
            setParticipants(prev => [...prev, p])
          }, p.joinTime / speed)
        })
      }
    }

    if (currentStep.stage === "responses-coming" && currentStep.responses) {
      if (responses.length === 0) {
        // Cycle mobile steps
        const cycleInterval = 2000 / speed
        cycleTimer = setInterval(() => { // Assign to cycleTimer
          setMobileStep(prev => prev >= 3 ? 1 : prev + 1)
        }, cycleInterval)

        currentStep.responses.forEach(r => {
          setTimeout(() => {
            setResponses(prev => [...prev, r])
          }, r.time / speed)
        })
      }
    }

    // Step transition logic (Ensured to run)
    timer = setTimeout(() => {
      if (currentStepIndex < DEMO_SCRIPT.length - 1) {
        setCurrentStepIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
      }
    }, stepDuration)

    // Cleanup
    return () => {
      clearTimeout(timer)
      if (cycleTimer) clearInterval(cycleTimer)
    }
  }, [isPlaying, isPaused, currentStepIndex, currentStep, speed])

  const handleStart = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
    if (window.innerWidth > 768) {
      setIsFullScreen(true) // Auto fullscreen on start for desktop
    }
  }

  const handleTogglePause = () => {
    if (!isPlaying) return
    setIsPaused(!isPaused)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
    setIsFullScreen(false)
  }

  const handleSpeedChange = () => {
    setSpeed((prev) => {
      if (prev === 1) return 1.5
      if (prev === 1.5) return 2
      if (prev === 2) return 0.5
      return 1
    })
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  // Render content based on full screen state
  const containerClasses = isFullScreen
    ? "fixed inset-0 z-50 bg-slate-50 overflow-y-auto"
    : "relative w-full"

  const contentClasses = isFullScreen
    ? "min-h-screen p-8 max-w-7xl mx-auto flex flex-col justify-center"
    : "w-full"

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>

        {/* Header Controls (Always visible in full screen) */}
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border shadow-sm sticky top-4 z-40">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 rounded-xl text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{currentStep.title}</h3>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / DEMO_SCRIPT.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{currentStepIndex + 1}/{DEMO_SCRIPT.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <Button onClick={handleTogglePause} variant="ghost" size="icon" className="text-gray-500">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            )}
            <Button onClick={handleSpeedChange} variant="ghost" className="text-xs font-mono text-gray-500 hidden sm:flex">
              {speed}x
            </Button>
            <Button onClick={toggleFullScreen} variant="ghost" size="icon" className="text-gray-500">
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" className="rounded-xl hidden sm:flex">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* Start Screen Overlay if not full screen and not playing */}
        {!isFullScreen && !isPlaying && currentStepIndex === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-3xl">
            <Button onClick={handleStart} size="lg" className="bg-gradient-to-r from-teal-400 to-lime-400 text-white font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform">
              <Play className="w-8 h-8 mr-3 fill-current" />
              デモを開始する
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative min-h-[500px]">

          {/* Intro Stage */}
          {currentStep.stage === "intro" && (
            <div className="flex flex-col items-center justify-center text-center h-full my-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-lime-600 mb-6 leading-tight">
                TAIWA AI<br />Interactive Demo
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 max-w-2xl">
                {currentStep.description}
              </p>
              {!isPlaying && isFullScreen && (
                <Button onClick={handleStart} size="lg" className="mt-12 bg-black text-white rounded-full px-8">
                  スタート
                </Button>
              )}
            </div>
          )}

          {/* Participants Joining (Lobby) */}
          {currentStep.stage === "participants-join" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full my-auto animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">参加用QRコード</h3>
                <div className="bg-white p-4 rounded-xl shadow-inner border">
                  <QRCodeSVG value="https://taiwa-ai.com/demo" size={240} />
                </div>
                <p className="mt-6 text-2xl font-mono font-bold text-gray-700 tracking-widest">A7x-92</p>
                <p className="text-sm text-gray-400 mt-2">参加者はスマートフォンからアクセス</p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  参加者 ({participants.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500"
                    >
                      <div className="text-3xl">{p.avatar}</div>
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{p.role}</p>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="text-gray-400 italic col-span-2">待機中...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Responses Coming (Split View: Dashboard + Mobile) */}
          {currentStep.stage === "responses-coming" && (
            <div className="h-full flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-teal-500" />
                  リアルタイムファシリテーション画面
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {responses.map((r, i) => (
                    <div
                      key={i}
                      className={`bg-white p-4 rounded-2xl shadow-md border-l-4 ${r.role === 'manager' ? 'border-l-indigo-500' : 'border-l-teal-500'} relative overflow-hidden animate-in zoom-in fade-in slide-in-from-bottom-2 duration-500`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${r.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                          {r.participant}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{r.hero}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400">現状 (As is)</p>
                          <p className="font-medium text-sm text-gray-800 line-clamp-2">"{r.asIs}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-8 opacity-50">
                    <span className="animate-pulse text-gray-400">待機中...</span>
                  </div>
                </div>
              </div>

              {/* Mobile Mockup Sidebar */}
              <div className="w-full md:w-[320px] shrink-0 border-l pl-8 border-gray-100 hidden md:block">
                <div className="text-center mb-4">
                  <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">参加者画面 (Mobile)</span>
                </div>
                <MockMobileClient step={mobileStep} />
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {(currentStep.showStats || currentStep.showAnalysis) && (
            <div className="h-full flex flex-col animate-in fade-in duration-700">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  {currentStep.showAnalysis ? "AI Analysis Result" : "リアルタイム集計"}
                </h2>
                {!currentStep.showAnalysis && (
                  <span className="animate-pulse text-teal-500 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    分析中...
                  </span>
                )}
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border shadow-sm flex-1 overflow-y-auto">
                <AnalysisDisplay
                  analysis={currentStep.showAnalysis ? MOCK_ANALYSIS : undefined}
                  stats={MOCK_STATS}
                  onSelectQuestion={() => { }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
