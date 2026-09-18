import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/services/project-service";
import { logActivity } from "@/lib/services/activity-service";
import { getUser } from "@/lib/services/user-service";
import { Project } from "@/lib/types";
import { requireSession, UnauthorizedError } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({ projects: await listProjects() });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to list projects", error);
    return NextResponse.json({ error: "Unable to load projects from Firestore." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json() as Omit<Project, "id"> & { id?: string };
    const { id, ...project } = body;
    if (!project.name || !project.client || !project.type || !project.status) {
      return NextResponse.json({ error: "Project name, client, type, and status are required." }, { status: 400 });
    }
    const createdProject = await createProject(project, id);
    const actor = await getUser(session.uid);
    if (actor) await logActivity({ type: "project", action: "created", subject: createdProject.name, actor: actor.name, actorRole: actor.role });
    return NextResponse.json({ project: createdProject }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    console.error("Failed to create project", error);
    return NextResponse.json({ error: "Unable to create project in Firestore." }, { status: 500 });
  }
}
