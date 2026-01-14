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

      {/* Product Concept Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            Concept
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-balance">
            対話を対話で終わらせない
            <br />
            <span className="gradient-teal-lime-text">Actionable Dialogue</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            TAIWA AIは、「AI介入型・組織開発プラットフォーム」です。
            一過性のワークショップとは異なり、日々の業務プロセスの中にAIが常駐し、ファシリテーターとして振る舞い続けることで、
            具体的に「介入（Intervention）」し、行動変容を促します。
          </p>
        </div>
      </section>

      {/* Logic Model Section */}
      <section className="container mx-auto px-4 py-24 bg-gray-50/50">
        <div className="text-center mb-16">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Logic Model
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">4層構造の組織OSアップデート</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            私たちは、以下のメカニズムで組織課題を解決します。
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-24">
          {/* 1. HERO */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              心理資本（HERO）の最大化
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="font-bold text-xl text-primary">Hope</div>
                <div className="text-sm font-semibold text-gray-500">希望・意志</div>
                <div className="text-sm">
                  <span className="block font-medium mb-1">課題:</span>
                  未来が見えない、経路が不明
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span className="block font-medium text-primary mb-1">AI介入:</span>
                  「As-Is / To-Be / Solution」フレームワークで、曖昧な不満を「理想への経路」へ構造化。
                </div>
              </div>
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="font-bold text-xl text-primary">Efficacy</div>
                <div className="text-sm font-semibold text-gray-500">自己効力感</div>
                <div className="text-sm">
                  <span className="block font-medium mb-1">課題:</span>
                  「どうせ言っても無駄」という無力感
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span className="block font-medium text-primary mb-1">AI介入:</span>
                  小さな合意（Small Win）を可視化し、「自分たちで決めた」成功体験を蓄積。
                </div>
              </div>
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="font-bold text-xl text-primary">Resilience</div>
                <div className="text-sm font-semibold text-gray-500">回復力</div>
                <div className="text-sm">
                  <span className="block font-medium mb-1">課題:</span>
                  失敗への過度な恐れ、不寛容
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span className="block font-medium text-primary mb-1">AI介入:</span>
                  「リフレーミング」機能。トラブル時に「学習の機会」としての問いを投げかける。
                </div>
              </div>
              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="font-bold text-xl text-primary">Optimism</div>
                <div className="text-sm font-semibold text-gray-500">楽観性</div>
                <div className="text-sm">
                  <span className="block font-medium mb-1">課題:</span>
                  ネガティブな解釈の癖
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span className="block font-medium text-primary mb-1">AI介入:</span>
                  感情解析により、チームが良い状態にあることを客観的指標としてフィードバック。
                </div>
              </div>
            </div>
          </div>

          {/* 2. System Thinking */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                システム思考による「悪循環」の断絶
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                組織の問題を「個人の資質」ではなく「システムの構造」として捉えます。
                AIが対話の仲介役となることで、感情的な対立を構造的な議論へと昇華させ（外在化）、悪循環を逆回転させます。
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2 items-start">
                  <span className="text-red-500 font-bold">Bad Cycle:</span>
                  対話不足 → 認識のズレ → 防御的沈黙
                </li>
                <li className="flex gap-2 items-start">
                  <ArrowRight className="h-5 w-5 text-primary rotate-90 md:rotate-0" />
                  <span className="text-primary font-bold">AI Intervention</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-teal-600 font-bold">Good Cycle:</span>
                  問いによる介入 → 構造的理解 → 心理的安全性
                </li>
              </ul>
            </div>
            <div className="glass p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-lime-50 -z-10" />
              <div className="aspect-square flex items-center justify-center">
                {/* Abstract visual representation could go here */}
                <div className="text-center space-y-2">
                  <div className="text-4xl">🔄</div>
                  <div className="font-bold text-gray-700">System Feedback Loop</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Design Thinking */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              デザイン思考 & マイクロ助言プロセス
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-2xl">
                <h4 className="font-bold text-lg mb-4">関係性のプロトタイピング</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  組織づくりを「一度決めたら変えられない計画」ではなく、「仮説検証を繰り返すプロトタイピング」として再定義します。
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> Double Diamond Modelの実装
                </div>
              </div>
              <div className="glass p-8 rounded-2xl">
                <h4 className="font-bold text-lg mb-4">AIによる「マイクロ助言」</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  「許可」ではなく「助言」を。
                  AIが「誰に相談すべきか」をレコメンドすることで、上司の承認待ちを解消し、自律的な意思決定を支援します。
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Users className="h-4 w-4" /> Advice Processの自動化
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Phase Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Roadmap</h2>
          <p className="text-muted-foreground text-lg">段階的な進化プロセス</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Phase 1 */}
          <div className="glass rounded-2xl p-8 space-y-6 hover:scale-[1.02] transition-transform duration-300 border-t-4 border-teal-500">
            <div className="font-bold text-2xl text-gray-800">Phase 1</div>
            <div className="text-teal-600 font-bold text-xl">Visualization</div>
            <p className="text-sm text-gray-600">
              <span className="font-bold">目的:</span> 「対話の増加」と「Hope」の回復
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              組織が抱える「見えない不安」を可視化（Mirroring）することで、メンバーに「現状は変えられる」という認知を持たせる。まずは対話の量を担保し、心理的安全性の土台を作る。
            </p>
          </div>

          {/* Phase 2 */}
          <div className="glass rounded-2xl p-8 space-y-6 hover:scale-[1.02] transition-transform duration-300 border-t-4 border-lime-500 bg-gradient-to-b from-white to-lime-50/30">
            <div className="font-bold text-2xl text-gray-800">Phase 2</div>
            <div className="text-lime-600 font-bold text-xl">Action Translation</div>
            <p className="text-sm text-gray-600">
              <span className="font-bold">目的:</span> 「Efficacy」な行動変容
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              温まった関係性を、具体的な成果（Action）へと接続する。AIが「誰に相談すべきか」をナビゲートすることで、メンバーは迷いなく自律的に動き始める。
              <span className="block mt-2 font-bold text-primary">※ 現在の主力開発フェーズ</span>
            </p>
          </div>

          {/* Phase 3 */}
          <div className="glass rounded-2xl p-8 space-y-6 hover:scale-[1.02] transition-transform duration-300 border-t-4 border-blue-500">
            <div className="font-bold text-2xl text-gray-800">Phase 3</div>
            <div className="text-blue-600 font-bold text-xl">Autonomy Ecosystem</div>
            <p className="text-sm text-gray-600">
              <span className="font-bold">目的:</span> 「Resilience」と完全自律化
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              蓄積されたデータを元に、AIが組織の「勝ちパターン」を学習。組織全体が「学習する組織」へと進化し、人間が意識せずとも好循環（Good Cycle）が回り続ける状態を作る。
            </p>
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
