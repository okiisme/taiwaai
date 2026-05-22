import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "@/components/icons"
import { InteractiveDemo } from "@/components/interactive-demo"

export default async function HomePage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="glass-light sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="gradient-teal-lime p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold">TAIWA AI</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" className="rounded-xl text-sm hidden sm:flex">
              <a href="#demo">デモを試す</a>
            </Button>
            {user ? (
              <Button asChild className="gradient-teal-lime text-background font-semibold rounded-xl">
                <Link href="/dashboard">ダッシュボードへ</Link>
              </Button>
            ) : (
              <Button asChild className="gradient-teal-lime text-background font-semibold rounded-xl">
                <Link href="/sign-in">Googleでログイン</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* ── 1. Hero ── */}
      <section className="container mx-auto px-4 py-28 md:py-36 text-center relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto space-y-8 w-full">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
            チームを置き去りにせず、
            <br />
            <span className="gradient-teal-lime-text">事業を前に進める。</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            対話には時間がかかる。でも、チームの認識を揃えることは諦めたくない。
            <br className="hidden md:block" />
            TAIWA AIのチェックインで、メンバーのモヤモヤを「次に話すべき問い」へ効率的に構造化します。
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" asChild className="gradient-teal-lime text-background font-semibold rounded-xl group">
              <a href="#demo">
                デモを試す（登録不要）
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl border-primary/50 hover:bg-primary/10 bg-transparent"
            >
              <Link href="/sign-in">Googleでログイン</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>実名入力</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>心理的安全性</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>AI分析</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Demo ── */}
      <section id="demo" className="py-24 bg-gradient-to-b from-background to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
                実際のワークフローを体験する
              </h2>
              <p className="text-muted-foreground text-lg">登録不要。2分で体験できます。</p>
            </div>
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* ── 3. Story ── */}
      <section className="py-24 bg-emerald-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              チームの中にいると、こんな瞬間がある。
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="glass rounded-2xl p-8 border-l-4 border-teal-400">
                <p className="text-xl font-medium text-gray-700 leading-relaxed">
                  「チームの中で違和感があるのに、言葉にできない。」
                </p>
              </div>
              <div className="glass rounded-2xl p-8 border-l-4 border-lime-400">
                <p className="text-xl font-medium text-gray-700 leading-relaxed">
                  「言葉にしても、どう変化につなげればいいかわからない。」
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic">
              外から観察するのではなく、当事者として経験してきた「逃げられない問い」。
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Pain Points ── */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-balance">
            リーダーもメンバーも熱量があり、悪い人はいない。でも——
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: "💬", title: "会議で発言する人が固定化する", sub: "「言っても変わらない」という諦め" },
              { emoji: "⚖️", title: "タスクを抱える人が偏る", sub: "役割の曖昧さと頼みにくさ" },
              { emoji: "🤝", title: "1on1が表面的になる", sub: "何を深掘ればいいかわからない" },
            ].map((card, i) => (
              <div key={i} className="glass rounded-2xl p-8 space-y-4 text-center hover:scale-[1.02] transition-transform duration-300">
                <div className="text-5xl">{card.emoji}</div>
                <h3 className="font-bold text-xl text-gray-800">{card.title}</h3>
                <p className="text-muted-foreground text-sm">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Core Problem ── */}
      <section className="py-24" style={{ backgroundColor: "#1a3a2a" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
              本当の問題は「本音がない」ことではない
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl p-8 space-y-5" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-red-400 font-bold text-xs uppercase tracking-wider">× よくある誤解</div>
                <ul className="space-y-4 text-gray-300 text-lg">
                  <li className="flex items-center gap-3">
                    <span className="text-red-400 font-bold text-xl">✗</span>
                    メンバーに考えがない
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-red-400 font-bold text-xl">✗</span>
                    チームへの愛着がない
                  </li>
                </ul>
              </div>
              <div
                className="rounded-2xl p-8 space-y-5 border-2 border-teal-400/50"
                style={{ backgroundColor: "rgba(45,212,191,0.08)" }}
              >
                <div className="text-teal-300 font-bold text-xs uppercase tracking-wider">✓ 実際は</div>
                <p className="text-white text-xl font-medium leading-relaxed">
                  一人ひとりの違和感や願いが、
                  <br />
                  <span className="text-teal-300 font-bold">チームで扱える形になっていない。</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Solution Flow ── */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto space-y-14 text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">実名の声から「次」を設計するAI</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              TAIWA AIは、メンバーの声をAIが整理し、対話と行動の材料を可視化します。
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {/* Input bubbles */}
            <div className="space-y-3">
              {[
                { label: "Aさんの吹き出し", emoji: "💭" },
                { label: "Bさんの吹き出し", emoji: "💬" },
                { label: "Cさんの吹き出し", emoji: "🗣" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl px-6 py-3 text-sm font-medium text-gray-700 flex items-center gap-3 min-w-[180px]"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Arrow right / down */}
            <div className="text-primary font-bold text-4xl md:rotate-0 rotate-90 flex-shrink-0">→</div>

            {/* TAIWA AI center */}
            <div className="gradient-teal-lime rounded-3xl p-8 text-background text-center space-y-2 flex-shrink-0 shadow-2xl">
              <div className="text-4xl">✨</div>
              <div className="font-black text-lg">TAIWA AI</div>
            </div>

            {/* Arrow right / down */}
            <div className="text-primary font-bold text-4xl md:rotate-0 rotate-90 flex-shrink-0">→</div>

            {/* Output */}
            <div className="space-y-3">
              {[
                { label: "個人ごとの状態", color: "border-teal-300 bg-teal-50 text-teal-800" },
                { label: "認識ギャップ", color: "border-lime-300 bg-lime-50 text-lime-800" },
                { label: "次に話すべき問い", color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`rounded-2xl px-6 py-3 text-sm font-semibold border-2 min-w-[180px] ${item.color}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. How it works ── */}
      <section className="py-24 bg-gray-50/70">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">チェックインから行動までの4ステップ</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                会議を増やさない。メンバーが日常の中でチェックインするだけで、チームの認識が揃っていく。
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { num: "01", emoji: "📝", title: "実名でチェックイン", desc: "メンバーが今の状態や違和感を実名でテキスト入力。いつでも、どこでも。" },
                { num: "02", emoji: "🤖", title: "AIが構造化", desc: "ばらばらの声をAIが分析し、チームの現在地を整理。" },
                { num: "03", emoji: "💡", title: "問いの提案", desc: "「誰と」「何を」話すべきか、リーダーへ具体的な話テーマを提示。" },
                { num: "04", emoji: "🚀", title: "対話と行動へ", desc: "表面的な1on1や会議が、課題解決のためのアクションに変わる。" },
              ].map((step, i) => (
                <div key={i} className="relative">
                  {/* Connector arrow (desktop only, between cards) */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-primary font-bold text-xl">
                      →
                    </div>
                  )}
                  <div className="glass rounded-2xl p-6 space-y-4 text-center h-full hover:scale-[1.02] transition-transform duration-300">
                    <div className="text-3xl">{step.emoji}</div>
                    <div className="text-primary font-black text-xl">{step.num}</div>
                    <h3 className="font-bold text-gray-800">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Positioning ── */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            測定と記録の間にある「設計」レイヤー
          </h2>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-4 text-left text-gray-500 font-medium w-28"></th>
                  <th className="py-4 px-4 text-center text-gray-600 font-bold">サーベイツール</th>
                  <th className="py-4 px-4 text-center text-gray-600 font-bold">1on1ツール</th>
                  <th className="py-4 px-4 text-center rounded-t-2xl border-2 border-b-0 border-primary/40 bg-primary/5">
                    <span className="gradient-teal-lime-text font-black text-base">TAIWA AI</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-5 px-4 font-semibold text-gray-700">役割</td>
                  <td className="py-5 px-4 text-center text-gray-600">チーム全体の状態を「測る」</td>
                  <td className="py-5 px-4 text-center text-gray-600">話した内容を「記録する」</td>
                  <td className="py-5 px-4 text-center border-x-2 border-primary/40 bg-primary/5 font-semibold text-teal-700">
                    実名の声から次の対話を「設計する」
                  </td>
                </tr>
                <tr>
                  <td className="py-5 px-4 font-semibold text-gray-700">見えないもの</td>
                  <td className="py-5 px-4 text-center text-gray-600">誰と何を話すべきか</td>
                  <td className="py-5 px-4 text-center text-gray-600">話す前に何を深掘るべきか</td>
                  <td className="py-5 px-4 text-center border-x-2 border-b-2 border-primary/40 bg-primary/5 rounded-b-2xl">
                    <span className="inline-block bg-primary/10 text-teal-700 font-semibold px-3 py-1.5 rounded-xl text-xs">
                      ★ 点数をつけるだけでなく、<br className="hidden sm:block" />具体的なアクションへの橋渡しを行う
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 9. Why Real Name ── */}
      <section className="py-24 bg-gray-50/70">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              なぜ「匿名」ではなく「実名」なのか？
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Anonymous */}
              <div className="bg-gray-100 rounded-2xl p-8 space-y-4">
                <h3 className="font-bold text-lg text-gray-700">匿名では見えにくいもの</h3>
                <p className="text-gray-600 leading-relaxed">
                  「チームの不満」は集まるが、
                  <br />
                  具体的に「誰に・どんな支援が必要か」がわからない。
                </p>
              </div>

              {/* Real name */}
              <div className="bg-emerald-50 rounded-2xl p-8 space-y-5 border border-emerald-200">
                <h3 className="font-bold text-lg text-emerald-800">実名で対話できるチームを育てる</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 line-through">❌「誰が問題ですか？」</span>
                    <span className="text-emerald-700 font-semibold">
                      ✅「いま力を出しやすくなるために何が必要ですか？」
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 line-through">❌「何が不満ですか？」</span>
                    <span className="text-emerald-700 font-semibold">
                      ✅「チームとして次に試したいことは何ですか？」
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer banner */}
            <div
              className="rounded-2xl p-6 text-center text-white font-medium text-base leading-relaxed"
              style={{ backgroundColor: "#1a3a2a" }}
            >
              実名で本音を暴くのではなく、一人ひとりに合わせた対話を設計するための実名。
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Roadmap ── */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">TAIWA AIの進化プロセス</h2>
          <p className="text-muted-foreground text-lg">段階的な進化プロセス</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

      {/* ── 11. CTA ── */}
      <section className="container mx-auto px-4 py-24">
        <div className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden" style={{ backgroundColor: "#1a3a2a" }}>
          <div className="absolute inset-0 gradient-teal-lime opacity-10" />
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white text-balance">
              まずチームで試してみてください。
            </h2>
            <p className="text-emerald-200 text-lg leading-relaxed">
              デモはページ上でそのまま体験できます。登録なしで今すぐ確認を。
              <br className="hidden md:block" />
              チームで使い始めるにはGoogleアカウントでログインするだけです。
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" asChild className="gradient-teal-lime text-background font-semibold rounded-xl group">
                <a href="#demo">
                  デモを試す（登録不要）
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl border-white/40 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/sign-in">Googleでログイン</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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
