"use client";

import React, { useState } from "react";
import { Language, translations } from "../lib/translations";
import { Sliders, Thermometer, Droplets, CloudRain, ShieldCheck, HelpCircle, RefreshCw } from "lucide-react";

interface CropRecommendProps {
  language: Language;
  currentWeather?: {
    temperature: number;
    humidity: number;
    rain_chance: number;
  };
}

interface CropSuggestion {
  crop: string;
  confidence: number;
}

export default function CropRecommend({ language, currentWeather }: CropRecommendProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    n: 80,
    p: 45,
    k: 40,
    temp: currentWeather?.temperature || 28.0,
    humidity: currentWeather?.humidity || 70.0,
    ph: 6.5,
    rainfall: 120.0
  });

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CropSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const autofillWeather = () => {
    if (currentWeather) {
      setFormData(prev => ({
        ...prev,
        temp: currentWeather.temperature,
        humidity: currentWeather.humidity,
        // Approximate rainfall from rain chance
        rainfall: currentWeather.rain_chance > 50 ? 180.0 : 60.0
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const postData = new FormData();
    postData.append("n", formData.n.toString());
    postData.append("p", formData.p.toString());
    postData.append("k", formData.k.toString());
    postData.append("temp", formData.temp.toString());
    postData.append("humidity", formData.humidity.toString());
    postData.append("ph", formData.ph.toString());
    postData.append("rainfall", formData.rainfall.toString());

    try {
      const res = await fetch("http://localhost:8000/api/crop-recommendation", {
        method: "POST",
        body: postData
      });

      if (!res.ok) throw new Error("Failed to get recommendations");

      const data = await res.json();
      setSuggestions(data.recommendations);
    } catch (err: any) {
      console.error(err);
      setError("Model prediction failed. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Intro */}
      <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-600 dark:text-brand-500 flex items-center gap-2">
          <Sliders className="h-5 w-5" /> Smart Crop Recommendation Engine
        </h2>
        <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
          Input your soil N-P-K nutrient values, soil pH, and local climatic conditions. Our ML Random Forest Classifier (trained on regional Indian agriculture datasets) will suggest the best matching crops to maximize yield.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-sm">Soil & Weather Inputs</h3>
            {currentWeather && (
              <button 
                type="button"
                onClick={autofillWeather}
                className="text-xxs font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 rounded-full px-2.5 py-1 transition"
              >
                Autofill Weather Data
              </button>
            )}
          </div>

          {/* Soil Nutrients */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Soil Nutrients (mg/kg)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xxs font-bold text-foreground/60 block mb-1">Nitrogen (N)</label>
                <input 
                  type="number" name="n" value={formData.n} onChange={handleChange} min="0" max="200"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xxs font-bold text-foreground/60 block mb-1">Phosphorus (P)</label>
                <input 
                  type="number" name="p" value={formData.p} onChange={handleChange} min="0" max="150"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xxs font-bold text-foreground/60 block mb-1">Potassium (K)</label>
                <input 
                  type="number" name="k" value={formData.k} onChange={handleChange} min="0" max="250"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="space-y-3 border-t border-[var(--border)] pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Environmental Conditions</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-red-500" /> Temperature (°C)
                </label>
                <input 
                  type="number" name="temp" value={formData.temp} onChange={handleChange} step="0.1" min="0" max="50"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-water-blue" /> Humidity (%)
                </label>
                <input 
                  type="number" name="humidity" value={formData.humidity} onChange={handleChange} step="0.1" min="0" max="100"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-soil-500" /> Soil pH
                </label>
                <input 
                  type="number" name="ph" value={formData.ph} onChange={handleChange} step="0.1" min="3" max="10"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                  <CloudRain className="h-3 w-3 text-brand-500" /> Rainfall (mm)
                </label>
                <input 
                  type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} step="1" min="0" max="500"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 transition border-t pt-4"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" /> Fetching Suggestions...
              </>
            ) : (
              "Get Crop Recommendation"
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-600 dark:border-red-950 dark:bg-red-950/20">
              {error}
            </div>
          )}
        </form>

        {/* Recommendations display */}
        <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          {suggestions ? (
            <div className="space-y-6">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="font-bold text-sm">Recommended Crops</h3>
                <p className="text-xxs text-foreground/50 mt-1 uppercase font-bold">Top Match: {suggestions[0].crop}</p>
              </div>

              <div className="space-y-4">
                {suggestions.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-foreground">{item.crop}</span>
                      <span className="text-brand-600 dark:text-brand-400 font-extrabold">{Math.round(item.confidence * 100)}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          idx === 0 ? "bg-brand-500" : idx === 1 ? "bg-brand-400/80" : "bg-soil-500/60"
                        }`}
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Crop guide based on top match */}
              <div className="rounded-2xl bg-brand-50/30 dark:bg-brand-500/5 p-4 border border-[var(--border)] text-xs text-foreground/80 space-y-2 leading-relaxed">
                <p className="font-bold text-brand-600 dark:text-brand-400">Expert Farming Tip for {suggestions[0].crop}:</p>
                {suggestions[0].crop.toLowerCase() === "rice" && (
                  <p>Rice requires standing water during early vegetative stages. Keep fields flooded to 5-10cm. Clay/clay-loam soils are ideal for maximum yield.</p>
                )}
                {suggestions[0].crop.toLowerCase() === "cotton" && (
                  <p>Cotton requires well-drained deep black cotton soils and dry weather. Keep checking for sucking pests like whiteflies during the flowering stage.</p>
                )}
                {suggestions[0].crop.toLowerCase() === "maize" && (
                  <p>Maize needs well-drained loamy soils. Apply the first top-dressing of nitrogen/urea fertilizer 30 days after sowing. Ensure no waterlogging occurs.</p>
                )}
                {!["rice", "cotton", "maize"].includes(suggestions[0].crop.toLowerCase()) && (
                  <p>This crop matches your inputs perfectly. Maintain a standard soil moisture level and verify fertilizer timing according to local growth schedules.</p>
                )}
              </div>

              <button 
                onClick={() => setSuggestions(null)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] py-2 text-xs font-bold hover:bg-[var(--border)]/20 transition-all text-brand-600 dark:text-brand-400"
              >
                Reset Form
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center text-foreground/40 h-full">
              <ShieldCheck className="h-16 w-16 mb-4 stroke-1" />
              <p className="text-sm font-semibold">Ready to Predict</p>
              <p className="text-xs mt-1 max-w-[200px]">Fill out the soil values on the left and submit to see suggestions.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
