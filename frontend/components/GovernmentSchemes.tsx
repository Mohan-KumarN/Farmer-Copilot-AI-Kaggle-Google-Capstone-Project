"use client";

import React, { useState } from "react";
import { Language, translations } from "../lib/translations";
import { Search, Info, HelpCircle, FileText, CheckCircle, RefreshCw, AlertCircle, ArrowUpRight } from "lucide-react";

interface GovernmentSchemesProps {
  language: Language;
  userId: number;
}

const SUGGESTED_QUERIES = [
  "What schemes can I apply for?",
  "How to get PM-Kisan Samman Nidhi?",
  "Am I eligible for Kisan Credit Card loan?",
  "Can I get a subsidy on tractors and tillers?"
];

export default function GovernmentSchemes({ language, userId }: GovernmentSchemesProps) {
  const t = translations[language];
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || loading) return;

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("query", searchQuery);
    formData.append("user_id", userId.toString());

    try {
      const res = await fetch("http://localhost:8000/api/schemes/search", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Search request failed");

      const data = await res.json();
      setResponse(data.response);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch scheme advisories. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Intro */}
      <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-600 dark:text-brand-500 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Government Schemes Advisor (RAG)
        </h2>
        <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
          Ask questions about national agricultural schemes, crop insurance, subsidies on equipment, or low-interest credit loans. Our RAG system searches official guidelines and verifies your eligibility.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Search Panel Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-3xl border border-[var(--border)] bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm border-b border-[var(--border)] pb-2">Quick Inquiries</h3>
            
            <div className="space-y-2">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(q)}
                  className="w-full text-left rounded-xl border border-[var(--border)] p-3 text-xs hover:border-brand-500 hover:bg-brand-500/5 transition leading-snug font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="md:col-span-2 space-y-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-foreground/45" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about PM-Kisan, insurance, mechanical subsidies..."
                className="w-full rounded-2xl border border-[var(--border)] bg-card pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="rounded-2xl bg-brand-500 px-6 font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 transition flex items-center gap-1.5 text-sm"
            >
              {loading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : "Search"}
            </button>
          </form>

          {loading && (
            <div className="rounded-3xl border border-[var(--border)] bg-card p-12 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="mt-4 text-xs font-semibold text-foreground/50">Searching agriculture welfare database...</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/20 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {response && (
            <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="font-bold text-sm text-brand-600 dark:text-brand-400">Search Results</h3>
                <p className="text-xxs text-foreground/50 mt-1 uppercase font-bold">Query: "{query}"</p>
              </div>

              <div 
                className="prose prose-sm dark:prose-invert text-sm text-foreground/85 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ 
                  __html: response
                    .replace(/### (.*)/g, '<h4 class="text-xs font-bold uppercase tracking-wider text-soil-500 mt-4 mb-2">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-500 font-bold hover:underline inline-flex items-center gap-0.5">$1 <svg class="h-3 w-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg></a>')
                }} 
              />
            </div>
          )}

          {!loading && !response && !error && (
            <div className="rounded-3xl border border-[var(--border)] bg-card p-12 text-center text-foreground/45 flex flex-col justify-center items-center">
              <HelpCircle className="h-16 w-16 mb-4 stroke-1" />
              <p className="text-sm font-semibold">Awaiting Search Query</p>
              <p className="text-xs mt-1 max-w-[280px]">Select one of the quick questions on the left or type your own question to query the database.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
