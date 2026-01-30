"use client"

import { Card } from "@/components/ui/card"
import {
    Users,
    GitBranch,
    Unplug,
    Target,
    Zap,
    AlertCircle,
    TrendingUp,
    CheckCircle,
} from "@/components/icons"
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
} from "recharts"
import type { AnalysisResult, LocalAnalysisStats } from "@/lib/types"

interface AnalysisDisplayProps {
    analysis: AnalysisResult | null
    stats: LocalAnalysisStats | null
    onSelectQuestion: (question: string) => void
}

export function AnalysisDisplay({ analysis, stats, onSelectQuestion }: AnalysisDisplayProps) {
    // Use stats if available, otherwise fallback to AI analysis (for backward compatibility)
    const warmth = stats ? stats.warmth : (analysis?.warmth || 0)
    const heroScores = stats ? stats.heroScores : (analysis?.heroInsight?.scores || { hope: 0, efficacy: 0, resilience: 0, optimism: 0 })
    const focusTags = stats ? stats.focusTags : (analysis?.tags || { mindset: 0, process: 0, environment: 0 })
    const roi = stats ? stats.roi : (analysis?.roiScore || 0)

    return (
        <div className="space-y-8">
            {/* 1. Executive Summary: Gravity & Warmth (Situation Clarity) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 rounded-3xl p-8 bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-700">
                    <div className="absolute top-0 right-0 p-24 bg-blue-600 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -mr-12 -mt-12 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 p-24 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-30 -ml-12 -mb-12"></div>

                    <h3 className="text-xs font-bold text-blue-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        現在のチーム状態 (Gravity Status)
                    </h3>

                    <div className="relative z-10">
                        {analysis?.gravityStatus ? (
                            <>
                                <div className="text-3xl sm:text-4xl font-black leading-tight mb-4 text-white">
                                    {analysis.gravityStatus}
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                                    {analysis.heroInsight?.pathology ? `組織の感情リスク: ${analysis.heroInsight.pathology}` : ""}
                                </p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 opacity-50">
                                <span className="animate-pulse">AI思考中... 深刻な構造課題を分析しています</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4"></div>
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Team Warmth (温度感)
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">
                            心理的安全性・本音度
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-black ${warmth > 70 ? "text-orange-500" : "text-blue-500"}`}>
                                {warmth}
                            </span>
                            <span className="text-lg text-gray-400 font-bold">/100</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${warmth > 70
                                ? "bg-gradient-to-r from-orange-400 to-red-400"
                                : "bg-gradient-to-r from-blue-300 to-blue-500"
                                }`}
                            style={{ width: `${warmth}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* 2. Next Dialogue Intervention (Action Trigger) */}
            {analysis?.interventionQuestions ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-indigo-500 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onSelectQuestion(analysis.interventionQuestions!.mutualUnderstanding)}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900 mb-1">相互理解の問い (Mutual Understanding)</h4>
                                <p className="text-sm text-indigo-700 italic">"{analysis.interventionQuestions!.mutualUnderstanding}"</p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="p-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 border-l-4 border-fuchsia-500 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onSelectQuestion(analysis.interventionQuestions!.suspendedJudgment)}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-fuchsia-100 rounded-lg">
                                <Unplug className="w-5 h-5 text-fuchsia-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-fuchsia-900 mb-1">判断保留の問い (Suspended Judgment)</h4>
                                <p className="text-sm text-fuchsia-700 italic">"{analysis.interventionQuestions!.suspendedJudgment}"</p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onSelectQuestion(analysis.interventionQuestions!.smallAgreement)}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-emerald-900 mb-1">小さな合意形成 (Small Agreement)</h4>
                                <p className="text-sm text-emerald-700 italic">"{analysis.interventionQuestions!.smallAgreement}"</p>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : null}

            {/* 3. Text Structure Analysis (Consensus / Divergence / Missing Link) */}
            {analysis?.structuralBridge ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 border-l-4 border-yellow-400 bg-yellow-50/30">
                        <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            🚫 構造的な欠落箇所 (Missing Link)
                        </h4>
                        <p className="text-sm text-gray-700">{analysis.structuralBridge.missingLink}</p>
                    </Card>
                    {analysis.gapAnalysis && (
                        <Card className="p-6 border-l-4 border-red-400 bg-red-50/30">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-red-800 flex items-center gap-2">
                                    ⚠️ 認識のズレ (Cognitive Gap)
                                </h4>
                                {analysis.gapAnalysis.lemonMarketRisk === "High" && (
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">要警戒 (High Risk)</span>
                                )}
                            </div>
                            {/* Derive cognitive gap summary from view points since original field missing */}
                            <p className="text-sm text-gray-700">
                                {analysis.gapAnalysis.managerView} vs {analysis.gapAnalysis.memberView}
                            </p>
                        </Card>
                    )}
                </div>
            ) : null}

            {/* 4. Three-Axis Bubble Chart (Focus Areas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        関心の所在 (Focus Areas)
                    </h3>
                    <div className="relative h-64 flex items-center justify-center">
                        <div className="absolute flex gap-4 items-end">
                            {/* Mindset Bubble */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="rounded-full bg-blue-500 opacity-80 flex items-center justify-center text-white font-bold transition-all duration-1000"
                                    style={{
                                        width: `${Math.max(40, focusTags.mindset * 1.5)}px`,
                                        height: `${Math.max(40, focusTags.mindset * 1.5)}px`
                                    }}
                                >
                                    {Math.round(focusTags.mindset)}%
                                </div>
                                <span className="text-xs font-bold text-blue-600">Mindset</span>
                            </div>

                            {/* Process Bubble */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="rounded-full bg-green-500 opacity-80 flex items-center justify-center text-white font-bold transition-all duration-1000"
                                    style={{
                                        width: `${Math.max(40, focusTags.process * 1.5)}px`,
                                        height: `${Math.max(40, focusTags.process * 1.5)}px`
                                    }}
                                >
                                    {Math.round(focusTags.process)}%
                                </div>
                                <span className="text-xs font-bold text-green-600">Process</span>
                            </div>

                            {/* Environment Bubble */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="rounded-full bg-purple-500 opacity-80 flex items-center justify-center text-white font-bold transition-all duration-1000"
                                    style={{
                                        width: `${Math.max(40, focusTags.environment * 1.5)}px`,
                                        height: `${Math.max(40, focusTags.environment * 1.5)}px`
                                    }}
                                >
                                    {Math.round(focusTags.environment)}%
                                </div>
                                <span className="text-xs font-bold text-purple-600">Environment</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 5. HERO Insight (Radar Chart) */}
                <Card className="p-6 bg-white shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        心理的資本 (HERO Insight)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: '希望 (Hope)', A: heroScores.hope, fullMark: 10 },
                                { subject: '効力感 (Efficacy)', A: heroScores.efficacy, fullMark: 10 },
                                { subject: '回復力 (Resilience)', A: heroScores.resilience, fullMark: 10 },
                                { subject: '楽観性 (Optimism)', A: heroScores.optimism, fullMark: 10 },
                            ]}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                <Radar
                                    name="Team"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="#8b5cf6"
                                    fillOpacity={0.2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* 6. Growth Potential / ROI (Bottom) */}
            {(roi > 0 || analysis?.roiScore) && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Growth Potential (成長ポテンシャル)</h3>
                    <p className="text-lg font-medium opacity-90">
                        期待されるROI係数: <span className="text-3xl font-black text-emerald-400">{roi}x</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2 max-w-lg mx-auto">
                        心理的資本(HERO)の向上がもたらす、将来的なパフォーマンス向上の予測値です。
                    </p>
                </div>
            )}
        </div>
    )
}
