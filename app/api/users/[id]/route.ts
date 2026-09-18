import { NextResponse } from "next/server";
import { deleteUser, getUser, updateUser } from "@/lib/services/user-service";
import { logActivity } from "@/lib/services/activity-service";
import { User } from "@/lib/types";
import { requireSession, UnauthorizedError } from "@/lib/session";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    await requireSession();
    const { id } = await context.params;
    const user = await getUser(id);
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "User not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to load user", error);
    return NextResponse.json({ error: "Unable to load user from Firestore." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const user = await updateUser(id, (await request.json()) as Partial<Omit<User, "id">>);
    if (user) await logActivity({ type: "user", action: "updated", subject: user.name, actor: session.email ?? session.uid, actorRole: "Admin" });
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "User not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Unable to update user in Firestore." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const user = await getUser(id);
    await deleteUser(id);
    if (user) await logActivity({ type: "user", action: "deleted", subject: user.name, actor: session.email ?? session.uid, actorRole: "Admin" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "Unable to delete user from Firestore." }, { status: 500 });
  }
}
