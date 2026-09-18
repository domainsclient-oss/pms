"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Project, ProjectStatus, ProjectType, ServiceCredentials } from "@/lib/types";

const projectTypes: ProjectType[] = ["Website", "Web Application", "E-commerce", "WordPress", "Shopify", "Other"];
const projectStatuses: ProjectStatus[] = ["Development", "Testing", "Live", "Maintenance", "Completed"];
type ServiceKey = "website" | "vercel" | "github" | "gmail" | "resend" | "hosting" | "cpanel" | "webmail";

type Field = { key: string; label: string; value?: string; onChange: (value: string) => void; wide?: boolean };

function ServiceSection({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <div className="panel" style={{ padding: 18, marginBottom: 16 }}>
      <p className="form-section-title" style={{ marginTop: 0 }}>{title}</p>
      <div className="form-grid" style={{ marginBottom: 0 }}>
        {fields.map((field) => (
          <div className="form-field" key={field.key} style={field.wide ? { gridColumn: "1 / -1" } : undefined}>
            <label>{field.label}</label>
            <input value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectEditForm({ project }: { project: Project }) {
  const router = useRouter();
  const [form, setForm] = useState<Project>(project);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateTop = <K extends keyof Project>(key: K, value: Project[K]) => setForm((current) => ({ ...current, [key]: value }));

  const updateService = (service: ServiceKey, field: string, value: string) =>
    setForm((current) => ({
      ...current,
      [service]: { ...(current[service] as unknown as Record<string, string | undefined>), [field]: value },
    } as Project));

  const baseFields = (service: ServiceKey, data: ServiceCredentials, extra: { key: string; label: string; value?: string }[] = []): Field[] => [
    { key: "url", label: "URL", value: data.url, onChange: (v) => updateService(service, "url", v) },
    { key: "username", label: "Username", value: data.username, onChange: (v) => updateService(service, "username", v) },
    { key: "password", label: "Password", value: data.password, onChange: (v) => updateService(service, "password", v) },
    ...extra.map(({ key, label, value }) => ({ key, label, value, onChange: (v: string) => updateService(service, key, v) })),
    { key: "notes", label: "Notes", value: data.notes, onChange: (v) => updateService(service, "notes", v), wide: true },
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { id, ...payload } = form;
      const response = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Update failed");
      router.push(`/projects/${id}`);
      router.refresh();
    } catch {
      setError("Could not save changes to Firestore.");
      setSaving(false);
    }
  };

  return (
    <div className="page-content" style={{ width: "min(920px, calc(100% - 84px))" }}>
      <Link href={`/projects/${form.id}`} className="text-button"><ArrowLeft size={15} /> Back to project</Link>
      <div className="page-heading">
        <div><p className="eyebrow">Edit project</p><h1>{form.name}</h1></div>
      </div>

      <form onSubmit={submit}>
        <div className="panel" style={{ padding: 22, marginBottom: 16 }}>
          <div className="form-grid">
            <div className="form-field"><label>Name</label><input required value={form.name} onChange={(e) => updateTop("name", e.target.value)} /></div>
            <div className="form-field"><label>Client</label><input required value={form.client} onChange={(e) => updateTop("client", e.target.value)} /></div>
            <div className="form-field"><label>Type</label><select value={form.type} onChange={(e) => updateTop("type", e.target.value as ProjectType)}>{projectTypes.map((type) => <option key={type}>{type}</option>)}</select></div>
            <div className="form-field"><label>Status</label><select value={form.status} onChange={(e) => updateTop("status", e.target.value as ProjectStatus)}>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
            <div className="form-field"><label>Owner</label><input value={form.owner} onChange={(e) => updateTop("owner", e.target.value)} /></div>
            <div className="form-field"><label>Start date</label><input type="date" value={form.startDate} onChange={(e) => updateTop("startDate", e.target.value)} /></div>
            <div className="form-field"><label>Launch date</label><input type="date" value={form.launchDate} onChange={(e) => updateTop("launchDate", e.target.value)} /></div>
          </div>
          <div className="form-field" style={{ marginBottom: 14 }}><label>Description</label><textarea value={form.description} onChange={(e) => updateTop("description", e.target.value)} /></div>
          <div className="form-field"><label>Notes</label><textarea value={form.notes} onChange={(e) => updateTop("notes", e.target.value)} /></div>
        </div>

        <ServiceSection title="Website" fields={[
          { key: "url", label: "Frontend URL", value: form.website.url, onChange: (v) => updateService("website", "url", v) },
          { key: "adminUrl", label: "Admin Dashboard URL", value: form.website.adminUrl, onChange: (v) => updateService("website", "adminUrl", v) },
          { key: "username", label: "Admin Username", value: form.website.username, onChange: (v) => updateService("website", "username", v) },
          { key: "password", label: "Admin Password", value: form.website.password, onChange: (v) => updateService("website", "password", v) },
          { key: "notes", label: "Admin Notes", value: form.website.notes, onChange: (v) => updateService("website", "notes", v), wide: true },
        ]} />
        <ServiceSection title="Vercel" fields={baseFields("vercel", form.vercel)} />
        <ServiceSection title="GitHub" fields={[
          { key: "url", label: "GitHub Repository URL", value: form.github.url, onChange: (v) => updateService("github", "url", v) },
          { key: "username", label: "GitHub Username", value: form.github.username, onChange: (v) => updateService("github", "username", v) },
          { key: "password", label: "GitHub Password", value: form.github.password, onChange: (v) => updateService("github", "password", v) },
        ]} />
        <ServiceSection title="Gmail" fields={[
          { key: "username", label: "Gmail Username", value: form.gmail.username, onChange: (v) => updateService("gmail", "username", v) },
          { key: "password", label: "Gmail Password", value: form.gmail.password, onChange: (v) => updateService("gmail", "password", v) },
        ]} />
        <ServiceSection title="Resend" fields={[
          { key: "username", label: "Resend Username", value: form.resend.username, onChange: (v) => updateService("resend", "username", v) },
          { key: "password", label: "Resend Password", value: form.resend.password, onChange: (v) => updateService("resend", "password", v) },
          { key: "apiKey", label: "Resend API Key", value: form.resend.apiKey, onChange: (v) => updateService("resend", "apiKey", v) },
        ]} />
        <ServiceSection title="Hosting" fields={[
          { key: "username", label: "Hosting Username", value: form.hosting.username, onChange: (v) => updateService("hosting", "username", v) },
          { key: "password", label: "Hosting Password", value: form.hosting.password, onChange: (v) => updateService("hosting", "password", v) },
          { key: "provider", label: "Hosting Provider", value: form.hosting.provider, onChange: (v) => updateService("hosting", "provider", v) },
          { key: "url", label: "Hosting Login URL", value: form.hosting.url, onChange: (v) => updateService("hosting", "url", v) },
          { key: "plan", label: "Hosting Plan", value: form.hosting.plan, onChange: (v) => updateService("hosting", "plan", v) },
          { key: "serverIp", label: "Server IP", value: form.hosting.serverIp, onChange: (v) => updateService("hosting", "serverIp", v) },
          { key: "serverType", label: "Server Type", value: form.hosting.serverType, onChange: (v) => updateService("hosting", "serverType", v) },
          { key: "renewalDate", label: "Renewal Date", value: form.hosting.renewalDate, onChange: (v) => updateService("hosting", "renewalDate", v) },
          { key: "ftpUsername", label: "FTP/SFTP Username", value: form.hosting.ftpUsername, onChange: (v) => updateService("hosting", "ftpUsername", v) },
          { key: "ftpPort", label: "FTP/SFTP Port", value: form.hosting.ftpPort, onChange: (v) => updateService("hosting", "ftpPort", v) },
          { key: "sshUsername", label: "SSH Username", value: form.hosting.sshUsername, onChange: (v) => updateService("hosting", "sshUsername", v) },
          { key: "sshPort", label: "SSH Port", value: form.hosting.sshPort, onChange: (v) => updateService("hosting", "sshPort", v) },
          { key: "notes", label: "Hosting Notes", value: form.hosting.notes, onChange: (v) => updateService("hosting", "notes", v), wide: true },
        ]} />
        <ServiceSection title="cPanel" fields={baseFields("cpanel", form.cpanel)} />
        <ServiceSection title="Webmail" fields={[
          { key: "url", label: "Webmail URL", value: form.webmail.url, onChange: (v) => updateService("webmail", "url", v) },
          { key: "username", label: "Webmail Username", value: form.webmail.username, onChange: (v) => updateService("webmail", "username", v) },
          { key: "password", label: "Webmail Password", value: form.webmail.password, onChange: (v) => updateService("webmail", "password", v) },
        ]} />

        {error && <p style={{ color: "#b3462c", fontSize: 12, marginTop: 4 }}>{error}</p>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</button>
          <Link href={`/projects/${form.id}`} className="ghost-button">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
