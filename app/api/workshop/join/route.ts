import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workshopId, participant } = body

    if (!participant || !participant.id || !participant.name) {
      return NextResponse.json({ error: "Invalid participant data" }, { status: 400 })
    }

    // Check if participant already exists
    const { rows: existing } = await sql`
      SELECT id FROM participants 
      WHERE workshop_id = ${workshopId} AND id = ${participant.id}
    `

    if (existing.length === 0) {
      await sql`
        INSERT INTO participants (
          id, workshop_id, name, role, 
          stance_energy, stance_mode, stance_openness, 
          joined_at
        )
        VALUES (
          ${participant.id}, ${workshopId}, ${participant.name}, ${participant.role || 'member'},
          ${participant.stance?.energyLevel || 5}, ${participant.stance?.currentMode || 'divergent'}, ${participant.stance?.openness || 5},
          ${new Date().toISOString()}
        )
      `
    } else {
      // Update if exists (re-join logic) - optional, but good for idempotency
      console.log("Participant already exists, skipping insert")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Database Error joining workshop:", error)
    return NextResponse.json({ error: "Failed to join workshop" }, { status: 500 })
  }
}
