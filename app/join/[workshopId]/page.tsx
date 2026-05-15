"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Zap, Brain, Heart, Send } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { getHeroProfile } from "@/lib/hero-profile"

export default function JoinWorkshopPage() {
  const [mounted, setMounted] = useState(false)
  const [workshopId, setWorkshopId] = useState<string>("")
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
  const [sessionData, setSessionData] = useState<any>(null)
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
          if (data.status === 'analysis' && data.responses && data.responses.length > 0) {
            setSessionData(data)
            setAnalysisReady(true)
            if (analysisPollingRef.current) {
              clearInterval(analysisPollingRef.current)
            }
          }
        }
      } catch (err) {
        console.error('[v0] Analysis polling error:', err)
      }
    }

    pollAnalysis()
    analysisPollingRef.current = setInterval(pollAnalysis, 3000)

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
    if (typeof window !== "undefined") {
      const path = window.location.pathname
      const id = path.split("/").filter(Boolean).pop() || ""
      console.log("[v0] Extracted Workshop ID from URL:", id)
      setWorkshopId(id)
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (!hasJoined || !workshopId || hasSubmitted) return

    console.log("[v0] Starting question polling for workshop:", workshopId)

    const pollQuestion = async () => {
      try {
        console.log("[v0] Polling session...")
        const response = await fetch(`/api/workshop/${workshopId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Polling session data:", data)
          
          // data is the session object itself, so currentQuestion is directly on data
          const newQuestionObj = data.currentQuestion;
          const newQuestionText = newQuestionObj ? newQuestionObj.question : "";

          if (newQuestionText && newQuestionText !== currentQuestion) {
            setCurrentQuestion(newQuestionText)
            console.log("[v0] New question received:", newQuestionText)
          }
        } else {
          console.error("[v0] Polling failed with status:", response.status)
        }
      } catch (error) {
        console.error("[v0] Polling error:", error)
      }
    }

    pollQuestion()
    pollingIntervalRef.current = setInterval(pollQuestion, 2000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        console.log("[v0] Stopped polling")
      }
    }
  }, [hasJoined, workshopId, currentQuestion, hasSubmitted])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] handleJoin called")
    console.log("[v0] Form values - name:", name, "name.trim():", name.trim(), "length:", name.trim().length)

    if (!name.trim() || !workshopId) {
      console.error("[v0] Missing name or workshopId", { name: name.trim(), workshopId })
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
          // Wait, the requirement says "Step 1: Self-State Check-in". This seems to be part of the flow AFTER joining.
          // However, existing code had stance in Join. Let's keep basic stance in Join but maybe moodColor is part of the Response flow?
          // Re-reading specs: "1-1. Step 1: Self-state check-in... Condition... Mood Color". This is likely per-question or at start of session?
          // The current implementation puts the 4-step wizard at 'Response' time.
          // Yet, check-in is usually done once involved.
          // Be careful: The updated UI puts the check-in as Step 1 of the wizard.
          // So we don't need to send it in handleJoin unless we want to persist it early.
          // Let's remove stance from handleJoin or keep as baseline.
          // The user's spec says "Input UI... 4-step flow". This 4-step flow seems to replace the single page form.
          // So `moodColor` should be in the `Response` payload, NOT `Join` payload?
          // Actually, "1. Input UI... 4-step flow" implies the main activity.
          // Let's assume these are sent with the response for now, or updated.
          // Since I put the UI in the Response section, I should send it with Response.
          // BUT, looking at `types.ts` I added `moodColor` to `Participant.stance`.
          // If I want to save it there, I might need a separate call or update `Participant` on response.
          // Let's send it with Response and handle it on backend to update participant if needed.
          // For now, I'll allow `moodColor` in Join if I want, but I'll stick to sending it with Response as per my UI change.
          // ACTUALLY, I missed adding `moodColor` to `Response` type?
          // I added `moodColor` to `Participant` in `types.ts`.
          // If the UI is in the "Answer Question" phase, then updating Participant stance (Mood) makes sense there.
          // I will NOT update handleJoin for now, as the new UI is in the response phase.
        },
      }
      console.log("[v0] Sending join request with payload:", JSON.stringify(payload, null, 2))

      const response = await fetch("/api/workshop/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Join response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("[v0] Join failed:", errorData)
        throw new Error(errorData?.error || "Failed to join workshop")
      }

      const data = await response.json()
      console.log("[v0] Join response data:", data)

      setParticipantId(data.participantId)
      setHasJoined(true)
      console.log("[v0] Successfully joined workshop, participantId:", data.participantId)
    } catch (error) {
      console.error("[v0] Join error:", error)
      setError(error instanceof Error ? error.message : "参加に失敗しました。もう一度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    console.log("[v0] handleSubmitResponse called")

    if (!asIsFact.trim() || !toBeWill.trim() || !participantId) {
      console.error("[v0] Missing required fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Submitting response...")

      const response = await fetch("/api/workshop/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId,
          participantId,
          participantName: name,
          participantRole: role,
          answer: currentQuestion,
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

      console.log("[v0] Response submission status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("[v0] Submit failed:", errorData)
        throw new Error(errorData?.error || "Failed to submit response")
      }

      const data = await response.json()
      console.log("[v0] Response submitted successfully:", data)

      setHasSubmitted(true)
    } catch (error) {
      console.error("[v0] Submit error:", error)
      setError(error instanceof Error ? error.message : "回答の送信に失敗しました。もう一度お試しください。")
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

    const myHeroScaled = {
      hope: hero.hope / 10,
      efficacy: hero.efficacy / 10,
      resilience: hero.resilience / 10,
      optimism: hero.optimism / 10,
    }
    const myHeroProfile = getHeroProfile(myHeroScaled.hope, myHeroScaled.efficacy, myHeroScaled.resilience, myHeroScaled.optimism)

    const allResponses = sessionData.responses || []
    const allParticipants = sessionData.participants || []
    const analysis = sessionData.analysis || null

    // チーム平均
    const respCount = allResponses.length
    const avgHonesty = respCount > 0 ? Math.round(allResponses.reduce((s: number, r: any) => s + clamp(r.vulnerability?.honesty ?? 50), 0) / respCount) : 50
    const avgResistance = respCount > 0 ? Math.round(allResponses.reduce((s: number, r: any) => s + clamp(r.vulnerability?.resistance ?? 50), 0) / respCount) : 50
    const avgEnergy = allParticipants.length > 0 ? Math.round(allParticipants.reduce((s: number, p: any) => s + clamp(p.stance?.energyLevel ?? 50), 0) / allParticipants.length) : 50

    // 自分のindividualInsight
    const myInsightIdx = allResponses.findIndex((r: any) => r.participantId === participantId)
    const myInsightKey = `Participant ${myInsightIdx + 1}`
    const myInsight = analysis?.individualInsights?.find((i: any) => i.participantId === myInsightKey)

    const badgeColor = (val: number, type: 'honesty' | 'resistance' | 'energy') => {
      if (type === 'resistance') {
        return val < 30 ? 'text-green-700 bg-green-50 border-green-200' : val <= 70 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-red-700 bg-red-50 border-red-200'
      }
      return val >= 70 ? 'text-green-700 bg-green-50 border-green-200' : val >= 40 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-red-700 bg-red-50 border-red-200'
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
        <div className="max-w-lg mx-auto py-6 space-y-6">

          {/* ━━ セクション1: あなたの声が届きました ━━ */}
          <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-4 border-l-4 border-teal-400">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 text-teal-600 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">1</div>
              <h2 className="text-lg font-bold text-gray-800">あなたの声が、チームに届きました</h2>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">今回のテーマ</div>
                <p className="text-sm text-gray-700">{currentQuestion}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">あなたの回答</div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-xs text-red-500 font-bold">As-Is（現状）</span>
                    <p className="text-sm text-gray-800 mt-1">{asIsFact}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-xs text-teal-500 font-bold">To-Be（理想）</span>
                    <p className="text-sm text-gray-800 mt-1">{toBeWill}</p>
                  </div>
                  {solutionAction && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <span className="text-xs text-orange-500 font-bold">Solution（行動）</span>
                      <p className="text-sm text-gray-800 mt-1">{solutionAction}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ━━ セクション2: あなたの状態 ━━ */}
          <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-4 border-l-4 border-purple-400">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">2</div>
              <h2 className="text-lg font-bold text-gray-800">あなたの状態: 自己理解の鏡</h2>
            </div>

            {/* メタ指標バッジ */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeColor(myHonesty, 'honesty')}`}>
                💬 本音度 {myHonesty}%
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeColor(myResistance, 'resistance')}`}>
                😰 抵抗感 {myResistance}%
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeColor(myEnergy, 'energy')}`}>
                🔥 エネルギー {myEnergy}%
              </span>
            </div>

            {/* HEROレーダー */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                    { subject: '希望', A: myHeroScaled.hope, fullMark: 10 },
                    { subject: '効力感', A: myHeroScaled.efficacy, fullMark: 10 },
                    { subject: '回復力', A: myHeroScaled.resilience, fullMark: 10 },
                    { subject: '楽観性', A: myHeroScaled.optimism, fullMark: 10 },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                {myHeroProfile.description}
              </p>
              <p className="text-xs text-gray-400 mt-2 italic">
                このプロファイルは「診断」ではなく、次の動きを設計するための鏡です。
              </p>
            </div>
          </Card>

          {/* ━━ セクション3: チームの全体像 ━━ */}
          <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-4 border-l-4 border-blue-400">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">3</div>
              <h2 className="text-lg font-bold text-gray-800">チームの全体像: 一人じゃない</h2>
            </div>

            {/* チーム平均 */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeColor(avgHonesty, 'honesty')}`}>
                💬 チーム本音度 {avgHonesty}%
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeColor(avgResistance, 'resistance')}`}>
                😰 チーム抵抗感 {avgResistance}%
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeColor(avgEnergy, 'energy')}`}>
                🔥 チームエネルギー {avgEnergy}%
              </span>
            </div>

            {/* メンバーの声 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-600">メンバーの声</h3>
              {allResponses.map((r: any, idx: number) => {
                const rHonesty = clamp(r.vulnerability?.honesty ?? 50)
                const isMe = r.participantId === participantId
                return (
                  <div key={r.id} className={`rounded-xl p-3 border text-sm ${isMe ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800">
                        {r.participantName}{isMe && <span className="text-purple-500 text-xs ml-1">(あなた)</span>}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor(rHonesty, 'honesty')}`}>
                        本音度 {rHonesty}%
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{r.asIs?.fact || r.answer}</p>
                    {rHonesty < 50 && !isMe && (
                      <p className="text-xs text-blue-600 mt-1 italic">
                        💡 {r.participantName}さんが力を出しやすくなるには?
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 認識のズレ */}
            {analysis?.cognitiveDissonance?.pointsOfFriction && analysis.cognitiveDissonance.pointsOfFriction.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="text-sm font-bold text-amber-700 mb-2">⚡ 認識のズレ</h3>
                <ul className="space-y-1">
                  {analysis.cognitiveDissonance.pointsOfFriction.map((point: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* ━━ セクション4: 次の一歩 ━━ */}
          <Card className="bg-white rounded-3xl p-6 shadow-lg space-y-4 border-l-4 border-emerald-400">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">4</div>
              <h2 className="text-lg font-bold text-gray-800">次の一歩: あなたが試せる小さな実験</h2>
            </div>

            {/* 自分への問い */}
            {myInsight?.questionToAsk && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">あなたへの問い</h3>
                <p className="text-sm font-medium text-gray-800 leading-relaxed italic border-l-2 border-purple-400 pl-3">
                  「{myInsight.questionToAsk}」
                </p>
              </div>
            )}

            {/* リーダーが取り組むテーマ */}
            {analysis?.interventionQuestions?.smallAgreement && (
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">リーダーが取り組むテーマ（チーム全体の問い）</h3>
                <p className="text-sm font-medium text-gray-800 leading-relaxed italic border-l-2 border-teal-400 pl-3">
                  「{analysis.interventionQuestions.smallAgreement}」
                </p>
              </div>
            )}

            {/* 話し合うべきトピック */}
            {analysis?.cognitiveDissonance?.discussionTopics && analysis.cognitiveDissonance.discussionTopics.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">チームで話し合うべきトピック</h3>
                <ul className="space-y-2">
                  {analysis.cognitiveDissonance.discussionTopics.map((topic: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                      <span className="bg-teal-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

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
