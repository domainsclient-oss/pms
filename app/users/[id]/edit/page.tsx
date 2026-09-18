import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/services/user-service";
import { UserEditForm } from "@/components/user-edit-form";
import { getSession } from "@/lib/session";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();
  return <UserEditForm user={user} />;
}
