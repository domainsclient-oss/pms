"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { clientAuth } from "@/lib/firebase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSigningIn(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email.trim(), password);
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      if (!response.ok) throw new Error("Session creation failed");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next && next.startsWith("/") ? next : "/";
    } catch {
      setError("Invalid email or password.");
      setSigningIn(false);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--paper)" }}>
      <div className="panel" style={{ width: "min(380px, calc(100% - 40px))", padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div className="brand-mark">W</div>
          <div><strong style={{ display: "block", fontSize: 17, letterSpacing: "-.04em" }}>wezigns</strong><span style={{ display: "block", color: "var(--muted)", fontSize: 10 }}>Project Management System</span></div>
        </div>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Welcome back</p>
        <h1 style={{ margin: "0 0 22px", fontSize: 23, letterSpacing: "-.05em" }}>Sign in to your workspace</h1>
        <form onSubmit={submit}>
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input type="email" required autoFocus value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <div className="input-with-icon">
              <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" className="icon-button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          {error && <p style={{ color: "#b3462c", fontSize: 12, marginTop: 14 }}>{error}</p>}
          <button type="submit" className="primary-button" disabled={signingIn} style={{ width: "100%", justifyContent: "center", marginTop: 22 }}>
            <LogIn size={16} /> {signingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
