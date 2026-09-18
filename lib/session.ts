import { cookies } from "next/headers";
import { auth } from "@/lib/firebase-admin";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export async function createSession(idToken: string) {
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  cookieStore.delete(SESSION_COOKIE);
  if (!sessionCookie) return;
  try {
    const decoded = await auth.verifySessionCookie(sessionCookie);
    await auth.revokeRefreshTokens(decoded.uid);
  } catch {
    // Cookie was already invalid; nothing to revoke.
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  try {
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export class UnauthorizedError extends Error {}
