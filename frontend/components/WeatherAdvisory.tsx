"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "../lib/translations";
import { CloudRain, Sun, Thermometer, Droplets, Wind, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";

interface WeatherAdvisoryProps {
  language: Language;
  location: string;
  cropName: string;
  growthStage: string;
}

interface WeatherAdvisoryData {
  weather: {
    temperature: number;
    humidity: number;
    rain_chance: number;
    wind_speed: number;
    condition: string;
  };
  advisory: string;
}

export default function WeatherAdvisory({ language, location, cropName, growthStage }: WeatherAdvisoryProps) {
  const t = translations[language];
  const [data, setData] = useState<WeatherAdvisoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdvisory() {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/api/weather/advisory?location=${encodeURIComponent(location)}&crop_name=${encodeURIComponent(cropName)}&growth_stage=${encodeURIComponent(growthStage)}`
        );
        if (!res.ok) throw new Error("Failed to load weather advisory");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load weather advisory. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchAdvisory();
  }, [location, cropName, growthStage]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 bg-card border border-[var(--border)] rounded-3xl p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-xs font-semibold text-foreground/60">Fetching agricultural weather plan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-card p-8 text-center text-foreground/60 shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        <p className="mt-4 text-sm font-semibold">Offline Weather Advisory</p>
        <p className="mt-2 text-xs">Could not fetch live advisory. Make sure the backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Current Conditions Header */}
      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500">
            <Thermometer className="h-5 w-5" />
          </div>
          <p className="text-xxs text-foreground/50 font-bold uppercase">{t.temperature}</p>
          <p className="text-xl font-bold mt-1 text-foreground">{data.weather.temperature}°C</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500">
            <Droplets className="h-5 w-5" />
          </div>
          <p className="text-xxs text-foreground/50 font-bold uppercase">{t.humidity}</p>
          <p className="text-xl font-bold mt-1 text-foreground">{data.weather.humidity}%</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-500">
            <CloudRain className="h-5 w-5" />
          </div>
          <p className="text-xxs text-foreground/50 font-bold uppercase">{t.rain_prob}</p>
          <p className="text-xl font-bold mt-1 text-foreground">{data.weather.rain_chance}%</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm text-center flex flex-col justify-center items-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-soil-100 dark:bg-soil-600/20 text-soil-600 dark:text-soil-300">
            <Wind className="h-5 w-5" />
          </div>
          <p className="text-xxs text-foreground/50 font-bold uppercase">{t.wind}</p>
          <p className="text-xl font-bold mt-1 text-foreground">{data.weather.wind_speed} km/h</p>
        </div>
      </div>

      {/* Main advisory panel */}
      <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="font-bold text-base text-brand-600 dark:text-brand-400">Weather-Aware Farm Plan</h3>
            <p className="text-xxs text-foreground/50 mt-1 uppercase font-bold">Location: {location} • Crop: {cropName} ({growthStage})</p>
          </div>
          <span className="text-xxs font-bold text-foreground/50 bg-background border border-[var(--border)] rounded-full px-2.5 py-1">
            Status: {data.weather.condition}
          </span>
        </div>

        {/* AI response content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/85 leading-relaxed space-y-4">
          <div 
            className="whitespace-pre-line"
            dangerouslySetInnerHTML={{ 
              __html: data.advisory
                .replace(/### (.*)/g, '<h4 class="text-xs font-bold uppercase tracking-wider text-soil-500 mt-4 mb-2">$1</h4>')
                .replace(/\*\*Irrigation Advice:\*\*/g, '<strong>Irrigation:</strong>')
                .replace(/\*\*Fertilizer Timing:\*\*/g, '<strong>Fertilizers:</strong>')
                .replace(/\*\*Pesticide Spraying:\*\*/g, '<strong>Pesticide Suitability:</strong>')
                .replace(/\*\*Risk Level:\*\*/g, '<strong>Risk Level:</strong>')
                .replace(/\*\*/g, "")
            }} 
          />
        </div>

        {/* Risk Alerts */}
        <div className={`rounded-2xl p-4 border flex gap-3 items-start text-xs ${
          data.weather.rain_chance > 60 
            ? "bg-amber-50/50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300"
            : "bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300"
        }`}>
          <div className="mt-0.5">
            {data.weather.rain_chance > 60 ? <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> : <ShieldCheck className="h-4.5 w-4.5 shrink-0" />}
          </div>
          <div>
            <p className="font-bold">
              {data.weather.rain_chance > 60 ? "Warning: Approaching Rain" : "Optimal Conditions"}
            </p>
            <p className="mt-1 leading-relaxed opacity-90">
              {data.weather.rain_chance > 60 
                ? "Do not spray pesticides or fertilizers today as rain will likely wash them away. Delay irrigation and ensure your fields have proper drainage outlets open."
                : "Weather is warm and dry. Excellent conditions for crop management, weed weeding, and foliar spray applications. Keep soil moisture at regular levels."}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
