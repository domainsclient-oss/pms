"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

export function CredentialField({ label, value, secret = true }: { label: string; value?: string; secret?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const displayValue = value || "Not configured";

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="credential-row">
      <div>
        <p className="field-label">{label}</p>
        <p className={`credential-value ${!value ? "muted" : ""}`}>{secret && value && !visible ? "••••••••••••" : displayValue}</p>
      </div>
      {value && secret && <button className="icon-button" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? `Hide ${label}` : `Show ${label}`}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
      {value && <button className={`icon-button ${copied ? "copied" : ""}`} type="button" onClick={copy} aria-label={`Copy ${label}`}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>}
    </div>
  );
}
