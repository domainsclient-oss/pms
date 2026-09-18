"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword } from "firebase/auth";
import { ArrowUpRight, Bell, BriefcaseBusiness, CheckCircle2, ChevronDown, Eye, EyeOff, FolderKanban, LayoutDashboard, LogOut, Menu, Pencil, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Users, X } from "lucide-react";
import { CredentialField } from "@/components/credential-field";
import { Activity } from "@/lib/services/activity-service";
import { Project, ProjectStatus, User, UserRole } from "@/lib/types";
import { useAuth, logout } from "@/lib/auth-context";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Projects", icon: FolderKanban },
  { label: "People", icon: Users },
  { label: "Settings", icon: Settings },
];
const statuses: (ProjectStatus | "All")[] = ["All", "Development", "Testing", "Live", "Maintenance", "Completed"];
const userRoles: UserRole[] = ["Admin", "Staff", "Viewer"];
const emptyUserForm = { name: "", email: "", role: "Viewer" as UserRole, password: "" };

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [databaseState, setDatabaseState] = useState<"loading" | "connected" | "error">("loading");
  const [activeNav, setActiveNav] = useState(() => {
    if (typeof window === "undefined") return "Overview";
    const view = new URLSearchParams(window.location.search).get("view");
    return view === "projects" ? "Projects" : view === "people" ? "People" : view === "settings" ? "Settings" : "Overview";
  });
  const [status, setStatus] = useState<ProjectStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [todayLabel] = useState(() => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()));
  const [toast, setToast] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userFormError, setUserFormError] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    fetch("/api/projects")
      .then(async (response) => {
        if (!response.ok) throw new Error("Firestore request failed");
        return response.json() as Promise<{ projects: Project[] }>;
      })
      .then(({ projects: databaseProjects }) => {
        setProjects(databaseProjects);
        setSelectedProject(databaseProjects[0] ?? null);
        setDatabaseState("connected");
      })
      .catch(() => { setProjects([]); setSelectedProject(null); setDatabaseState("error"); });

    fetch("/api/users")
      .then(async (response) => {
        if (!response.ok) throw new Error("Firestore request failed");
        return response.json() as Promise<{ users: User[] }>;
      })
      .then(({ users: databaseUsers }) => setUsers(databaseUsers))
      .catch(() => setUsers([]));

    fetch("/api/notifications")
      .then(async (response) => {
        if (!response.ok) throw new Error("Notification request failed");
        return response.json() as Promise<{ activities: Activity[] }>;
      })
      .then(({ activities: databaseActivities }) => setActivities(databaseActivities))
      .catch(() => setActivities([]));
  }, []);

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const query = search.toLowerCase();
    const matchesSearch = [project.name, project.client, project.type].some((value) => value.toLowerCase().includes(query));
    return matchesSearch && (status === "All" || project.status === status);
  }), [projects, search, status]);

  const count = (value: ProjectStatus) => projects.filter((project) => project.status === value).length;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const deleteProject = async (id: string) => {
    const target = projects.find((project) => project.id === id);
    if (!target || !window.confirm(`Delete ${target.name}? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id));
      notify("Project removed from Firestore");
    } catch {
      notify("Could not remove project from Firestore");
    }
  };
  const openAddUser = () => { setUserForm(emptyUserForm); setUserFormError(""); setShowPassword(false); setAddUserOpen(true); };
  const closeAddUser = () => { if (!savingUser) setAddUserOpen(false); };
  const submitAddUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) { setUserFormError("Name and email are required."); return; }
    if (userForm.password.length < 6) { setUserFormError("Password must be at least 6 characters."); return; }
    setSavingUser(true);
    setUserFormError("");
    const { password, ...profile } = userForm;
    const draft = { ...profile, name: profile.name.trim(), email: profile.email.trim(), password, status: "Active" as const, createdDate: new Date().toISOString().slice(0, 10), lastLogin: "Not yet" };
    try {
      const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const body = await response.json() as { user?: Omit<typeof draft, "password"> & { id: string }; error?: string };
      if (!response.ok || !body.user) throw new Error(body.error || "Create failed");
      setUsers((currentUsers) => [body.user!, ...currentUsers]);
      notify("User account created");
      setAddUserOpen(false);
    } catch (error) {
      setUserFormError(error instanceof Error ? error.message : "Could not create user account.");
    } finally {
      setSavingUser(false);
    }
  };
  const removeUser = async (id: string) => {
    const target = users.find((user) => user.id === id);
    if (!target || !window.confirm(`Remove ${target.name}?`)) return;
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
      notify("Person removed from Firestore");
    } catch {
      notify("Could not remove person from Firestore");
    }
  };

  const displayName = user?.displayName || user?.email || "Account";
  const currentUserProfile = users.find((person) => person.id === user?.uid);
  const greetingName = authLoading ? "" : displayName.split(" ")[0];
  const initials = displayName.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
  const signOut = async () => {
    setProfileMenuOpen(false);
    await Promise.all([logout(), fetch("/api/session", { method: "DELETE" })]);
    window.location.href = "/login";
  };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) { notify("You need to be signed in to change your password."); return; }
    if (newPassword.length < 6) { notify("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { notify("Passwords do not match."); return; }
    setChangingPassword(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      notify("Password updated successfully.");
    } catch {
      notify("For security, sign out and sign in again before changing your password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark">W</div><div><strong>wezigns</strong><span>Project Management System</span></div><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="workspace-switcher"><div className="workspace-icon">WZ</div><div><span>Workspace</span><strong>wezigns</strong></div><ChevronDown size={15} /></div>
        <p className="nav-label">Workspace</p>
        <nav className="nav-list">{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setMobileNav(false); }}><Icon size={18} /><span>{label}</span>{label === "Projects" && <em>{projects.length}</em>}</button>)}{currentUserProfile?.role === "Admin" && <button className="nav-item" onClick={() => { router.push("/activity"); setMobileNav(false); }}><Bell size={18} /><span>Activity log</span></button>}</nav>
        <div className="sidebar-bottom">
          <div style={{ position: "relative" }}>
            <button className="profile" style={{ width: "100%", border: 0, background: "none", cursor: "pointer" }} onClick={() => setProfileMenuOpen((current) => !current)} aria-label="Account menu">
              <div className="avatar">{initials}</div>
              <div style={{ textAlign: "left" }}><strong>{displayName}</strong><span>{user?.email}</span></div>
              <ChevronDown size={15} />
            </button>
            {profileMenuOpen && (
              <div className="modal-card" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, padding: 8, maxWidth: "none" }}>
                <button className="nav-item" style={{ width: "100%", color: "#b3462c" }} onClick={signOut}><LogOut size={16} /><span>Log out</span></button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div><div className="top-actions"><div className="notification-wrap"><button className="round-button" aria-label="Notifications" onClick={() => setNotificationsOpen((current) => !current)}><Bell size={18} />{activities.length > 0 && <i />}</button>{notificationsOpen && <div className="notification-menu"><div className="notification-header"><strong>Notifications</strong><span>{activities.length} recent</span></div>{activities.length === 0 ? <div className="notification-empty">No staff or viewer activity yet.</div> : <div className="notification-list">{activities.map((activity) => <div className="notification-item" key={activity.id}><div className={`activity-icon ${activity.type === "user" ? "blue" : "green"}`}><Bell size={14} /></div><div><strong>{activity.actor} {activity.action} {activity.type}</strong><p>{activity.subject} · {activity.actorRole}</p><span>{new Date(activity.createdAt).toLocaleString()}</span></div></div>)}</div>}</div>}</div><div className="top-avatar">{initials}</div></div></header>
        <div className="page-content">
          <div className="page-heading"><div><p className="eyebrow">{todayLabel}</p><h1>{activeNav === "Overview" ? `Good morning${greetingName ? `, ${greetingName}` : ""}` : activeNav}</h1><p className="subheading">A clear view of the work moving through wezigns.</p><span className={`database-status ${databaseState}`}><span /> {databaseState === "loading" ? "Connecting to Firestore..." : databaseState === "connected" ? "Live Project data" : "Live data unavailable"}</span></div><button className="primary-button" onClick={() => router.push("/projects/new")}><Plus size={17} /> New project</button></div>
          {activeNav === "Overview" && <>
            <section className="metric-grid">{[["Total projects", projects.length, "Across all workspaces", "total"], ["In development", count("Development"), "Currently in progress", "green"], ["Live projects", count("Live"), "Running in production", "blue"], ["Needs attention", count("Testing") + count("Maintenance"), "Testing or maintenance", "amber"]].map(([label, value, hint, tone]) => <div className="metric-card" key={label}><div className={`metric-icon ${tone}`}><BriefcaseBusiness size={17} /></div><p>{label}</p><strong>{value}</strong><span>{hint}</span></div>)}</section>
            <section className="dashboard-grid"><div className="panel project-panel"><div className="panel-header"><div><p className="eyebrow">Portfolio pulse</p><h2>Recent projects</h2></div><button className="text-button" onClick={() => setActiveNav("Projects")}>View all <ArrowUpRight size={15} /></button></div><div className="table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Launch date</th><th /></tr></thead><tbody>{projects.slice(0, 4).map((project) => <tr key={project.id} onClick={() => setSelectedProject(project)}><td><div className="project-name"><div className="project-dot">{project.name.slice(0, 1)}</div><div><strong>{project.name}</strong><span>{project.type}</span></div></div></td><td>{project.client}</td><td><span className={`status status-${project.status.toLowerCase()}`}>{project.status}</span></td><td>{new Date(project.launchDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td><td><button className="row-arrow" aria-label={`Open ${project.name}`}><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table></div></div><div className="panel activity-panel"><div className="panel-header"><div><p className="eyebrow">Live feed</p><h2>Recent activity</h2></div><button className="round-button small" aria-label="Filter activity"><SlidersHorizontal size={15} /></button></div><div className="empty-state"><FolderKanban size={26} /><strong>No live activity yet</strong><span>Activity will appear here when live records are available.</span></div></div></section>
            {selectedProject && <section className="quick-view"><div><p className="eyebrow">Selected project</p><h2>{selectedProject.name}</h2><p>{selectedProject.description}</p></div><div className="quick-meta"><div><span>Owner</span><strong>{selectedProject.owner}</strong></div><div><span>Credentials</span><strong><ShieldCheck size={15} /> Protected</strong></div><div><span>Launch date</span><strong>{selectedProject.launchDate || "Not set"}</strong></div></div><div className="credential-preview"><CredentialField label="Admin username" value={selectedProject.website.username} secret={false} /><CredentialField label="Admin password" value={selectedProject.website.password} /></div></section>}
          </>}
          {activeNav === "Projects" && <section className="panel projects-page"><div className="projects-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, clients, types..." /></div><div className="filter-group"><SlidersHorizontal size={16} /><select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus | "All")} aria-label="Filter by status">{statuses.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="filter-pills">{statuses.map((item) => <button key={item} className={status === item ? "selected" : ""} onClick={() => setStatus(item)}>{item}</button>)}</div><div className="table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Type</th><th>Status</th><th>Start date</th><th>Launch date</th><th>Actions</th></tr></thead><tbody>{filteredProjects.map((project) => <tr key={project.id}><td><div className="project-name"><div className="project-dot">{project.name.slice(0, 1)}</div><strong>{project.name}</strong></div></td><td>{project.client}</td><td>{project.type}</td><td><span className={`status status-${project.status.toLowerCase()}`}>{project.status}</span></td><td>{project.startDate}</td><td>{project.launchDate}</td><td><div className="table-actions"><Link href={`/projects/${project.id}`} aria-label={`View ${project.name}`}><Eye size={16} /></Link><Link href={`/projects/${project.id}/edit`} aria-label={`Edit ${project.name}`}><Pencil size={16} /></Link><button onClick={() => deleteProject(project.id)} aria-label={`Delete ${project.name}`}><X size={16} /></button></div></td></tr>)}</tbody></table>{filteredProjects.length === 0 && <div className="empty-state"><FolderKanban size={26} /><strong>No projects found</strong><span>Try a different search or status filter.</span></div>}</div></section>}
          {activeNav === "People" && <section className="panel projects-page"><div className="panel-header"><div><p className="eyebrow">Access management</p><h2>People & roles</h2></div><button className="primary-button" onClick={openAddUser}><Plus size={17} /> Add user</button></div><div className="table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Status</th><th>Created</th><th>Last login</th><th /></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="person-cell"><div className="avatar small">{user.name.split(" ").map((word) => word[0]).join("")}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td><td><span className={`role role-${user.role.toLowerCase()}`}>{user.role}</span></td><td><span className={`status status-${user.status.toLowerCase()}`}>{user.status}</span></td><td>{user.createdDate}</td><td>{user.lastLogin}</td><td><div className="table-actions"><Link href={`/users/${user.id}`} aria-label={`View ${user.name}`}><Eye size={16} /></Link><Link href={`/users/${user.id}/edit`} aria-label={`Edit ${user.name}`}><Pencil size={16} /></Link><button onClick={() => removeUser(user.id)} aria-label={`Remove ${user.name}`}><X size={16} /></button></div></td></tr>)}</tbody></table></div></section>}
          {activeNav === "Settings" && <section className="settings-grid"><div className="panel settings-card password-settings-card"><div className="settings-icon"><ShieldCheck size={18} /></div><h2>Change password</h2><p>Choose a new password for {user?.email ?? "your signed-in account"}.</p><form onSubmit={changePassword}><div className="form-field" style={{ marginTop: 18 }}><label>New password</label><div className="input-with-icon"><input type={showNewPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><button type="button" className="icon-button" onClick={() => setShowNewPassword((current) => !current)} aria-label={showNewPassword ? "Hide new password" : "Show new password"}>{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div><div className="form-field" style={{ marginTop: 14 }}><label>Confirm new password</label><div className="input-with-icon"><input type={showConfirmPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><button type="button" className="icon-button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div><button className="primary-button" type="submit" disabled={!user || changingPassword} style={{ marginTop: 18 }}>{changingPassword ? "Updating password..." : "Update password"}</button></form></div></section>}
        </div>
        <footer className="app-footer">wezigns Project Management System</footer>
      </main>
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
      {addUserOpen && (
        <div className="modal-overlay" onClick={closeAddUser}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><h2>Add user</h2><button className="icon-button" onClick={closeAddUser} aria-label="Close"><X size={17} /></button></div>
            <form onSubmit={submitAddUser}>
              <div className="form-field" style={{ marginBottom: 14 }}><label>Name</label><input autoFocus value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} /></div>
              <div className="form-field" style={{ marginBottom: 14 }}><label>Email</label><input type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} /></div>
              <div className="form-field" style={{ marginBottom: 14 }}><label>Role</label><select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as UserRole }))}>{userRoles.map((role) => <option key={role}>{role}</option>)}</select></div>
              <div className="form-field"><label>Password</label><div className="input-with-icon"><input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={6} value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} /><button type="button" className="icon-button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
              {userFormError && <p style={{ color: "#b3462c", fontSize: 12, marginTop: 14 }}>{userFormError}</p>}
              <div className="form-actions"><button type="submit" className="primary-button" disabled={savingUser}><Plus size={16} /> {savingUser ? "Adding..." : "Add user"}</button><button type="button" className="ghost-button" onClick={closeAddUser}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
