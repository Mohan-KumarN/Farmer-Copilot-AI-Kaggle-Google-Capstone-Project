"use client";

import React, { useEffect, useState } from "react";
import { translations, Language } from "../lib/translations";
import { 
  CloudRain, Sun, Droplets, Wind, TrendingUp, TrendingDown, 
  CheckCircle, Plus, Calendar, AlertTriangle, AlertCircle, ArrowUpRight 
} from "lucide-react";

interface DashboardProps {
  language: Language;
  userId: number;
  onNavigate: (tab: string) => void;
}

interface DashboardData {
  farmer_name: string;
  location: string;
  crop: string;
  growth_stage: string;
  weather: {
    temperature: number;
    humidity: number;
    rain_chance: number;
    wind_speed: number;
    condition: string;
  };
  ai_recommendation: {
    type: string;
    message: string;
    detailed_advisory: string;
  };
  market_prices: Array<{
    crop: string;
    mandi: string;
    price_per_quintal: number;
    change_pct: number;
    trend: string;
  }>;
  upcoming_tasks: Array<{
    id: number;
    task: string;
    due: string;
    completed: boolean;
  }>;
}

export default function Dashboard({ language, userId, onNavigate }: DashboardProps) {
  const t = translations[language];
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: number; task: string; due: string; completed: boolean }>>([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/dashboard/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const jsonData = await res.json();
        setData(jsonData);
        setTasks(jsonData.upcoming_tasks || []);
        setError(null);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Error connecting to backend");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [userId]);

  const toggleTask = (taskId: number) => {
    setTasks(prev => 
      prev.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task)
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-sm font-medium text-foreground/75">{t.loading}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200/50 bg-red-50/10 p-6 text-center shadow-lg dark:border-red-900/30 dark:bg-red-950/5">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-bold text-red-600 dark:text-red-400">Connection Offline</h3>
        <p className="mt-2 text-sm text-foreground/70">
          Make sure your Python FastAPI backend is running on http://localhost:8000.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-600 transition"
        >
          Try Reconnecting
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-wider text-brand-100 font-bold">
            {data.location} • {t.active_crop}: {data.crop} ({data.growth_stage})
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t.welcome}, {data.farmer_name}!
          </h2>
          <p className="text-sm text-brand-50/90 max-w-xl">
            Welcome back to your copilot. Here is your farm's health status and weather advisories for today.
          </p>
        </div>
        
        {/* Background decorative circles */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-200/10" />
        <div className="absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-accent-gold/10" />
      </div>

      {/* Main Grid: Weather & Recommendation */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weather Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="font-bold text-foreground/80">{t.current_weather}</h3>
              <span className="text-xs font-semibold text-soil-500 uppercase">{data.location}</span>
            </div>
            
            <div className="my-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-700/20 text-brand-600 dark:text-brand-400">
                {data.weather.rain_chance > 50 ? (
                  <CloudRain className="h-10 w-10 animate-bounce" />
                ) : (
                  <Sun className="h-10 w-10 animate-spin-slow" />
                )}
              </div>
              <div>
                <p className="text-4xl font-extrabold tracking-tight">{data.weather.temperature}°C</p>
                <p className="text-sm font-medium text-foreground/60">{data.weather.condition}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-water-blue" />
                <div>
                  <p className="text-xxs text-foreground/50 leading-none">{t.humidity}</p>
                  <p className="font-bold leading-tight">{data.weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="text-xxs text-foreground/50 leading-none">{t.rain_prob}</p>
                  <p className="font-bold leading-tight">{data.weather.rain_chance}%</p>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate("weather")}
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] py-2 text-xs font-bold hover:bg-[var(--border)]/20 transition-all text-brand-600 dark:text-brand-400"
          >
            Detailed Weather Advisory <ArrowUpRight className="h-3 w.3" />
          </button>
        </div>

        {/* AI Recommendation Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="font-bold text-foreground/80">{t.today_recommendation}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 dark:bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Active
              </span>
            </div>

            <div className="my-6 rounded-2xl bg-soil-100/30 dark:bg-soil-600/10 p-4 border border-[var(--border)]">
              <p className="text-base font-bold text-brand-600 dark:text-brand-400 leading-snug">
                {data.ai_recommendation.message}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Why this advice?</h4>
              <p className="text-sm text-foreground/85 leading-relaxed line-clamp-3">
                {data.ai_recommendation.detailed_advisory.replace(/###/g, "").replace(/\*\*/g, "")}
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate("chat")}
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white hover:bg-brand-600 shadow-md shadow-brand-500/10 transition-all"
          >
            Ask Copilot for Details
          </button>
        </div>
      </div>

      {/* Row 2: Live Market Prices & Tasks List */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mandi Market Trends */}
        <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
            <h3 className="font-bold text-foreground/80">{t.price_trends}</h3>
            <button 
              onClick={() => onNavigate("market")}
              className="text-xs font-bold text-brand-500 hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-3">
            {data.market_prices.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 hover:bg-[var(--border)]/10 transition cursor-pointer"
                onClick={() => onNavigate("market")}
              >
                <div>
                  <p className="font-bold text-sm">{item.crop}</p>
                  <p className="text-xxs text-foreground/50">{item.mandi}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-brand-600 dark:text-brand-400">₹{item.price_per_quintal} <span className="text-xxs font-normal text-foreground/60">/q</span></p>
                  <span className={`inline-flex items-center gap-0.5 text-xxs font-semibold ${
                    item.trend === "Up" ? "text-emerald-500" : item.trend === "Down" ? "text-red-500" : "text-amber-500"
                  }`}>
                    {item.trend === "Up" ? <TrendingUp className="h-3 w-3" /> : item.trend === "Down" ? <TrendingDown className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {item.trend === "Up" ? "+ " : item.trend === "Down" ? "- " : ""}{Math.abs(item.change_pct)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Manager */}
        <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <h3 className="font-bold text-foreground/80">{t.tasks}</h3>
              <span className="text-xxs rounded-full bg-soil-100 dark:bg-soil-600/50 px-2 py-0.5 font-bold text-soil-600 dark:text-soil-300">
                {tasks.filter(t => !t.completed).length} remaining
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    task.completed 
                      ? "border-[var(--border)] bg-background/50 opacity-60 line-through" 
                      : "border-[var(--border)] hover:bg-[var(--border)]/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => {}} // handled by div click
                      className="h-4.5 w-4.5 rounded border-[var(--border)] text-brand-500 focus:ring-brand-500" 
                    />
                    <p className="text-sm font-semibold">{task.task}</p>
                  </div>
                  <span className="text-xxs text-foreground/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {task.due}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Add farm task..." 
              className="flex-1 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button className="rounded-xl bg-brand-500 p-2 text-white hover:bg-brand-600 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Quick Tools Menu */}
      <div>
        <h3 className="font-bold text-foreground/80 mb-4">{t.quick_links}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button 
            onClick={() => onNavigate("disease")}
            className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-card p-4 text-center hover:border-brand-500 hover:bg-brand-500/5 transition group"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 group-hover:scale-110 transition">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold">{t.disease_scanner}</p>
          </button>

          <button 
            onClick={() => onNavigate("crop-recommend")}
            className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-card p-4 text-center hover:border-brand-500 hover:bg-brand-500/5 transition group"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 group-hover:scale-110 transition">
              <Droplets className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold">{t.crop_recommend}</p>
          </button>

          <button 
            onClick={() => onNavigate("schemes")}
            className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-card p-4 text-center hover:border-brand-500 hover:bg-brand-500/5 transition group"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 group-hover:scale-110 transition">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold">{t.gov_schemes}</p>
          </button>

          <button 
            onClick={() => onNavigate("profile")}
            className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-card p-4 text-center hover:border-brand-500 hover:bg-brand-500/5 transition group"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-soil-100 dark:bg-soil-600/30 text-soil-500 group-hover:scale-110 transition">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold">{t.profile}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
