import { NextResponse } from "next/server";
import { deleteProject, getProject, updateProject } from "@/lib/services/project-service";
import { logActivity } from "@/lib/services/activity-service";
import { getUser } from "@/lib/services/user-service";
import { Project } from "@/lib/types";
import { requireSession, UnauthorizedError } from "@/lib/session";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    await requireSession();
    const { id } = await context.params;
    const project = await getProject(id);
    return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Project not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to load project", error);
    return NextResponse.json({ error: "Unable to load project from Firestore." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const project = await updateProject(id, await request.json() as Partial<Omit<Project, "id">>);
    const actor = await getUser(session.uid);
    if (project && actor) await logActivity({ type: "project", action: "updated", subject: project.name, actor: actor.name, actorRole: actor.role });
    return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Project not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to update project", error);
    return NextResponse.json({ error: "Unable to update project in Firestore." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const project = await getProject(id);
    await deleteProject(id);
    const actor = await getUser(session.uid);
    if (project && actor) await logActivity({ type: "project", action: "deleted", subject: project.name, actor: actor.name, actorRole: actor.role });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to delete project", error);
    return NextResponse.json({ error: "Unable to delete project from Firestore." }, { status: 500 });
  }
}
