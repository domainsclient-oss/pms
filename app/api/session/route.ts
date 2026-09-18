import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    const { createSession } = await import("@/lib/session");
    await createSession(idToken);
    try {
      const { getAdminAuth } = await import("@/lib/firebase-admin");
      const { getUser } = await import("@/lib/services/user-service");
      const { logActivity } = await import("@/lib/services/activity-service");
      const decodedToken = await getAdminAuth().verifyIdToken(idToken);
      const user = await getUser(decodedToken.uid);
      if (user) await logActivity({ type: "session", action: "signed_in", subject: "Signed in", actor: user.name, actorRole: user.role });
    } catch (error) {
      console.error("Failed to log sign-in activity", error);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create session", error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ error: "Unable to create session.", debug: message, stack }, { status: 401 });
  }
}

export async function DELETE() {
  const { destroySession } = await import("@/lib/session");
  await destroySession();
  return NextResponse.json({ ok: true });
}
