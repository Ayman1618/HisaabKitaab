import React from "react";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { Search, Database, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Evidence-First Banner */}
        <div className="flex justify-center">
          <EvidenceBadge label="Answers are grounded in retrieved internal sources and linked to supporting passages." />
        </div>

        {/* Product Identity Header */}
        <div className="space-y-4">
          <div className="inline-block">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase bg-slate-200/60 px-3 py-1 rounded-full border border-slate-300/50">
              Enterprise Knowledge Assistant
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
            SourceWise RAG
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-700 tracking-tight">
            Retrieve. Ground. Verify.
          </p>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A grounded enterprise knowledge assistant that retrieves, verifies, and cites trustworthy information from internal documentation.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <Search className="w-4 h-4" />
            <span>Ask a Question</span>
          </button>

          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Database className="w-4 h-4 text-slate-500" />
            <span>Knowledge Base</span>
          </button>
        </div>

        {/* Core Architectural Pillars (Evidence-First Foundation) */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-slate-200 mt-12">
          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">1. Retrieve</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fetch exact passages from verified internal product documentation and engineering wikis.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">2. Ground</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensure every response is strictly derived from retrieved evidence without hallucination.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">3. Verify</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide traceable passage citations for complete transparency and verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
