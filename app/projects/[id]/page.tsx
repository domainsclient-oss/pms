import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil, ShieldCheck } from "lucide-react";
import { CredentialField } from "@/components/credential-field";
import { getProject } from "@/lib/services/project-service";
import { ServiceCredentials } from "@/lib/types";
import { getSession } from "@/lib/session";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const sections: { label: string; data: ServiceCredentials; extra?: [string, string | undefined][] }[] = [
    { label: "Website", data: project.website, extra: [["Admin Dashboard URL", project.website.adminUrl]] },
    { label: "Vercel", data: project.vercel },
    { label: "GitHub", data: project.github },
    { label: "Gmail", data: project.gmail },
    { label: "Resend", data: project.resend, extra: [["API key", project.resend.apiKey]] },
    {
      label: "Hosting",
      data: project.hosting,
      extra: [
        ["Provider", project.hosting.provider],
        ["Plan", project.hosting.plan],
        ["Server IP", project.hosting.serverIp],
        ["Server Type", project.hosting.serverType],
        ["Renewal date", project.hosting.renewalDate],
        ["FTP/SFTP Username", project.hosting.ftpUsername],
        ["FTP/SFTP Port", project.hosting.ftpPort],
        ["SSH Username", project.hosting.sshUsername],
        ["SSH Port", project.hosting.sshPort],
      ],
    },
    { label: "cPanel", data: project.cpanel },
    { label: "Webmail", data: project.webmail },
  ];

  return (
    <div className="page-content" style={{ width: "min(920px, calc(100% - 84px))" }}>
      <Link href="/?view=projects" className="text-button"><ArrowLeft size={15} /> Back to projects</Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{project.client}</p>
          <h1>{project.name}</h1>
          <p className="subheading">{project.description || "No description yet."}</p>
        </div>
        <Link href={`/projects/${project.id}/edit`} className="primary-button"><Pencil size={16} /> Edit project</Link>
      </div>

      <section className="panel" style={{ padding: 22, marginBottom: 22 }}>
        <div className="quick-meta">
          <div><span>Status</span><strong><span className={`status status-${project.status.toLowerCase()}`}>{project.status}</span></strong></div>
          <div><span>Type</span><strong>{project.type}</strong></div>
          <div><span>Owner</span><strong>{project.owner}</strong></div>
          <div><span>Start date</span><strong>{project.startDate}</strong></div>
          <div><span>Launch date</span><strong>{project.launchDate}</strong></div>
        </div>
      </section>

      {project.notes && (
        <section className="panel" style={{ padding: 22, marginBottom: 22 }}>
          <p className="eyebrow">Notes</p>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>{project.notes}</p>
        </section>
      )}

      <div className="detail-grid">
        {sections.map(({ label, data, extra }) => (
          <div className="panel" key={label} style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={15} color="var(--green)" />
              <strong style={{ fontSize: 13 }}>{label}</strong>
            </div>
            <div className="credential-preview">
              {data.url && <CredentialField label="URL" value={data.url} secret={false} />}
              <CredentialField label="Username" value={data.username} secret={false} />
              <CredentialField label="Password" value={data.password} />
              {extra?.filter(([, value]) => value).map(([extraLabel, value]) => (
                <CredentialField key={extraLabel} label={extraLabel} value={value} secret={false} />
              ))}
              {data.notes && <CredentialField label="Notes" value={data.notes} secret={false} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
