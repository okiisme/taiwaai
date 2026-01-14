import { type NextRequest, NextResponse } from "next/server"
import { addResponse, syncWithLocalStorage } from "@/lib/workshop-store"

export async function POST(request: NextRequest) {
  try {
    const { workshopId, participantId, participantName, participantRole, answer, asIs, toBe, solution, gap } =
      await request.json()

    const session = addResponse(workshopId, {
      participantId,
      participantName,
      participantRole,
      answer,
      asIs,
      toBe,
      solution,
      gap,
    })

    syncWithLocalStorage(workshopId)

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error) {
    console.error("[v0] Error submitting response:", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}
