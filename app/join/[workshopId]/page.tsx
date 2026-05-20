"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"

type ResponseData = {
  id: string
  participantId: string
  participantName: string
  participantRole?: "manager" | "member"
  answer: string
  asIs?: { fact: string; score: number }
  toBe?: { will: string; score: number }
  solution?: { action: string; tags: string[] }
  hero?: { hope: number; efficacy: number; resilience: number; optimism: number }
  vulnerability?: { honesty: number; resistance: number }
  moodColor?: string
  submittedAt: string
}

type ParticipantData = {
  id: string
  name: string
  role?: "manager" | "member"
  stance?: { energyLevel: number; currentMode: string; openness: number }
  joinedAt: string
}

type IndividualInsight = {
  participantId: string
  name?: string
  summary?: string
  questionToAsk?: string
}

type SessionData = {
  status: string
  participants: ParticipantData[]
  currentQuestion: string | null
  responses: ResponseData[]
  analysis?: {
    overallSummary?: { title: string; description: string }
    heroInsight?: { parameterAnalysis?: string; strength?: string; scores?: { hope: number; efficacy: number; resilience: number; optimism: number } }
    cognitiveDissonance?: { pointsOfFriction?: string[]; discussionTopics?: string[]; lemonMarketRisk?: string }
    interventionQuestions?: { mutualUnderstanding?: string; suspendedJudgment?: string; smallAgreement?: string }
    keyFindings?: string[]
    consensus?: string[]
    conflicts?: string[]
    individualInsights?: IndividualInsight[]
    roiScore?: number
  }
}
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Zap, Brain, Heart, Send } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { getHeroProfile } from "@/lib/hero-profile"

