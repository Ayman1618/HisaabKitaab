import React from "react";
import { ShieldCheck } from "lucide-react";

interface EvidenceBadgeProps {
  label?: string;
  className?: string;
}

export function EvidenceBadge({
  label = "Answers are grounded in retrieved internal sources and linked to supporting passages.",
  className = "",
}: EvidenceBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
    >
      <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
