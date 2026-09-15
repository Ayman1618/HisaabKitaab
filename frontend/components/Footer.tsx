import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          <p className="font-medium text-slate-700">SourceWise RAG</p>
          <p className="mt-0.5">Enterprise Knowledge Assistant — Retrieve. Ground. Verify.</p>
        </div>
        <div className="text-right sm:text-right text-center">
          <p>&copy; {new Date().getFullYear()} SourceWise. All rights reserved.</p>
          <p className="mt-0.5 font-mono text-[11px] text-slate-400">Frontend Foundation v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
