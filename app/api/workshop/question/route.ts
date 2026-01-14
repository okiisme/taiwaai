import { NextRequest, NextResponse } from "next/server"
import { setCurrentQuestion, updateSessionStatus } from "@/lib/workshop-store"

export async function POST(request: NextRequest) {
  try {
    const { workshopId, question } = await request.json()
    
    const session = setCurrentQuestion(workshopId, question)
    updateSessionStatus(workshopId, 'question-display')
    
    return NextResponse.json({ 
      success: true,
      session 
    })
  } catch (error) {
    console.error("[v0] Error setting question:", error)
    return NextResponse.json({ error: "Failed to set question" }, { status: 500 })
  }
}
