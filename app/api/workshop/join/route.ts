import { type NextRequest, NextResponse } from "next/server"
import { addParticipant } from "@/lib/workshop-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Join API - Received body:", JSON.stringify(body, null, 2))

    const { workshopId, name, role, stance } = body

    console.log("[v0] Join API - Extracted values:", {
      workshopId,
      name,
      nameType: typeof name,
      nameLength: name?.length,
      role,
      stance,
    })

    if (!name || !name.trim()) {
      console.error("[v0] Join API - Missing or empty participant name:", { name })
      return NextResponse.json({ error: "Participant name is required" }, { status: 400 })
    }

    const participantId = `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const participantData = {
      id: participantId,
      name: name.trim(),
      role,
      stance,
    }
    console.log("[v0] Join API - Creating participant:", JSON.stringify(participantData, null, 2))

    const session = addParticipant(workshopId, participantData)

    console.log(
      "[v0] Join API - Participant added, current participants:",
      session.participants.map((p) => ({ id: p.id, name: p.name })),
    )

    return NextResponse.json({
      success: true,
      participantId,
      session,
    })
  } catch (error) {
    console.error("[v0] Join API - Error:", error)
    return NextResponse.json({ error: "Failed to join workshop" }, { status: 500 })
  }
}
