"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Zap, Brain, Heart, Send } from "lucide-react"

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

  // Response input
  const [asIsFact, setAsIsFact] = useState("")
  const [asIsScore, setAsIsScore] = useState(50)
  const [toBeWill, setToBeWill] = useState("")
  const [toBeScore, setToBeScore] = useState(70)
  const [solutionAction, setSolutionAction] = useState("")
  const [selectedSolutionTags, setSelectedSolutionTags] = useState<string[]>([])

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
        const response = await fetch(`/api/workshop/session/${workshopId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Polling session data:", data)
          if (data.session && data.session.currentQuestion && data.session.currentQuestion !== currentQuestion) {
            setCurrentQuestion(data.session.currentQuestion)
            console.log("[v0] New question received:", data.session.currentQuestion)
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

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
        <Card className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="bg-gradient-to-r from-teal-400 to-lime-400 text-white text-6xl w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">回答ありがとうございました</h2>
            <p className="text-muted-foreground">
              あなたの回答は正常に送信されました。
              <br />
              ファシリテーターの画面で結果をご確認ください。
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Question answering screen
  if (hasJoined && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 p-4">
        <div className="max-w-2xl mx-auto py-8 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">質問</h2>
            <p className="text-lg text-gray-700">{currentQuestion}</p>
          </Card>

          {error && (
            <Card className="bg-red-50 border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </Card>
          )}

          <form onSubmit={handleSubmitResponse} className="space-y-6">
            <Card className="bg-white rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">As is（現状）</div>
              </div>
              <Textarea
                value={asIsFact}
                onChange={(e) => setAsIsFact(e.target.value)}
                placeholder="現在の状況や課題を入力してください"
                className="min-h-[100px] bg-gray-50 rounded-xl border-0 resize-none"
                required
              />
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">スコア (1-10)</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">1</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={10}
                    value={asIsScore}
                    onChange={(e) => setAsIsScore(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <span className="text-sm">10</span>
                  <span className="font-bold text-red-600 min-w-[3rem] text-center">{asIsScore / 10}/10</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="bg-teal-100 text-teal-600 px-3 py-1 rounded-full text-sm font-medium">
                  To be（理想）
                </div>
              </div>
              <Textarea
                value={toBeWill}
                onChange={(e) => setToBeWill(e.target.value)}
                placeholder="理想の状態や目標を入力してください"
                className="min-h-[100px] bg-gray-50 rounded-xl border-0 resize-none"
                required
              />
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">スコア (1-10)</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">1</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={10}
                    value={toBeScore}
                    onChange={(e) => setToBeScore(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <span className="text-sm">10</span>
                  <span className="font-bold text-teal-600 min-w-[3rem] text-center">{toBeScore / 10}/10</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                  Solution（解決策）
                </div>
                <div className="bg-gradient-to-r from-teal-400 to-lime-400 text-white text-xs px-2 py-0.5 rounded-full">
                  Gap: {(toBeScore - asIsScore) / 10}
                </div>
              </div>
              <Textarea
                value={solutionAction}
                onChange={(e) => setSolutionAction(e.target.value)}
                placeholder="このギャップを埋めるための具体的なアクションは？"
                className="min-h-[80px] bg-gray-50 rounded-xl border-0 resize-none"
              />
              <div className="flex flex-wrap gap-2">
                {actionTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleSolutionTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selectedSolutionTags.includes(tag.id)
                        ? `${tag.color} border-current`
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </Card>

            <Button
              type="submit"
              disabled={isLoading || !asIsFact.trim() || !toBeWill.trim()}
              className="w-full bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-xl h-14 text-lg shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                "送信中..."
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  回答を送信
                </>
              )}
            </Button>
          </form>
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
