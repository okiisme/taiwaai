import { type NextRequest, NextResponse } from "next/server"
import { getSession, updateSession } from "@/lib/workshop-store"

export async function GET(request: NextRequest, { params }: { params: { workshopId: string } }) {
  try {
    const session = getSession(params.workshopId)
    return NextResponse.json({ session })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { workshopId: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const session = getSession(params.workshopId)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const updatedSession = {
      ...session,
      status,
    }

    updateSession(params.workshopId, updatedSession)


    return NextResponse.json({ success: true, session: updatedSession })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}
