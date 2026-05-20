"use client"

import { SignIn } from "@clerk/nextjs"
import { Sparkles } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 flex flex-col items-center justify-center gap-8 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2.5 rounded-xl shadow-lg">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent">
          TAIWA AI
        </span>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl rounded-2xl border-0",
            headerTitle: "text-gray-800 font-bold",
            formButtonPrimary: "bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl",
            footerActionLink: "text-teal-600 hover:text-teal-700",
          },
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