export default function JoinWorkshopPage() {
  const params = useParams()
  const workshopId = (params.workshopId as string) || ""
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Name and role input
  const [name, setName] = useState("")
  const [role, setRole] = useState("participant")

  // Stance input
  const [energyLevel, setEnergyLevel] = useState(50)
  const [currentMode, setCurrentMode] = useState(50)
  const [openness, setOpenness] = useState(50)

  // State management
  const [hasJoined, setHasJoined] = useState(false)
  const [participantId, setParticipantId] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // 分析結果表示用
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [analysisReady, setAnalysisReady] = useState(false)
  const analysisPollingRef = useRef<NodeJS.Timeout | null>(null)

  // Response input
  const [asIsFact, setAsIsFact] = useState("")
  const [asIsScore, setAsIsScore] = useState(50)
  const [toBeWill, setToBeWill] = useState("")
  const [toBeScore, setToBeScore] = useState(70)
  const [solutionAction, setSolutionAction] = useState("")
  const [selectedSolutionTags, setSelectedSolutionTags] = useState<string[]>([])

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 回答送信後に分析結果をポーリング
  useEffect(() => {
    if (!hasSubmitted || !workshopId || analysisReady) return

    const pollAnalysis = async () => {
      try {
        const res = await fetch(`/api/workshop/${workshopId}`)
        if (res.ok) {
          const data = await res.json()
          if ((data.status === 'summary' || data.analysis) && data.responses && data.responses.length > 0) {
            setSessionData(data)
            setAnalysisReady(true)
            if (analysisPollingRef.current) {
              clearInterval(analysisPollingRef.current)
            }
          }
        }
      } catch (err) {
      }
    }

    pollAnalysis()
    analysisPollingRef.current = setInterval(pollAnalysis, 5000)

    return () => {
      if (analysisPollingRef.current) {
        clearInterval(analysisPollingRef.current)
      }
    }
  }, [hasSubmitted, workshopId, analysisReady])

  // New Step Management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // HERO Input
  const [hero, setHero] = useState({
    hope: 50,
    efficacy: 50,
    resilience: 50,
    optimism: 50
  })

  // Vulnerability Input
  const [vulnerability, setVulnerability] = useState({
    honesty: 50,
    resistance: 50
  })

  // Mood Color
  const moodColors = [
    { color: "#ef4444", label: "情熱/怒り" }, // Red
    { color: "#f97316", label: "活気/焦り" }, // Orange
    { color: "#eab308", label: "希望/注意" }, // Yellow
    { color: "#22c55e", label: "成長/調和" }, // Green
    { color: "#3b82f6", label: "冷静/悲嘆" }, // Blue
    { color: "#a855f7", label: "洞察/不安" }, // Purple
    { color: "#ec4899", label: "愛情/興奮" }, // Pink
    { color: "#78716c", label: "中立/停滞" }, // Gray
  ]
  const [selectedMoodColor, setSelectedMoodColor] = useState(moodColors[3].color)

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmitResponse()
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!hasJoined || !workshopId || hasSubmitted) return


    const pollQuestion = async () => {
      try {
        const response = await fetch(`/api/workshop/${workshopId}`)
        if (response.ok) {
          const data = await response.json()
          
          // data is the session object itself, so currentQuestion is directly on data
          const newQuestionObj = data.currentQuestion;
          const newQuestionText = newQuestionObj ? newQuestionObj.question : "";

          if (newQuestionText && newQuestionText !== currentQuestion) {
            setCurrentQuestion(newQuestionText)
          }
        } else {
        }
      } catch (error) {
      }
    }

    pollQuestion()
    pollingIntervalRef.current = setInterval(pollQuestion, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [hasJoined, workshopId, currentQuestion, hasSubmitted])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !workshopId) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const payload = {
        workshopId,
        name: name.trim(),
        role,
        stance: {
          energyLevel,
          currentMode,
          openness,
          moodColor: selectedMoodColor,
        },
      }

      const response = await fetch("/api/workshop/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })


      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        if (response.status === 404) throw new Error("ワークショップが見つかりません。URLを確認してください。")
        if (response.status === 409) throw new Error("すでに参加済みです。")
        if (response.status >= 500) throw new Error("サーバーエラーが発生しました。しばらくしてから再試行してください。")
        throw new Error(errorData?.error || "参加に失敗しました。")
      }

      const data = await response.json()

      setParticipantId(data.participantId)
      setHasJoined(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "ネットワークエラーが発生しました。接続を確認して再試行してください。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!asIsFact.trim() || !toBeWill.trim() || !participantId) {
      return
    }

    setIsLoading(true)
    setError("")

    try {

      const response = await fetch("/api/workshop/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          participantId,
          participantName: name,
          participantRole: role,
          answer: [asIsFact && `【現状】${asIsFact}`, toBeWill && `【理想】${toBeWill}`, solutionAction && `【行動】${solutionAction}`].filter(Boolean).join('\n'),
          asIs: {
            fact: asIsFact,
            score: asIsScore / 10,
          },
          toBe: {
            will: toBeWill,
            score: toBeScore / 10,
          },
          solution: {
            action: solutionAction,
            tags: selectedSolutionTags,
          },
          hero: hero, // New
          vulnerability: vulnerability, // New
          moodColor: selectedMoodColor, // New from Step 1
        }),
      })


      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        if (response.status >= 500) throw new Error("サーバーエラーが発生しました。しばらくしてから再試行してください。")
        throw new Error(errorData?.error || "回答の送信に失敗しました。")
      }

      await response.json()
      setHasSubmitted(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "ネットワークエラーが発生しました。接続を確認して再試行してください。")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSolutionTag = (tagId: string) => {
    setSelectedSolutionTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const actionTags = [
    { id: "communication", label: "対話・共有", color: "bg-blue-100 text-blue-600" },
    { id: "process", label: "仕組み・ルール", color: "bg-orange-100 text-orange-600" },
    { id: "mindset", label: "意識変革", color: "bg-purple-100 text-purple-600" },
    { id: "environment", label: "環境整備", color: "bg-green-100 text-green-600" },
  ]

  if (!mounted || !workshopId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #f0fdfa, #f7fee7, #ecfeff)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "2rem",
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "3px solid #0d9488",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ color: "#6b7280" }}>読み込み中...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // Completion screen
  if (hasSubmitted) {
    // 分析待ち画面
    if (!analysisReady || !sessionData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
          <Card className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
            <div className="bg-gradient-to-r from-teal-400 to-lime-400 text-white text-5xl w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">回答を送信しました</h2>
              <p className="text-muted-foreground">
                分析結果を準備中です...
                <br />
                ファシリテーターがAI分析を開始するまでしばらくお待ちください。
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </Card>
        </div>
      )
    }

    // 分析結果表示
    const clamp = (v: number) => Math.min(100, Math.max(0, v || 0))
    const myHonesty = clamp(vulnerability.honesty)
    const myResistance = clamp(vulnerability.resistance)
    const myEnergy = clamp(energyLevel)
    const myHeroScaled = { hope: hero.hope / 10, efficacy: hero.efficacy / 10, resilience: hero.resilience / 10, optimism: hero.optimism / 10 }
    const myHeroProfile = getHeroProfile(myHeroScaled.hope, myHeroScaled.efficacy, myHeroScaled.resilience, myHeroScaled.optimism)
    const allResponses = sessionData.responses || []
    const allParticipants = sessionData.participants || []
    const analysis = sessionData.analysis || null
    const respCount = allResponses.length
    const avgHonesty = respCount > 0 ? Math.round(allResponses.reduce((s: number, r: ResponseData) => s + clamp(r.vulnerability?.honesty ?? 50), 0) / respCount) : 50
    const avgResistance = respCount > 0 ? Math.round(allResponses.reduce((s: number, r: ResponseData) => s + clamp(r.vulnerability?.resistance ?? 50), 0) / respCount) : 50
    const avgEnergy = allParticipants.length > 0 ? Math.round(allParticipants.reduce((s: number, p: ParticipantData) => s + clamp(p.stance?.energyLevel ?? 50), 0) / allParticipants.length) : 50
    const heroScoresTeam = analysis?.heroInsight?.scores || { hope: 0, efficacy: 0, resilience: 0, optimism: 0 }
    const teamHeroProfile = getHeroProfile(heroScoresTeam.hope / 10, heroScoresTeam.efficacy / 10, heroScoresTeam.resilience / 10, heroScoresTeam.optimism / 10)
    const badgeColor = (val: number, type: 'honesty' | 'resistance' | 'energy') => {
      if (type === 'resistance') return val < 30 ? 'text-green-700 bg-green-50 border-green-200' : val <= 70 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-red-700 bg-red-50 border-red-200'
      return val >= 70 ? 'text-green-700 bg-green-50 border-green-200' : val >= 40 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-red-700 bg-red-50 border-red-200'
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50">
        {/* Sticky メタ指標 */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <div className="max-w-lg mx-auto flex flex-wrap items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(avgHonesty, 'honesty')}`}>💬 本音度 {avgHonesty}%</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(avgResistance, 'resistance')}`}>😰 抵抗感 {avgResistance}%</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(avgEnergy, 'energy')}`}>🔥 エネルギー {avgEnergy}%</span>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* アラート */}
          {avgHonesty < 40 && (<div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs">⚠️ <span><strong>建前モードの可能性。</strong>場の安心感づくりを推奨</span></div>)}
          {avgResistance > 70 && (<div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs">⚠️ <span><strong>共有への不安が強い。</strong>匿名化や少人数の対話から始めるべき</span></div>)}

          {/* S1: テーマと声 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg text-teal-600"><span className="text-lg">💬</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">今回のテーマと声</h2>
                <p className="text-xs text-gray-500">参加者から寄せられた生の声</p>
              </div>
            </div>
            {sessionData.currentQuestion && (
              <Card className="p-4 bg-slate-900 text-white rounded-2xl">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">今回の問い</div>
                <p className="text-sm font-bold leading-relaxed">{sessionData.currentQuestion.question}</p>
                {sessionData.currentQuestion.theme && (
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
                      {sessionData.currentQuestion.theme}
                    </span>
                  </div>
                )}
              </Card>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allResponses.map((r: ResponseData) => {
                const rH = clamp(r.vulnerability?.honesty ?? 50)
                const isMe = r.participantId === participantId
                return (
                  <Card key={r.id} className={`p-4 rounded-2xl border ${isMe ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-sm text-teal-700 shrink-0">{r.participantName?.charAt(0)}</div>
                      <span className="font-semibold text-gray-700 text-sm">{r.participantName}{isMe && <span className="text-purple-500 ml-1 text-xs">(あなた)</span>}</span>
                      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badgeColor(rH, 'honesty')}`}>💬 {rH}%</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.answer}</p>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* S2: 個別回答 — ファシリテーターと同等 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-2 rounded-2xl shadow-sm"><span className="text-lg text-white">👥</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">個別回答</h2>
                <p className="text-xs text-gray-500">参加者ごとの回答・HEROスコア・AIインサイト</p>
              </div>
            </div>
            {allResponses.map((r: ResponseData, idx: number) => {
              const rHero = r.hero || {hope:50,efficacy:50,resilience:50,optimism:50}
              const rProfile = getHeroProfile(rHero.hope/10, rHero.efficacy/10, rHero.resilience/10, rHero.optimism/10)
              const rH = clamp(r.vulnerability?.honesty ?? 50)
              const rR = clamp(r.vulnerability?.resistance ?? 50)
              const isMe = r.participantId === participantId
              const aiInsight = analysis?.individualInsights?.find((i: IndividualInsight) => i.participantId === `Participant ${idx+1}`)
              return (
                <Card key={r.id} className={`rounded-2xl p-4 border overflow-hidden relative ${isMe ? 'bg-purple-50/30 border-purple-200' : 'bg-white border-gray-100'}`}>
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-400" />
                  <div className="pl-3 space-y-4">
                    {/* ヘッダー: 名前 + バッジ */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-lg text-gray-600 shadow-inner">{r.participantName?.charAt(0)}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-800">{r.participantName}{isMe && <span className="text-purple-500 text-xs ml-1">(あなた)</span>}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor(rH, 'honesty')}`}>💬 本音度 {rH}%</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor(rR, 'resistance')}`}>😰 抵抗感 {rR}%</span>
                        </div>
                      </div>
                    </div>
                    {/* Original Answer */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Original Answer</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.answer}</p>
                    </div>
                    {/* HERO + Profile */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-36 h-36 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                              {subject:'希望',A:rHero.hope/10,fullMark:10},
                              {subject:'効力感',A:rHero.efficacy/10,fullMark:10},
                              {subject:'回復力',A:rHero.resilience/10,fullMark:10},
                              {subject:'楽観性',A:rHero.optimism/10,fullMark:10}
                            ]}>
                              <PolarGrid stroke="#e2e8f0"/>
                              <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:10,fontWeight:'bold'}}/>
                              <PolarRadiusAxis angle={30} domain={[0,10]} tick={false} axisLine={false}/>
                              <Radar dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.2}/>
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className="font-bold text-sm text-sky-700 mb-1">{rProfile.name}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{rProfile.description}</p>
                        </div>
                      </div>
                    </div>
                    {/* AI Insight */}
                    {aiInsight ? (
                      <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl p-4 border border-blue-100 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">✨ AI Summary</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{aiInsight.summary}</p>
                        </div>
                        <div className="pt-2 border-t border-blue-100/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">💡 Question to Ask</span>
                          </div>
                          <p className="text-sm font-medium text-blue-900 leading-relaxed italic border-l-2 border-blue-400 pl-3 py-1">「{aiInsight.questionToAsk}」</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-center text-sm text-gray-400 italic">AIによる個別インサイトは生成されていません</div>
                    )}
                  </div>
                </Card>
              )
            })}
          </section>

          {/* S3: 認識のズレと対話のポイント */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><span className="text-lg">⚡</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">認識のズレと対話のポイント</h2>
                <p className="text-xs text-gray-500">メンバー間で生じている認知のズレと、次に話し合うべきこと</p>
              </div>
            </div>
            {analysis?.cognitiveDissonance ? (
              <>
                {analysis.cognitiveDissonance.pointsOfFriction?.length > 0 && (
                  <Card className="p-4 bg-white rounded-2xl border border-indigo-100 space-y-3">
                    <h3 className="font-bold text-indigo-700 text-sm flex items-center gap-2"><span>⚠️</span> 具体的な認識のズレ (Friction)</h3>
                    <ul className="space-y-2">
                      {analysis.cognitiveDissonance.pointsOfFriction.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                          <span className="text-indigo-400 font-bold mt-0.5">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {analysis.cognitiveDissonance.discussionTopics?.length > 0 && (
                  <Card className="p-4 bg-white rounded-2xl border border-teal-100 space-y-3">
                    <h3 className="font-bold text-teal-700 text-sm flex items-center gap-2"><span>💬</span> 話し合うべきトピック</h3>
                    <ul className="space-y-2">
                      {analysis.cognitiveDissonance.discussionTopics.map((t: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed bg-teal-50/50 p-3 rounded-lg border border-teal-50">
                          <span className="text-teal-400 font-bold mt-0.5">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-4 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-400 italic">
                AIによる認識のズレ分析は生成されていません
              </Card>
            )}
          </section>

          {/* S4: チームHERO */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><span className="text-lg">⚡</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">心理的資本 (HERO)</h2>
                <p className="text-xs text-gray-500">チーム全体の心理的資本スコア</p>
              </div>
            </div>
            <Card className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
              <div className="flex flex-col items-center gap-3">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                      {subject:'Hope (希望)',A:heroScoresTeam.hope/10,fullMark:10},
                      {subject:'Efficacy (効力感)',A:heroScoresTeam.efficacy/10,fullMark:10},
                      {subject:'Resilience (回復力)',A:heroScoresTeam.resilience/10,fullMark:10},
                      {subject:'Optimism (楽観性)',A:heroScoresTeam.optimism/10,fullMark:10}
                    ]}>
                      <PolarGrid stroke="#e2e8f0"/>
                      <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:9,fontWeight:'bold'}}/>
                      <PolarRadiusAxis angle={30} domain={[0,10]} tick={false} axisLine={false}/>
                      <Radar name="Team" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.2}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full">
                  <h4 className="font-bold text-lg text-purple-700 mb-1">{teamHeroProfile.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{teamHeroProfile.description}</p>
                </div>
              </div>
            </Card>
          </section>

          {/* S5: 次なる対話のステップ */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg text-teal-600"><span className="text-lg">🗣</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">次なる対話のステップ</h2>
                <p className="text-xs text-gray-500">この状況を打破するために、まず必要な問いかけ</p>
              </div>
            </div>
            {analysis?.interventionQuestions ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-2 p-5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-white opacity-10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <div className="relative z-10 space-y-3">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20">おすすめ (小さな合意)</span>
                    <p className="text-base font-bold leading-relaxed">"{analysis.interventionQuestions.smallAgreement}"</p>
                    <div className="inline-flex items-center gap-2 font-bold text-xs bg-white text-teal-600 px-3 py-2 rounded-full">この問いから始める →</div>
                  </div>
                </Card>
                <div className="flex flex-col gap-3">
                  <Card className="flex-1 p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl">
                    <span className="text-xs font-bold text-indigo-400 mb-2 block">相互理解を深めるなら</span>
                    <p className="text-sm font-bold text-indigo-900 leading-relaxed">"{analysis.interventionQuestions.mutualUnderstanding}"</p>
                  </Card>
                  <Card className="flex-1 p-4 border border-fuchsia-100 bg-fuchsia-50/50 rounded-xl">
                    <span className="text-xs font-bold text-fuchsia-400 mb-2 block">判断を保留するなら</span>
                    <p className="text-sm font-bold text-fuchsia-900 leading-relaxed">"{analysis.interventionQuestions.suspendedJudgment}"</p>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="p-4 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-400 italic">
                AIによる対話ステップは生成されていません
              </Card>
            )}
          </section>

          {/* S6: 主要な発見 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><span className="text-lg">✅</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">主要な発見</h2>
                <p className="text-xs text-gray-500">AI分析による重要なインサイト</p>
              </div>
            </div>
            {analysis?.keyFindings && analysis.keyFindings.length > 0 ? (
              <Card className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
                {analysis.keyFindings.map((f: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{f}</p>
                  </div>
                ))}
              </Card>
            ) : (
              <Card className="p-4 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-400 italic">
                AIによる主要な発見は生成されていません
              </Card>
            )}
          </section>

          {/* S6.5: パターン分析とクロス分析 */}
          {allResponses.length >= 2 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><span className="text-lg">✨</span></div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">パターン分析とクロス分析</h2>
                  <p className="text-xs text-gray-500">回答全体のパターンと傾向</p>
                </div>
              </div>
              <Card className="p-4 bg-white rounded-2xl border border-gray-100">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                  <h4 className="font-semibold text-sm mb-3 text-pink-700">ギャップのクラスタリング</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">高ギャップ群（+4以上）:</span>{" "}
                      {allResponses.filter((r: ResponseData) => {
                        const a = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                        const b = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                        return b - a >= 4
                      }).length}名 — 強い改善ニーズ
                    </p>
                    <p>
                      <span className="font-semibold">中ギャップ群（+2〜3）:</span>{" "}
                      {allResponses.filter((r: ResponseData) => {
                        const a = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                        const b = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                        const gap = b - a
                        return gap >= 2 && gap < 4
                      }).length}名 — 適度な改善意識
                    </p>
                    <p>
                      <span className="font-semibold">低ギャップ群（+1以下）:</span>{" "}
                      {allResponses.filter((r: ResponseData) => {
                        const a = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                        const b = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                        return b - a < 2
                      }).length}名 — 現状満足または無関心
                    </p>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* S7: あなたの状態 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><span className="text-lg">🪞</span></div>
              <div>
                <h2 className="text-base font-bold text-gray-800">あなたの状態</h2>
                <p className="text-xs text-gray-500">あなた自身の心理状態の可視化</p>
              </div>
            </div>
            <Card className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(myHonesty, 'honesty')}`}>💬 本音度 {myHonesty}%</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(myResistance, 'resistance')}`}>😰 抵抗感 {myResistance}%</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor(myEnergy, 'energy')}`}>🔥 エネルギー {myEnergy}%</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                    {subject:'希望',A:myHeroScaled.hope,fullMark:10},
                    {subject:'効力感',A:myHeroScaled.efficacy,fullMark:10},
                    {subject:'回復力',A:myHeroScaled.resilience,fullMark:10},
                    {subject:'楽観性',A:myHeroScaled.optimism,fullMark:10}
                  ]}>
                    <PolarGrid stroke="#e2e8f0"/>
                    <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:11,fontWeight:'bold'}}/>
                    <PolarRadiusAxis angle={30} domain={[0,10]} tick={false} axisLine={false}/>
                    <Radar name="You" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.25}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{myHeroProfile.description}</p>
              <p className="text-xs text-gray-400 italic">このプロファイルは「診断」ではなく、次の動きを設計するための鏡です。</p>
            </Card>
          </section>

        </div>
      </div>
    )
  }

  // State and handlers moved to top level to avoid Hooks errors

  // Question answering screen (4-Step Wizard)
  if (hasJoined && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
        <div className="max-w-xl mx-auto py-8 space-y-6">

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i + 1 <= currentStep ? "bg-teal-500" : "bg-gray-200"}`} />
            ))}
          </div>

          <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-l-4 border-teal-500">
            <h2 className="text-sm font-bold text-teal-600 mb-1">Theme Question</h2>
            <p className="text-lg font-medium text-gray-800">{currentQuestion}</p>
          </Card>

          {/* STEP 1: Check-in (Condition & Mood) */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
              <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">1. 今のコンディションは？</h3>
                  <p className="text-sm text-gray-500 mt-1">正直な今の状態を教えてください</p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 block text-center">エネルギーレベル</label>
                  <div className="flex justify-between text-2xl px-2">
                    <span>💤</span>
                    <span>😐</span>
                    <span>🔥</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={energyLevel} // Reusing existing state
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="text-center font-bold text-yellow-600">{energyLevel}%</div>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 2: Structured Input */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
              <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">2. 思考の構造化</h3>
                  <p className="text-sm text-gray-500 mt-1">事実と理想を分けて考えましょう</p>
                </div>

                <div className="space-y-3">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">As-Is (事実)</span>
                  <Textarea
                    value={asIsFact}
                    onChange={(e) => setAsIsFact(e.target.value)}
                    placeholder="今、目の前で何が起きていますか？"
                    className="bg-gray-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-red-200"
                  />

                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">To-Be (理想)</span>
                  <Textarea
                    value={toBeWill}
                    onChange={(e) => setToBeWill(e.target.value)}
                    placeholder="制約がないとしたら、どうなっていたいですか？"
                    className="bg-gray-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-teal-200"
                  />

                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Solution (行動)</span>
                  <Textarea
                    value={solutionAction}
                    onChange={(e) => setSolutionAction(e.target.value)}
                    placeholder="理想に近づくために、まず何を変えますか？"
                    className="bg-gray-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* STEP 3: HERO Diagnosis */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
              <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">3. この課題に対する感覚 (HERO)</h3>
                  <p className="text-sm text-gray-500 mt-1">直感で答えてください</p>
                </div>

                {/* Hope */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-semibold text-gray-700">Hope (希望)</label>
                    <span className="text-xs text-gray-500">解決の見通しは？</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hero.hope}
                    onChange={(e) => setHero({ ...hero, hope: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Efficacy */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-semibold text-gray-700">Efficacy (効力感)</label>
                    <span className="text-xs text-gray-500">自分たちで変えられる？</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hero.efficacy}
                    onChange={(e) => setHero({ ...hero, efficacy: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                {/* Resilience */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-semibold text-gray-700">Resilience (回復力)</label>
                    <span className="text-xs text-gray-500">困難でも進める？</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hero.resilience}
                    onChange={(e) => setHero({ ...hero, resilience: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Optimism */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-semibold text-gray-700">Optimism (楽観性)</label>
                    <span className="text-xs text-gray-500">良い未来が待っている？</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hero.optimism}
                    onChange={(e) => setHero({ ...hero, optimism: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* STEP 4: Vulnerability */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
              <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">4. 最後にひとつだけ...</h3>
                  <p className="text-sm text-gray-500 mt-1">分析精度を高めるための指標です</p>
                </div>

                {/* Honesty Meter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-semibold text-gray-700">本音度メーター</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{vulnerability.honesty}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={vulnerability.honesty}
                    onChange={(e) => setVulnerability({ ...vulnerability, honesty: Number(e.target.value) })}
                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    style={{ background: `linear-gradient(to right, #ddd 0%, #a855f7 ${vulnerability.honesty}%, #ddd ${vulnerability.honesty}%)` }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 px-1">
                    <span>建前(Surface)</span>
                    <span>全て開示(Deep)</span>
                  </div>
                </div>

                {/* Resistance Meter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-semibold text-gray-700">共有への不安・抵抗感</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{vulnerability.resistance}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={vulnerability.resistance}
                    onChange={(e) => setVulnerability({ ...vulnerability, resistance: Number(e.target.value) })}
                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 px-1">
                    <span>平気</span>
                    <span>怖い/不安</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-2">
            {currentStep > 1 && (
              <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-xl h-12">
                戻る
              </Button>
            )}
            <Button
              onClick={handleNextStep}
              className="flex-1 bg-gradient-to-r from-teal-500 to-lime-500 text-white rounded-xl h-12 shadow-md hover:shadow-lg transition-all"
              disabled={
                (currentStep === 3 && (!asIsFact.trim() || !toBeWill.trim())) ||
                isLoading
              }
            >
              {isLoading ? "送信中..." : currentStep === totalSteps ? "回答を送信する" : "次へ"}
            </Button>
          </div>

        </div>
      </div>
    )
  }

  // Waiting for question screen
  if (hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
        <Card className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="bg-gradient-to-r from-teal-400 to-lime-400 text-white text-6xl w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            ⏳
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">参加完了</h2>
            <p className="text-muted-foreground">
              ようこそ、{name}さん
              <br />
              ファシリテーターが質問を開始するまでお待ちください。
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Join form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
      <Card className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-r from-teal-400 to-lime-400 text-white text-4xl w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            ✨
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ワークショップに参加</h1>
          <p className="text-sm text-muted-foreground">TAIWA AI</p>
          <p className="text-xs text-muted-foreground">ID: {workshopId}</p>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">お名前（ニックネーム）</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 田中太郎"
              className="rounded-xl h-12 bg-gray-50 border-0"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">あなたの役割は？</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("participant")}
                className={`p-4 rounded-xl border-2 transition-all ${role === "participant"
                  ? "border-teal-400 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-600"
                  }`}
              >
                <div className="font-medium">参加者</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("observer")}
                className={`p-4 rounded-xl border-2 transition-all ${role === "observer"
                  ? "border-teal-400 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-600"
                  }`}
              >
                <div className="font-medium">オブザーバー</div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">現在のスタンス</label>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>エネルギーレベル</span>
                    <span className="font-medium">{energyLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-blue-500" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>現在のモード</span>
                    <span className="font-medium">{currentMode}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentMode}
                    onChange={(e) => setCurrentMode(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-500" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>オープンさ</span>
                    <span className="font-medium">{openness}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={openness}
                    onChange={(e) => setOpenness(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-xl h-14 text-lg shadow-lg disabled:opacity-50"
          >
            {isLoading ? "参加中..." : "参加する"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
