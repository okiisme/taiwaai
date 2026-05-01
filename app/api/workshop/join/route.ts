import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workshopId, name, role, stance } = body

    if (!name || !workshopId) {
      return NextResponse.json({ error: "Invalid participant data" }, { status: 400 })
    }

    const participantId = uuidv4()

    await sql`
      INSERT INTO participants (
        id, workshop_id, name, role, 
        stance_energy, stance_mode, stance_openness, 
        joined_at
      )
      VALUES (
        ${participantId}, ${workshopId}, ${name}, ${role || 'member'},
        ${stance?.energyLevel || 50}, ${stance?.currentMode || 50}, ${stance?.openness || 50},
        ${new Date().toISOString()}
      )
    `

    return NextResponse.json({ success: true, participantId })
  } catch (error) {
    console.error("[v0] Database Error joining workshop:", error)
    return NextResponse.json({ error: "Failed to join workshop" }, { status: 500 })
  }
}
