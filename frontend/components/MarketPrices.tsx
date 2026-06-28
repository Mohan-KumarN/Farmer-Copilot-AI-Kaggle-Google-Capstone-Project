"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "../lib/translations";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, ShoppingBag, ShieldCheck, Sparkles } from "lucide-react";

interface MarketPricesProps {
  language: Language;
}

interface CommodityPrice {
  crop: string;
  mandi: string;
  price_per_quintal: number;
  change_pct: number;
  trend: string;
  date: string;
}

export default function MarketPrices({ language }: MarketPricesProps) {
  const t = translations[language];
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CommodityPrice | null>(null);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoadingPrices(true);
      setError(null);
      const res = await fetch("http://localhost:8000/api/market/prices");
      if (!res.ok) throw new Error("Failed to load mandi prices");
      const data = await res.json();
      setPrices(data.prices);
      
      // Auto-select first crop
      if (data.prices && data.prices.length > 0) {
        setSelectedCrop(data.prices[0]);
        fetchAdvisory(data.prices[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load mandi prices. Check backend.");
    } finally {
      setLoadingPrices(false);
    }
  };

  const fetchAdvisory = async (commodity: CommodityPrice) => {
    try {
      setLoadingAdvisory(true);
      setAdvisory(null);
      const res = await fetch(
        `http://localhost:8000/api/market/advisory?crop_name=${encodeURIComponent(commodity.crop.toLowerCase())}&price=${commodity.price_per_quintal}&trend=${encodeURIComponent(commodity.trend)}`
      );
      if (!res.ok) throw new Error("Failed to fetch market advisory");
      const data = await res.json();
      setAdvisory(data.advisory);
    } catch (err) {
      console.error(err);
      setAdvisory("Failed to load AI market advice. Check backend server.");
    } finally {
      setLoadingAdvisory(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSelectCrop = (commodity: CommodityPrice) => {
    setSelectedCrop(commodity);
    fetchAdvisory(commodity);
  };

  if (loadingPrices) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 bg-card border border-[var(--border)] rounded-3xl p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-xs font-semibold text-foreground/60">Fetching wholesale mandi price tickers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-card p-8 text-center text-foreground/60 shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <p className="mt-4 text-sm font-semibold">Offline Market Prices</p>
        <p className="mt-2 text-xs">Failed to connect to Mandi feed. Verify FastAPI backend is running.</p>
        <button 
          onClick={fetchPrices}
          className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md"
        >
          Retry Mandi Feed
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Intro */}
      <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-600 dark:text-brand-500 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Live Mandi Prices & Selling Advisor
          </h2>
          <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
            Displays today's wholesale rates from regional Indian wholesale mandis (APMC). Click on a crop to receive AI recommendations on whether to sell immediately or hold.
          </p>
        </div>
        <button 
          onClick={fetchPrices}
          className="rounded-full border border-[var(--border)] p-2 hover:bg-[var(--border)]/20 transition-all text-foreground/60"
          title="Refresh prices"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Prices List Column */}
        <div className="md:col-span-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Commodity Prices</h4>
          <div className="space-y-2">
            {prices.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectCrop(item)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  selectedCrop?.crop === item.crop 
                    ? "border-brand-500 bg-brand-500/5 shadow-md" 
                    : "border-[var(--border)] bg-card hover:bg-[var(--border)]/10"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-foreground">{item.crop}</p>
                    <p className="text-[10px] text-foreground/50">{item.mandi}</p>
                  </div>
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    item.trend === "Up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : item.trend === "Down" ? "bg-red-50 text-red-600 dark:bg-red-950/20" : "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                  }`}>
                    {item.trend === "Up" ? <TrendingUp className="h-3 w-3" /> : item.trend === "Down" ? <TrendingDown className="h-3 w-3" /> : null}
                    {item.trend}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-baseline">
                  <p className="text-xs text-foreground/50">INR / Quintal</p>
                  <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">₹{item.price_per_quintal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Column */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Sell / Hold Recommendation</h4>
          
          <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
            {selectedCrop ? (
              <div className="space-y-4">
                <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{selectedCrop.crop} Advisory</h3>
                    <p className="text-xxs text-foreground/50 mt-0.5 uppercase font-bold">{selectedCrop.mandi}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/60">Updated Today</span>
                </div>

                {loadingAdvisory ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-brand-500" />
                    <p className="text-xs font-medium text-foreground/50">Analyzing price trends...</p>
                  </div>
                ) : advisory ? (
                  <div className="prose prose-sm dark:prose-invert text-sm text-foreground/85 leading-relaxed space-y-4">
                    {/* Advisory Status Header Badge based on Sell vs Wait */}
                    <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-extrabold shadow-sm ${
                      advisory.toLowerCase().includes("sell") 
                        ? "bg-emerald-500 text-white" 
                        : "bg-amber-500 text-white"
                    }`}>
                      <Sparkles className="h-4 w-4" />
                      {advisory.toLowerCase().includes("sell") ? "Copilot Advisory: SELL TODAY" : "Copilot Advisory: HOLD / WAIT"}
                    </div>

                    <div 
                      className="whitespace-pre-line mt-4"
                      dangerouslySetInnerHTML={{ 
                        __html: advisory
                          .replace(/### (.*)/g, '<h4 class="text-xs font-bold uppercase tracking-wider text-soil-500 mt-4 mb-2">$1</h4>')
                          .replace(/\*\*Recommendation:\*\*/g, '<strong>Recommendation:</strong>')
                          .replace(/\*\*Expected price trend:\*\*/g, '<strong>Price Trend:</strong>')
                          .replace(/\*\*Selling tips:\*\*/g, '<strong>Selling Tips:</strong>')
                          .replace(/\*\*/g, "")
                      }} 
                    />
                  </div>
                ) : (
                  <p className="text-sm text-foreground/50 py-10 text-center">Failed to load market advisory.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-foreground/40 h-full">
                <ShieldCheck className="h-16 w-16 mb-4 stroke-1" />
                <p className="text-sm font-semibold">Select a Crop</p>
                <p className="text-xs mt-1">Select a commodity from the left panel to request AI selling advice.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
