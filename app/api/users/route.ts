import { NextResponse } from "next/server";
import { createUser, listUsers } from "@/lib/services/user-service";
import { logActivity } from "@/lib/services/activity-service";
import { User } from "@/lib/types";
import { requireSession, UnauthorizedError } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({ users: await listUsers() });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to list users", error);
    return NextResponse.json({ error: "Unable to load users from Firestore." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as Omit<User, "id"> & { password?: string };
    const { password, ...user } = body;
    if (!user.name || !user.email || !user.role) {
      return NextResponse.json({ error: "User name, email, and role are required." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const createdUser = await createUser(user, password);
    await logActivity({ type: "user", action: "created", subject: createdUser.name, actor: session.email ?? session.uid, actorRole: "Admin" });
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Unable to create user account." }, { status: 500 });
  }
}
