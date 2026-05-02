"use client"
import { useState, useEffect } from "react"

import { Card } from "@/components/ui/card"
import {
    Target,
    Zap,
    AlertCircle,
    CheckCircle,
    Info,
    ArrowRight,
    MessageSquare
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
    // Recharts hydration fix
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!analysis) return null

    // Fallback values
    const gapScore = analysis.gapScore || 0
    const warmth = stats ? stats.warmth : (analysis.warmth || 0)
    const heroScores = stats ? stats.heroScores : (analysis.heroInsight?.scores || { hope: 0, efficacy: 0, resilience: 0, optimism: 0 })
    const focusTags = stats ? stats.focusTags : (analysis.tags || { mindset: 0, process: 0, environment: 0 })

    if (!isMounted) return null; // Prevent server-side rendering of Recharts

    return (
        <div className="space-y-12">

            {/* SECTION 1: Gap Score or Error Display */}
            <section className="relative">
                {analysis.overallSummary?.title.includes("エラー") || analysis.overallSummary?.title.includes("Error") ? (
                    <Card className="relative overflow-hidden border-2 border-red-500 bg-red-50 p-8 rounded-[2rem] shadow-2xl">
                        <div className="flex flex-col gap-4 text-center">
                            <h2 className="text-xl font-bold text-red-600 flex items-center justify-center gap-2">
                                <AlertCircle className="w-6 h-6" />
                                {analysis.overallSummary?.title}
                            </h2>
                            {/* Detailed Reason */}
                            <div className="bg-white p-4 rounded-xl border border-red-100 text-left space-y-2">
                                <p className="font-bold text-red-800">原因と詳細:</p>
                                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                                    {analysis.keyFindings?.map((finding, i) => (
                                        <li key={i}>{finding}</li>
                                    ))}
                                </ul>
                            </div>
                            {/* Action Suggestion */}
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-left space-y-2">
                                <p className="font-bold text-green-800">推奨アクション:</p>
                                <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                                    {analysis.recommendations?.map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="relative overflow-hidden border-2 border-slate-900 bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-sm font-bold text-teal-400 tracking-widest uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Overall Summary
                                </h2>
                                <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                                    {analysis.overallSummary?.title}
                                </h1>
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl whitespace-pre-wrap">
                                    {analysis.overallSummary?.description}
                                </p>
                            </div>

                            {/* Gap Meter */}
                            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                                <div className="absolute inset-0 rounded-full border-[12px] border-slate-800"></div>
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="84"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 84}
                                        strokeDashoffset={2 * Math.PI * 84 * (1 - gapScore / 100)}
                                        className={`text-red-500 transition-all duration-1000 ease-out`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="text-center">
                                    <span className="block text-5xl font-black">{gapScore}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gap Level</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </section>

            {/* SECTION 2: Cognitive Dissonance (認識のズレ) */}
            {analysis.cognitiveDissonance && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">認識のズレと対話のポイント</h3>
                            <p className="text-xs text-gray-500">メンバー間で生じている認知のズレと、次に話し合うべきこと</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ズレのポイント */}
                        <Card className="p-6 bg-white border border-indigo-100 shadow-sm rounded-2xl">
                            <h4 className="font-bold text-indigo-700 mb-4 flex items-center gap-2">
                                <span className="text-xl">⚠️</span> 具体的な認識のズレ (Friction)
                            </h4>
                            <ul className="space-y-3">
                                {analysis.cognitiveDissonance.pointsOfFriction?.map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                                        <span className="text-indigo-400 font-bold mt-0.5">•</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* 話し合うべきこと */}
                        <Card className="p-6 bg-white border border-teal-100 shadow-sm rounded-2xl">
                            <h4 className="font-bold text-teal-700 mb-4 flex items-center gap-2">
                                <span className="text-xl">💬</span> 話し合うべきトピック
                            </h4>
                            <ul className="space-y-3">
                                {analysis.cognitiveDissonance.discussionTopics?.map((topic: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed bg-teal-50/50 p-3 rounded-lg border border-teal-50">
                                        <span className="text-teal-400 font-bold mt-0.5">•</span>
                                        {topic}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                    {analysis.cognitiveDissonance.lemonMarketRisk && analysis.cognitiveDissonance.lemonMarketRisk !== "-" && (
                        <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm leading-relaxed">
                            <strong>[対話不全アラート]</strong> {analysis.cognitiveDissonance.lemonMarketRisk}
                        </div>
                    )}
                </section>
            )}

            {/* SECTION 3: Visualization (The "Data") and Parameter Analysis */}
            <section className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 3-A: Mood / Warmth */}
                    <Card className="p-6 bg-white border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <span className="text-xl">🌡️</span> チームの温度感
                        </h4>
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="relative w-full max-w-[200px] aspect-square rounded-full border-8 border-gray-100 flex items-center justify-center">
                                <div
                                    className={`text-4xl font-black ${warmth >= 70 ? 'text-orange-500' : 'text-blue-500'}`}
                                >
                                    {warmth}<span className="text-lg text-gray-400 font-bold">%</span>
                                </div>
                                {/* Simple visual indicator rings could go here */}
                            </div>
                            <p className="mt-4 text-sm text-center text-gray-500 font-medium">
                                {warmth >= 70 ? "心理的安全性は高い状態です" : "本音を言いづらい冷えた状態です"}
                            </p>
                        </div>
                    </Card>

                    {/* 3-B: Focus Areas (Bubble Chart substitute) */}
                    <Card className="p-6 bg-white border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-gray-700" /> 関心の所在
                        </h4>
                        <div className="space-y-6 h-48 flex flex-col justify-center">
                            {[
                                { label: 'Mindset (意識)', value: focusTags.mindset, color: 'bg-blue-500' },
                                { label: 'Process (仕組み)', value: focusTags.process, color: 'bg-green-500' },
                                { label: 'Environment (環境)', value: focusTags.environment, color: 'bg-purple-500' }
                            ].map((item, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                        <span>{item.label}</span>
                                        <span>{Math.round(item.value)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* 3-C: HERO Radar */}
                    <Card className="p-6 bg-white border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> 心理的資本 (HERO)
                        </h4>
                        <div className="h-52 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: '希望', A: heroScores.hope, fullMark: 10 },
                                    { subject: '効力感', A: heroScores.efficacy, fullMark: 10 },
                                    { subject: '回復力', A: heroScores.resilience, fullMark: 10 },
                                    { subject: '楽観性', A: heroScores.optimism, fullMark: 10 },
                                ]}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
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
                
                {/* AI Parameter Insight */}
                {analysis.heroInsight?.parameterAnalysis && analysis.heroInsight.parameterAnalysis !== "-" && (
                    <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-100 border border-slate-200 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-white shrink-0 mt-1">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-2">パラメーターからの洞察 (Parameter Insight)</h4>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {analysis.heroInsight.parameterAnalysis}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </section>

            {/* SECTION 4: Next Dialogue (The "Action") */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">次なる対話のステップ</h3>
                        <p className="text-xs text-gray-500">この状況を打破するために、まず必要な問いかけ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Question (Highlighted) */}
                    <Card
                        className="col-span-1 md:col-span-2 p-8 bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl hover:scale-[1.01] transition-transform cursor-pointer relative overflow-hidden group"
                        onClick={() => analysis.interventionQuestions && onSelectQuestion(analysis.interventionQuestions.smallAgreement)}
                    >
                        <div className="absolute top-0 right-0 p-16 bg-white opacity-10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-20 transition-opacity"></div>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border border-white/20">
                                おすすめ (小さな合意)
                            </span>
                            <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-6">
                                "{analysis.interventionQuestions?.smallAgreement}"
                            </h3>
                            <div className="flex items-center gap-2 font-bold text-sm bg-white text-teal-600 px-4 py-2 rounded-full w-fit">
                                この問いから始める <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Card>

                    {/* Secondary Options */}
                    <div className="flex flex-col gap-4">
                        <Card
                            className="flex-1 p-5 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-center"
                            onClick={() => analysis.interventionQuestions && onSelectQuestion(analysis.interventionQuestions.mutualUnderstanding)}
                        >
                            <span className="text-xs font-bold text-indigo-400 mb-2 block">相互理解を深めるなら</span>
                            <p className="text-sm font-bold text-indigo-900">
                                "{analysis.interventionQuestions?.mutualUnderstanding}"
                            </p>
                        </Card>
                        <Card
                            className="flex-1 p-5 border border-fuchsia-100 bg-fuchsia-50/50 hover:bg-fuchsia-50 hover:border-fuchsia-300 transition-all cursor-pointer flex flex-col justify-center"
                            onClick={() => analysis.interventionQuestions && onSelectQuestion(analysis.interventionQuestions.suspendedJudgment)}
                        >
                            <span className="text-xs font-bold text-fuchsia-400 mb-2 block">判断を保留するなら</span>
                            <p className="text-sm font-bold text-fuchsia-900">
                                "{analysis.interventionQuestions?.suspendedJudgment}"
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

        </div>
    )
}
