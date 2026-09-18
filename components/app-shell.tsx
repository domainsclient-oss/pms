"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, FolderKanban, LayoutDashboard, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { logout, useAuth } from "@/lib/auth-context";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/?view=projects", icon: FolderKanban },
  { label: "People", href: "/?view=people", icon: Users },
  { label: "Settings", href: "/?view=settings", icon: Settings },
  { label: "Activity log", href: "/activity", icon: Bell },
];

function activeLabel(pathname: string) {
  if (pathname.startsWith("/activity")) return "Activity log";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/users")) return "People";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Overview";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileNav, setMobileNav] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const currentSection = activeLabel(pathname);
  const displayName = user?.displayName || user?.email || "Account";
  const initials = displayName.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

  if (pathname === "/" || pathname === "/login") return <>{children}</>;

  const signOut = async () => {
    setProfileMenuOpen(false);
    await Promise.all([logout(), fetch("/api/session", { method: "DELETE" })]);
    router.push("/login");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">W</div>
          <div><strong>wezigns</strong><span>Project Management System</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="workspace-switcher"><div className="workspace-icon">WZ</div><div><span>Workspace</span><strong>wezigns</strong></div><ChevronDown size={15} /></div>
        <p className="nav-label">Workspace</p>
        <nav className="nav-list">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className={`nav-item ${currentSection === label ? "active" : ""}`} onClick={() => setMobileNav(false)}>
              <Icon size={18} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div style={{ position: "relative" }}>
            <button className="profile" style={{ width: "100%", border: 0, background: "none", cursor: "pointer" }} onClick={() => setProfileMenuOpen((current) => !current)} aria-label="Account menu">
              <div className="avatar">{initials}</div>
              <div style={{ textAlign: "left" }}><strong>{displayName}</strong><span>{user?.email}</span></div>
              <ChevronDown size={15} />
            </button>
            {profileMenuOpen && <div className="modal-card" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, padding: 8, maxWidth: "none" }}><button className="nav-item" style={{ width: "100%", color: "#b3462c" }} onClick={signOut}><LogOut size={16} /><span>Log out</span></button></div>}
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{currentSection}</strong></div>
          <div className="top-actions"><button className="round-button" aria-label="Notifications"><Bell size={18} /></button><div className="top-avatar">{initials}</div></div>
        </header>
        {children}
        <footer className="app-footer">wezigns Project Management System</footer>
      </main>
    </div>
  );
}
