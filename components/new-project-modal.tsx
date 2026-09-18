"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Project, ProjectStatus, ProjectType } from "@/lib/types";

const projectTypes: ProjectType[] = ["Website", "Web Application", "E-commerce", "WordPress", "Shopify", "Other"];
const projectStatuses: ProjectStatus[] = ["Development", "Testing", "Live", "Maintenance", "Completed"];
type ServiceKey = "website" | "vercel" | "github" | "gmail" | "resend" | "hosting" | "cpanel" | "webmail";

function makeEmptyDraft(): Omit<Project, "id"> {
  return {
    name: "", client: "", type: "Website", status: "Development",
    startDate: "", launchDate: "", description: "", owner: "",
    website: { url: "", adminUrl: "", username: "", password: "", notes: "" },
    vercel: { url: "", username: "", password: "", notes: "" },
    github: { url: "", username: "", password: "" },
    gmail: { username: "", password: "" },
    resend: { username: "", password: "", apiKey: "" },
    hosting: { username: "", password: "", provider: "", url: "", plan: "", serverIp: "", serverType: "", renewalDate: "", ftpUsername: "", ftpPort: "", sshUsername: "", sshPort: "", notes: "" },
    cpanel: { url: "", username: "", password: "", notes: "" },
    webmail: { url: "", username: "", password: "" },
    notes: "",
  };
}

type Field = { key: string; label: string; value?: string; onChange: (value: string) => void; wide?: boolean };

