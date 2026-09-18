import { NextResponse } from "next/server";
import { createSession, destroySession } from "@/lib/session";
import { getAdminAuth } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/services/activity-service";
import { getUser } from "@/lib/services/user-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    await createSession(idToken);
    try {
      const decodedToken = await getAdminAuth().verifyIdToken(idToken);
      const user = await getUser(decodedToken.uid);
      if (user) await logActivity({ type: "session", action: "signed_in", subject: "Signed in", actor: user.name, actorRole: user.role });
    } catch (error) {
      console.error("Failed to log sign-in activity", error);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create session", error);
    return NextResponse.json({ error: "Unable to create session." }, { status: 401 });
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
