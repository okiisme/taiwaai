import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_JP, Geist_Mono } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "TAIWA AI - チームの課題を可視化し、対話を生む",
  description: "マネージャーとメンバーの認識ギャップを解消し、自律的な組織文化を構築するAIプラットフォーム",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${geistMono.variable} antialiased`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