function Section({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <div className="panel" style={{ padding: 16, marginBottom: 14 }}>
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

export function NewProjectModal({ onClose, onCreated, fullPage = false }: { onClose?: () => void; onCreated?: (project: Project) => void; fullPage?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Project, "id">>(makeEmptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateTop = <K extends keyof Omit<Project, "id">>(key: K, value: Omit<Project, "id">[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateService = (service: ServiceKey, field: string, value: string) =>
    setForm((current) => ({ ...current, [service]: { ...(current[service] as unknown as Record<string, string | undefined>), [field]: value } } as Omit<Project, "id">));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.client.trim()) { setError("Project name and client are required."); return; }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json() as { project?: Project; error?: string };
      if (!response.ok || !body.project) throw new Error(body.error || "Create failed");
      onCreated?.(body.project);
      if (fullPage) { router.push("/?view=projects"); router.refresh(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={fullPage ? "page-content new-project-page" : "modal-overlay"} onClick={fullPage ? undefined : onClose}>
      <div className={fullPage ? undefined : "modal-card"} style={fullPage ? { width: "100%", maxWidth: "none", padding: 0, background: "transparent", borderRadius: 0, boxShadow: "none", overflow: "visible" } : { maxWidth: 680, maxHeight: "88vh", overflowY: "auto" }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><h2>New project</h2><button className="icon-button" onClick={fullPage ? () => router.push("/?view=projects") : onClose} aria-label="Close"><X size={17} /></button></div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-field"><label>Project Name</label><input required autoFocus value={form.name} onChange={(e) => updateTop("name", e.target.value)} /></div>
            <div className="form-field"><label>Client Name</label><input required value={form.client} onChange={(e) => updateTop("client", e.target.value)} /></div>
            <div className="form-field"><label>Project Type</label><select value={form.type} onChange={(e) => updateTop("type", e.target.value as ProjectType)}>{projectTypes.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="form-field"><label>Project Status</label><select value={form.status} onChange={(e) => updateTop("status", e.target.value as ProjectStatus)}>{projectStatuses.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="form-field"><label>Project Start Date</label><input type="date" value={form.startDate} onChange={(e) => updateTop("startDate", e.target.value)} /></div>
            <div className="form-field"><label>Project Launch Date</label><input type="date" value={form.launchDate} onChange={(e) => updateTop("launchDate", e.target.value)} /></div>
          </div>
          <div className="form-field" style={{ marginBottom: 14 }}><label>Project Description</label><textarea value={form.description} onChange={(e) => updateTop("description", e.target.value)} /></div>
          <div className="form-field" style={{ marginBottom: 14 }}><label>Project Notes</label><textarea value={form.notes} onChange={(e) => updateTop("notes", e.target.value)} /></div>

          <Section title="Website" fields={[
            { key: "url", label: "Frontend URL", value: form.website.url, onChange: (v) => updateService("website", "url", v) },
            { key: "adminUrl", label: "Admin Dashboard URL", value: form.website.adminUrl, onChange: (v) => updateService("website", "adminUrl", v) },
            { key: "username", label: "Admin Username", value: form.website.username, onChange: (v) => updateService("website", "username", v) },
            { key: "password", label: "Admin Password", value: form.website.password, onChange: (v) => updateService("website", "password", v) },
            { key: "notes", label: "Admin Notes", value: form.website.notes, onChange: (v) => updateService("website", "notes", v), wide: true },
          ]} />

          <Section title="Vercel" fields={[
            { key: "url", label: "Vercel URL", value: form.vercel.url, onChange: (v) => updateService("vercel", "url", v) },
            { key: "username", label: "Vercel Username", value: form.vercel.username, onChange: (v) => updateService("vercel", "username", v) },
            { key: "password", label: "Vercel Password", value: form.vercel.password, onChange: (v) => updateService("vercel", "password", v) },
            { key: "notes", label: "Vercel Notes", value: form.vercel.notes, onChange: (v) => updateService("vercel", "notes", v), wide: true },
          ]} />

          <Section title="GitHub" fields={[
            { key: "url", label: "GitHub Repository URL", value: form.github.url, onChange: (v) => updateService("github", "url", v) },
            { key: "username", label: "GitHub Username", value: form.github.username, onChange: (v) => updateService("github", "username", v) },
            { key: "password", label: "GitHub Password", value: form.github.password, onChange: (v) => updateService("github", "password", v) },
          ]} />

          <Section title="Gmail" fields={[
            { key: "username", label: "Gmail Username", value: form.gmail.username, onChange: (v) => updateService("gmail", "username", v) },
            { key: "password", label: "Gmail Password", value: form.gmail.password, onChange: (v) => updateService("gmail", "password", v) },
          ]} />

          <Section title="Resend" fields={[
            { key: "username", label: "Resend Username", value: form.resend.username, onChange: (v) => updateService("resend", "username", v) },
            { key: "password", label: "Resend Password", value: form.resend.password, onChange: (v) => updateService("resend", "password", v) },
            { key: "apiKey", label: "Resend API Key", value: form.resend.apiKey, onChange: (v) => updateService("resend", "apiKey", v) },
          ]} />

          <Section title="Hosting" fields={[
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

          <Section title="cPanel" fields={[
            { key: "url", label: "cPanel URL", value: form.cpanel.url, onChange: (v) => updateService("cpanel", "url", v) },
            { key: "username", label: "cPanel Username", value: form.cpanel.username, onChange: (v) => updateService("cpanel", "username", v) },
            { key: "password", label: "cPanel Password", value: form.cpanel.password, onChange: (v) => updateService("cpanel", "password", v) },
            { key: "notes", label: "cPanel Notes", value: form.cpanel.notes, onChange: (v) => updateService("cpanel", "notes", v), wide: true },
          ]} />

          <Section title="Webmail" fields={[
            { key: "url", label: "Webmail URL", value: form.webmail.url, onChange: (v) => updateService("webmail", "url", v) },
            { key: "username", label: "Webmail Username", value: form.webmail.username, onChange: (v) => updateService("webmail", "username", v) },
            { key: "password", label: "Webmail Password", value: form.webmail.password, onChange: (v) => updateService("webmail", "password", v) },
          ]} />

          {error && <p style={{ color: "#b3462c", fontSize: 12, marginTop: 4 }}>{error}</p>}
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}><Plus size={16} /> {saving ? "Creating..." : "Create project"}</button>
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
