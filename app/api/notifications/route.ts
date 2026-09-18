import { NextResponse } from "next/server";
import { listActivities } from "@/lib/services/activity-service";
import { getUser } from "@/lib/services/user-service";
import { requireSession, UnauthorizedError } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession();
    const currentUser = await getUser(session.uid);
    if (currentUser?.role !== "Admin") return NextResponse.json({ activities: [] });
    return NextResponse.json({ activities: await listActivities() });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to list notifications", error);
    return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 });
  }
}
