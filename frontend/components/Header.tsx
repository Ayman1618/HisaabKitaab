import React from "react";
import Link from "next/link";
import { Database, FileText } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
            SW
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-base leading-tight tracking-tight">
              SourceWise RAG
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Retrieve. Ground. Verify.
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Foundation v0.1.0
          </span>
        </nav>
      </div>
    </header>
  );
}
