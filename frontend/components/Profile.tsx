"use client";

import React, { useState, useEffect } from "react";
import { Language, translations } from "../lib/translations";
import { User, MapPin, Layers, Shrink, Droplet, RefreshCw, Save, CheckCircle } from "lucide-react";

interface ProfileProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  userId: number;
  setFarmerName: (name: string) => void;
  onUpdate: () => void;
}

const SOIL_TYPES = ["Black Soil", "Red Sandy Loam", "Clayey", "Alluvial", "Laterite", "Desert Sandy"];
const WATER_SOURCES = ["Borewell / Tubewell", "Canal Irrigation", "Rainfed Only", "Open Well", "River lift"];
const CROPS = ["Tomato", "Rice", "Cotton", "Maize", "Wheat", "Sugarcane", "Mustard", "Millets"];

export default function Profile({ language, setLanguage, userId, setFarmerName, onUpdate }: ProfileProps) {
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    location: "Mandya, Karnataka",
    soil_type: "Red Sandy Loam",
    size: 2.5,
    water_source: "Borewell / Tubewell",
    crop_history: "Tomato"
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/auth/profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setProfile({
              name: data.user.name || "",
              phone: data.user.phone || "",
              email: data.user.email || "",
              location: data.farm?.location || "Mandya, Karnataka",
              soil_type: data.farm?.soil_type || "Red Sandy Loam",
              size: data.farm?.size || 2.5,
              water_source: data.farm?.water_source || "Borewell / Tubewell",
              crop_history: data.crop?.crop_name || "Tomato"
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === "size" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("user_id", userId.toString());
    formData.append("location", profile.location);
    formData.append("soil_type", profile.soil_type);
    formData.append("size", profile.size.toString());
    formData.append("water_source", profile.water_source);
    formData.append("preferred_language", language);
    formData.append("crop_history", profile.crop_history);

    try {
      const res = await fetch("http://localhost:8000/api/auth/profile", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Save profile failed");

      const data = await res.json();
      setFarmerName(profile.name);
      setSuccess(true);
      onUpdate(); // trigger dashboard refresh
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Make sure backend is running.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 bg-card border border-[var(--border)] rounded-3xl p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-xs font-semibold text-foreground/60">Loading profile configurations...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      
      {/* Head */}
      <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-600 dark:text-brand-500 flex items-center gap-2">
          <User className="h-5 w-5" /> Farmer Profile & Settings
        </h2>
        <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
          Configure your farm metadata to receive custom, high-precision recommendations for your specific soil type, location, and irrigation limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm space-y-4">
        
        {/* Personal Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500 border-b border-[var(--border)] pb-1.5">Personal Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs font-bold text-foreground/60 block mb-1">Farmer Name</label>
              <input 
                type="text" name="name" value={profile.name} onChange={handleInputChange} required
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              />
            </div>
            <div>
              <label className="text-xxs font-bold text-foreground/60 block mb-1">Phone Number (Registered)</label>
              <input 
                type="text" name="phone" value={profile.phone} disabled
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background/50 text-foreground/50 cursor-not-allowed font-semibold focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xxs font-bold text-foreground/60 block mb-1">Email Address (Optional)</label>
              <input 
                type="email" name="email" value={profile.email} onChange={handleInputChange}
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Farm Metadata */}
        <div className="space-y-3 border-t border-[var(--border)] pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500 border-b border-[var(--border)] pb-1.5">Farm Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-500" /> Location (District, State)
              </label>
              <input 
                type="text" name="location" value={profile.location} onChange={handleInputChange} required
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              />
            </div>
            <div>
              <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                <Shrink className="h-3.5 w-3.5 text-soil-500" /> Farm Size (Acres)
              </label>
              <input 
                type="number" name="size" value={profile.size} onChange={handleInputChange} step="0.1" required
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              />
            </div>
            <div>
              <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-soil-500" /> Soil Type
              </label>
              <select 
                name="soil_type" value={profile.soil_type} onChange={handleInputChange}
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold cursor-pointer"
              >
                {SOIL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xxs font-bold text-foreground/60 mb-1 flex items-center gap-1">
                <Droplet className="h-3.5 w-3.5 text-water-blue" /> Water Source
              </label>
              <select 
                name="water_source" value={profile.water_source} onChange={handleInputChange}
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold cursor-pointer"
              >
                {WATER_SOURCES.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xxs font-bold text-foreground/60 block mb-1">Active Sown Crop</label>
              <select 
                name="crop_history" value={profile.crop_history} onChange={handleInputChange}
                className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold cursor-pointer"
              >
                {CROPS.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-[var(--border)] pt-4 flex gap-3 justify-end items-center">
          {success && (
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 animate-fade-in">
              <CheckCircle className="h-4 w-4" /> Profile saved successfully!
            </span>
          )}
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-2.5 font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 transition"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t.save_profile}
          </button>
        </div>

      </form>

    </div>
  );
}
