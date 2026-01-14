import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Users, Sparkles, MessageSquare, Lock, TrendingUp } from "@/components/icons"
import { InteractiveDemo } from "@/components/interactive-demo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-light sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="gradient-teal-lime p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold">TAIWA AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ログイン
            </Link>
            <Button asChild className="gradient-teal-lime text-background font-semibold rounded-xl">
              <Link href="/login">無料で始める</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 text-center relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
            チームの課題を可視化し、
            <br />
            <span className="gradient-teal-lime-text">対話を生む</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            マネージャーとメンバーの認識ギャップを解消し、自律的な組織文化を構築するAIプラットフォーム
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" asChild className="gradient-teal-lime text-background font-semibold rounded-xl group">
              <Link href="/login">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl border-primary/50 hover:bg-primary/10 bg-transparent"
            >
              <Link href="#features">詳しく見る</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>完全匿名</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>心理的安全性</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI分析</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="container mx-auto px-4 py-24 bg-gradient-to-b from-background to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">インタラクティブデモ</h2>
            <p className="text-muted-foreground text-lg">
              実際のワークフローを体験してみましょう（ゆっくり再生されます）
            </p>
          </div>

          <InteractiveDemo />

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              QRコード表示から結果分析まで、すべてのステップを確認できます
            </p>
            <Button size="lg" asChild className="gradient-teal-lime text-background font-semibold rounded-xl">
              <Link href="/login">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">2つのフェーズで組織を変革</h2>
          <p className="text-muted-foreground text-lg">ワークショップとAIモニタリングで継続的な改善を実現</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Phase 1 */}
          <div className="glass rounded-2xl p-8 space-y-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              Phase 1
            </div>
            <h3 className="text-3xl font-bold">ワークショップ</h3>
            <p className="text-muted-foreground leading-relaxed">
              人間のファシリテーターが、チームの関係性を可視化。事前アンケートとリアルタイムQ&Aで、本音を引き出します。
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div>
                  <div className="font-semibold mb-1">事前アンケート</div>
                  <div className="text-sm text-muted-foreground">課題を事前に把握</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <Lock className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div>
                  <div className="font-semibold mb-1">匿名Q&A</div>
                  <div className="text-sm text-muted-foreground">心理的安全性を確保</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <BarChart3 className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div>
                  <div className="font-semibold mb-1">AIレポート</div>
                  <div className="text-sm text-muted-foreground">課題を可視化</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Phase 2 */}
          <div className="glass rounded-2xl p-8 space-y-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="inline-block bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-semibold">
              Phase 2
            </div>
            <h3 className="text-3xl font-bold">AIモニタリング</h3>
            <p className="text-muted-foreground leading-relaxed">
              週次のパルスチェックで、チームの状態を継続的に把握。AIが感情分析し、早期アラートを提供します。
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="bg-accent/20 p-2 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <TrendingUp className="h-5 w-5 text-accent flex-shrink-0" />
                </div>
                <div>
                  <div className="font-semibold mb-1">週次パルスチェック</div>
                  <div className="text-sm text-muted-foreground">状態を継続追跡</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="bg-accent/20 p-2 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
                </div>
                <div>
                  <div className="font-semibold mb-1">AI感情分析</div>
                  <div className="text-sm text-muted-foreground">トレンド予測</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="bg-accent/20 p-2 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <Users className="h-5 w-5 text-accent flex-shrink-0" />
                </div>
                <div>
                  <div className="font-semibold mb-1">インサイト提供</div>
                  <div className="text-sm text-muted-foreground">マネージャー向け</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 gradient-teal-lime opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">今すぐチームの課題を可視化</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              無料トライアルで、TAIWA AIの効果を体験してください
            </p>
            <Button
              size="lg"
              asChild
              className="gradient-teal-lime text-background font-semibold rounded-xl text-lg px-8 group"
            >
              <Link href="/login">
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-light border-t border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="gradient-teal-lime p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">TAIWA AI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 TAIWA AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
