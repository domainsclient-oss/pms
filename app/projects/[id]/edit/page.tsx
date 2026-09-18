import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/services/project-service";
import { ProjectEditForm } from "@/components/project-edit-form";
import { getSession } from "@/lib/session";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <ProjectEditForm project={project} />;
}
