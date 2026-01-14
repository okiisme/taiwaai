"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, LayoutDashboard, LogOut, Activity } from "@/components/icons"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent">
              TAIWA AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-gray-500">{user.role === "manager" ? "マネージャー" : "メンバー"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 min-h-[calc(100vh-73px)] p-4 bg-gray-50">
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-white">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                ダッシュボード
              </Button>
            </Link>
            <Link href="/dashboard/demo">
              <Button
                variant="ghost"
                className="w-full justify-start bg-gradient-to-r from-teal-50 to-lime-50 hover:from-teal-100 hover:to-lime-100 rounded-xl border border-teal-200"
              >
                <Sparkles className="mr-2 h-5 w-5 text-teal-600" />
                <span className="text-teal-700 font-semibold">デモを見る</span>
              </Button>
            </Link>
            <Link href="/dashboard/monitoring">
              <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-white">
                <Activity className="mr-2 h-5 w-5" />
                過去のデータ
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
