"use client";

import React from "react";
import { Sprout, Globe, User, Bell } from "lucide-react";

interface NavbarProps {
  language: string;
  setLanguage: (lang: string) => void;
  farmerName: string;
}

const LANGUAGES = [
  { code: "English", label: "English (EN)" },
  { code: "Hindi", label: "हिन्दी (HI)" },
  { code: "Kannada", label: "ಕನ್ನಡ (KN)" },
  { code: "Telugu", label: "తెలుగు (TE)" },
  { code: "Tamil", label: "தமிழ் (TA)" },
  { code: "Marathi", label: "मराठी (MR)" }
];

export default function Navbar({ language, setLanguage, farmerName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-card/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20">
            <Sprout className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-500">
              Farmer Copilot
            </h1>
            <p className="hidden text-xxs font-medium text-soil-500 sm:block">
              Climate-Smart AI Advisor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Language Selector */}
          <div className="relative flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm bg-background hover:bg-[var(--border)]/20 transition-all cursor-pointer group">
            <Globe className="h-4 w-4 text-brand-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-foreground bg-card">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <button className="relative rounded-full border border-[var(--border)] p-2 text-foreground/80 hover:bg-[var(--border)]/20 transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-amber animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-amber" />
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soil-100 dark:bg-soil-600 text-soil-600 dark:text-soil-100 font-semibold shadow-inner">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight">{farmerName}</p>
              <p className="text-xxs text-foreground/60 leading-none">Farmer Profile</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
