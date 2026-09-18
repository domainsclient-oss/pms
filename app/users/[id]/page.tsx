import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getUser } from "@/lib/services/user-service";
import { getSession } from "@/lib/session";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <div className="page-content" style={{ width: "min(700px, calc(100% - 84px))" }}>
      <Link href="/?view=people" className="text-button"><ArrowLeft size={15} /> Back to people</Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{user.role}</p>
          <h1>{user.name}</h1>
          <p className="subheading">{user.email}</p>
        </div>
        <Link href={`/users/${user.id}/edit`} className="primary-button"><Pencil size={16} /> Edit person</Link>
      </div>

      <section className="panel" style={{ padding: 22 }}>
        <div className="quick-meta">
          <div><span>Role</span><strong><span className={`role role-${user.role.toLowerCase()}`}>{user.role}</span></strong></div>
          <div><span>Status</span><strong><span className={`status status-${user.status.toLowerCase()}`}>{user.status}</span></strong></div>
          <div><span>Created</span><strong>{user.createdDate}</strong></div>
          <div><span>Last login</span><strong>{user.lastLogin}</strong></div>
        </div>
      </section>
    </div>
  );
}
