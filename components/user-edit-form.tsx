"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { User, UserRole } from "@/lib/types";

const roles: UserRole[] = ["Admin", "Staff", "Viewer"];
const statuses: User["status"][] = ["Active", "Invited"];

export function UserEditForm({ user }: { user: User }) {
  const router = useRouter();
  const [form, setForm] = useState<User>(user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof User>(key: K, value: User[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { id, ...payload } = form;
      const response = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Update failed");
      router.push(`/users/${id}`);
      router.refresh();
    } catch {
      setError("Could not save changes to Firestore.");
      setSaving(false);
    }
  };

  return (
    <div className="page-content" style={{ width: "min(700px, calc(100% - 84px))" }}>
      <Link href={`/users/${form.id}`} className="text-button"><ArrowLeft size={15} /> Back to person</Link>
      <div className="page-heading">
        <div><p className="eyebrow">Edit person</p><h1>{form.name}</h1></div>
      </div>

      <form onSubmit={submit}>
        <div className="panel" style={{ padding: 22, marginBottom: 16 }}>
          <div className="form-grid">
            <div className="form-field"><label>Name</label><input required value={form.name} onChange={(e) => updateField("name", e.target.value)} /></div>
            <div className="form-field"><label>Email</label><input required type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} /></div>
            <div className="form-field"><label>Role</label><select value={form.role} onChange={(e) => updateField("role", e.target.value as UserRole)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></div>
            <div className="form-field"><label>Status</label><select value={form.status} onChange={(e) => updateField("status", e.target.value as User["status"])}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>
            <div className="form-field"><label>Created</label><input value={form.createdDate} onChange={(e) => updateField("createdDate", e.target.value)} /></div>
            <div className="form-field"><label>Last login</label><input value={form.lastLogin} onChange={(e) => updateField("lastLogin", e.target.value)} /></div>
          </div>
        </div>

        {error && <p style={{ color: "#b3462c", fontSize: 12, marginTop: 4 }}>{error}</p>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</button>
          <Link href={`/users/${form.id}`} className="ghost-button">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
