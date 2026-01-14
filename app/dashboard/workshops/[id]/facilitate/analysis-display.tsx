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
import type { AnalysisResult } from "@/lib/types"

interface AnalysisDisplayProps {
    analysis: AnalysisResult
    onSelectQuestion: (question: string) => void
}

export function AnalysisDisplay({ analysis, onSelectQuestion }: AnalysisDisplayProps) {
    if (!analysis) return null

    return (
        <div className="space-y-8">
            {/* 1. Executive Summary: Gravity & Warmth (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-3xl p-6 bg-slate-800 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">
                        対話の現在地 (Gravity Status)
                    </h3>
                    <div className="text-2xl sm:text-3xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                        {analysis.gravityStatus || "分析中..."}
                    </div>
                </Card>

                <Card className="rounded-3xl p-6 bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
                                場の温かさ (Warmth)
                            </h3>
                            <p className="text-xs text-gray-400">
                                心理的安全性と本音度から算出
                            </p>
                        </div>
                        <div
                            className={`text-3xl font-black ${(analysis.warmth || 0) > 70
                                ? "text-orange-500"
                                : (analysis.warmth || 0) > 40
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                                }`}
                        >
                            {analysis.warmth || 0}
                            <span className="text-base ml-1">%</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 mt-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${(analysis.warmth || 0) > 70
                                ? "bg-gradient-to-r from-orange-400 to-red-400"
                                : "bg-gradient-to-r from-blue-300 to-yellow-300"
                                }`}
                            style={{ width: `${analysis.warmth || 0}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* 2. Expected HERO ROI (Existing - Enhanced) */}
            {analysis.roiScore !== undefined && (
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-3xl p-8 text-white shadow-xl animate-in fade-in duration-700">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16 animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-lg">
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20">
                                対話の投資効果予測
                            </div>
                            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                                Expected HERO ROI
                            </h3>
                            <p className="text-indigo-200 text-sm leading-relaxed">
                                今回の対話によって、組織の「心理資本（HERO）」がどれだけ向上したかを示す指標です。
                                <br />
                                {(analysis.roiScore || 0) > 80
                                    ? "🚀 重力を振り切り、組織が急成長するポテンシャルを秘めています。"
                                    : "🌱 着実な一歩が踏み出されました。継続的な対話でさらに上昇気流を作り出せます。"}
                            </p>
                        </div>
                        <div className="text-center relative">
                            {/* Floating Animation */}
                            <div
                                className="text-6xl font-black tracking-tighter drop-shadow-lg animate-bounce"
                                style={{ animationDuration: "3s" }}
                            >
                                {analysis.roiScore}
                                <span className="text-2xl ml-1 align-top opacity-80">%</span>
                            </div>
                            <div className="text-xs uppercase tracking-widest text-indigo-300 mt-2 font-semibold">
                                Growth Potential
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Text Structure Analysis (NEW) */}
            {analysis.structuralBridge && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Consensus */}
                    <Card className="rounded-3xl p-6 bg-teal-50 border-teal-100 border relative">
                        <div className="absolute top-4 right-4 text-teal-300">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-teal-800 mb-3 text-sm uppercase">
                            共通認識の地盤 (Consensus)
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-teal-900">
                            {analysis.consensus?.map((item, i) => <li key={i}>{item}</li>) || (
                                <li className="text-gray-400 italic">No consensus found</li>
                            )}
                        </ul>
                    </Card>

                    {/* Conflicts / Divergence */}
                    <Card className="rounded-3xl p-6 bg-orange-50 border-orange-100 border relative">
                        <div className="absolute top-4 right-4 text-orange-300">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-orange-800 mb-3 text-sm uppercase">
                            認識の島々 (Divergence)
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-orange-900">
                            {analysis.conflicts?.map((item, i) => <li key={i}>{item}</li>) || (
                                <li className="text-gray-400 italic">No conflicts detected</li>
                            )}
                        </ul>
                    </Card>

                    {/* Missing Link */}
                    <Card className="rounded-3xl p-6 bg-slate-50 border-slate-200 border-l-4 border-l-purple-500 relative">
                        <div className="absolute top-4 right-4 text-purple-300">
                            <Unplug className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase">
                            構造的欠落 (Missing Link)
                        </h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            {analysis.structuralBridge?.missingLink ||
                                "構造的な欠落は見当たりません。"}
                        </p>
                        <div className="mt-4 inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-bold">
                            Balance: {analysis.structuralBridge?.bridgeBalance || "-"}
                        </div>
                    </Card>
                </div>
            )}

            {/* 4. Three-Axis Bubble Chart (Existing) */}
            {analysis.tags && (
                <Card className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                        <div className="bg-teal-100 p-2 rounded-lg text-teal-600">📊</div>
                        関心の所在 (Focus Areas)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-64 items-end justify-items-center pb-4">
                        {/* Mindset Bubble */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div
                                className="rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg transition-all duration-1000 group-hover:scale-110 flex items-center justify-center text-white font-bold"
                                style={{
                                    width: `${Math.max(
                                        80,
                                        (analysis.tags.mindset || 0) * 2
                                    )}px`,
                                    height: `${Math.max(
                                        80,
                                        (analysis.tags.mindset || 0) * 2
                                    )}px`,
                                    opacity:
                                        Math.max(
                                            0.3,
                                            (analysis.tags.mindset || 0) / 100 + 0.2
                                        ),
                                }}
                            >
                                {analysis.tags.mindset}%
                            </div>
                            <span className="font-bold text-purple-700">
                                Mindset (意識)
                            </span>
                        </div>

                        {/* Process Bubble */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div
                                className="rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg transition-all duration-1000 delay-100 group-hover:scale-110 flex items-center justify-center text-white font-bold"
                                style={{
                                    width: `${Math.max(
                                        80,
                                        (analysis.tags.process || 0) * 2
                                    )}px`,
                                    height: `${Math.max(
                                        80,
                                        (analysis.tags.process || 0) * 2
                                    )}px`,
                                    opacity:
                                        Math.max(
                                            0.3,
                                            (analysis.tags.process || 0) / 100 + 0.2
                                        ),
                                }}
                            >
                                {analysis.tags.process}%
                            </div>
                            <span className="font-bold text-orange-700">
                                Process (仕組み)
                            </span>
                        </div>

                        {/* Environment Bubble */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div
                                className="rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg transition-all duration-1000 delay-200 group-hover:scale-110 flex items-center justify-center text-white font-bold"
                                style={{
                                    width: `${Math.max(
                                        80,
                                        (analysis.tags.environment || 0) * 2
                                    )}px`,
                                    height: `${Math.max(
                                        80,
                                        (analysis.tags.environment || 0) * 2
                                    )}px`,
                                    opacity:
                                        Math.max(
                                            0.3,
                                            (analysis.tags.environment || 0) / 100 + 0.2
                                        ),
                                }}
                            >
                                {analysis.tags.environment}%
                            </div>
                            <span className="font-bold text-green-700">
                                Environment (環境)
                            </span>
                        </div>
                    </div>
                </Card>
            )}

            {/* 5. Gap Analysis / Lemon Market (Existing) */}
            {analysis.gapAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                        className={`rounded-3xl p-6 border-l-8 shadow-sm ${analysis.gapAnalysis.asymmetryLevel === "High"
                            ? "border-l-red-500 bg-red-50"
                            : "border-l-yellow-500 bg-yellow-50"
                            }`}
                    >
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle
                                className={`w-5 h-5 ${analysis.gapAnalysis.asymmetryLevel === "High"
                                    ? "text-red-500"
                                    : "text-yellow-500"
                                    }`}
                            />
                            情報の非対称性 (Information Asymmetry)
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white/60 p-4 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">
                                    Manager View
                                </span>
                                <p className="text-gray-800 font-medium mt-1">
                                    {analysis.gapAnalysis.managerView}
                                </p>
                            </div>
                            <div className="flex justify-center text-gray-400 font-bold text-xs transform rotate-90 md:rotate-0">
                                VS
                            </div>
                            <div className="bg-white/60 p-4 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">
                                    Member View
                                </span>
                                <p className="text-gray-800 font-medium mt-1">
                                    {analysis.gapAnalysis.memberView}
                                </p>
                            </div>
                            {analysis.gapAnalysis.asymmetryLevel === "High" && (
                                <div className="mt-4 p-3 bg-red-100 text-red-800 text-sm rounded-lg font-bold">
                                    🍋 Lemon Market Alert:
                                    認識のズレが大きく、質的な劣化リスクがあります。
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* 6. HERO Insight (Anti-Gravity Radar) */}
                    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-blue-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            HERO Insight (組織の心理資本)
                        </h3>
                        {analysis.heroInsight && (
                            <div className="space-y-4">
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart
                                            cx="50%"
                                            cy="50%"
                                            outerRadius="80%"
                                            data={[
                                                {
                                                    subject: "Hope",
                                                    A: analysis.heroInsight.scores.hope,
                                                    fullMark: 100,
                                                },
                                                {
                                                    subject: "Efficacy",
                                                    A: analysis.heroInsight.scores.efficacy,
                                                    fullMark: 100,
                                                },
                                                {
                                                    subject: "Resilience",
                                                    A: analysis.heroInsight.scores.resilience,
                                                    fullMark: 100,
                                                },
                                                {
                                                    subject: "Optimism",
                                                    A: analysis.heroInsight.scores.optimism,
                                                    fullMark: 100,
                                                },
                                            ]}
                                        >
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                            <Radar
                                                name="Team HERO"
                                                dataKey="A"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.4}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                            強み
                                        </span>
                                        <p>{analysis.heroInsight.strength}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                            病理
                                        </span>
                                        <p>{analysis.heroInsight.pathology}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* 7. Intervention Questions (Enhanced) & Action Tracking */}
            {analysis.interventionQuestions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Questions */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            AIファシリテーターの問い
                        </h3>
                        <div className="space-y-3">
                            <div
                                className="bg-white border-l-4 border-indigo-400 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() =>
                                    onSelectQuestion(
                                        analysis.interventionQuestions!.mutualUnderstanding
                                    )
                                }
                            >
                                <span className="text-xs font-bold text-indigo-400 uppercase">
                                    沈黙を壊す問い (Mutual Understanding)
                                </span>
                                <p className="text-gray-800 font-medium mt-1">
                                    {analysis.interventionQuestions.mutualUnderstanding}
                                </p>
                            </div>
                            <div
                                className="bg-white border-l-4 border-pink-400 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() =>
                                    onSelectQuestion(
                                        analysis.interventionQuestions!.suspendedJudgment
                                    )
                                }
                            >
                                <span className="text-xs font-bold text-pink-400 uppercase">
                                    構造を深める問い (Suspended Judgment)
                                </span>
                                <p className="text-gray-800 font-medium mt-1">
                                    {analysis.interventionQuestions.suspendedJudgment}
                                </p>
                            </div>
                            <div
                                className="bg-white border-l-4 border-teal-400 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() =>
                                    onSelectQuestion(
                                        analysis.interventionQuestions!.smallAgreement
                                    )
                                }
                            >
                                <span className="text-xs font-bold text-teal-400 uppercase">
                                    行動を促す問い (Small Agreement)
                                </span>
                                <p className="text-gray-800 font-medium mt-1">
                                    {analysis.interventionQuestions.smallAgreement}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Tracking (Asset Prediction) */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-500" />
                            行動追跡と資産定着 (Action Execution)
                        </h3>
                        <Card className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-3xl h-auto flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-gray-500">
                                        資産定着率の予測
                                    </span>
                                    <span className="text-2xl font-black text-green-600">
                                        {analysis.assetPrediction?.retentionRate || 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${analysis.assetPrediction?.retentionRate || 0
                                                }%`,
                                        }}
                                    />
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300">
                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                                        意思決定ログ案
                                    </span>
                                    <p className="text-sm text-gray-700 italic">
                                        {analysis.assetPrediction?.decisionLog ||
                                            "アクションが提案されていません"}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Key Findings */}
            {analysis.keyFindings &&
                Array.isArray(analysis.keyFindings) &&
                analysis.keyFindings.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-gray-700 text-sm sm:text-base">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
                            主要な発見
                        </h3>
                        <div className="space-y-3">
                            {analysis.keyFindings.map((finding: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-teal-100"
                                >
                                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-400 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                                        {idx + 1}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                        {finding}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    )
}
