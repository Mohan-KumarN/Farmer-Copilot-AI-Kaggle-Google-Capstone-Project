"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";
import AIChat from "../components/AIChat";
import DiseaseScanner from "../components/DiseaseScanner";
import CropRecommend from "../components/CropRecommend";
import WeatherAdvisory from "../components/WeatherAdvisory";
import MarketPrices from "../components/MarketPrices";
import GovernmentSchemes from "../components/GovernmentSchemes";
import Profile from "../components/Profile";
import { Language, translations } from "../lib/translations";

import { 
  LayoutDashboard, MessageSquareCode, ShieldAlert, 
  Settings, ThermometerSun, Leaf, Store, FileSpreadsheet, User 
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [language, setLanguage] = useState<Language>("English");
  const [farmerName, setFarmerName] = useState("Ravi Kumar");
  const [userId, setUserId] = useState(1);
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const t = translations[language];

  // Fetch or Register default user on load
  useEffect(() => {
    async function initUser() {
      try {
        // Register default user if DB is empty
        const formData = new FormData();
        formData.append("name", "Ravi Kumar");
        formData.append("phone", "9876543210");
        formData.append("email", "ravi.kumar@gmail.com");
        
        const regRes = await fetch("http://localhost:8000/api/auth/register", {
          method: "POST",
          body: formData
        });
        
        if (regRes.ok) {
          const userObj = await regRes.json();
          setUserId(userObj.id);
          setFarmerName(userObj.name);
          
          // Setup initial profile
          const profRes = await fetch(`http://localhost:8000/api/auth/profile/${userObj.id}`);
          if (profRes.ok) {
            const data = await profRes.json();
            setProfileData(data);
            if (data.farm) {
              setFarmerName(data.user.name);
            }
          }
        }
      } catch (err) {
        console.error("Could not register default user (backend likely offline yet)", err);
      } finally {
        setProfileLoaded(true);
      }
    }
    initUser();
  }, [triggerUpdate]);

  const handleUpdate = () => {
    setTriggerUpdate(prev => prev + 1);
  };

  const navItems = [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "chat", label: t.ai_chat, icon: MessageSquareCode },
    { id: "disease", label: t.disease_scanner, icon: ShieldAlert },
    { id: "crop-recommend", label: t.crop_recommend, icon: Leaf },
    { id: "weather", label: t.weather, icon: ThermometerSun },
    { id: "market", label: t.market_prices, icon: Store },
    { id: "schemes", label: t.gov_schemes, icon: FileSpreadsheet },
    { id: "profile", label: t.profile, icon: Settings }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      
      {/* Top Navbar */}
      <Navbar 
        language={language} 
        setLanguage={(lang) => setLanguage(lang as Language)} 
        farmerName={farmerName} 
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 gap-8">
        
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden w-64 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1.5 rounded-3xl border border-[var(--border)] bg-card p-4 shadow-sm">
            <div className="px-3 py-2 text-xxs font-bold text-foreground/45 uppercase tracking-wider">
              Navigation Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/10" 
                      : "text-foreground/80 hover:bg-[var(--border)]/20 hover:text-brand-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {activeTab === "dashboard" && (
            <Dashboard 
              language={language} 
              userId={userId} 
              onNavigate={(tab) => setActiveTab(tab)} 
            />
          )}
          {activeTab === "chat" && (
            <AIChat 
              language={language} 
              userId={userId} 
            />
          )}
          {activeTab === "disease" && (
            <DiseaseScanner 
              language={language} 
              userId={userId} 
              cropContext={profileData?.crop?.crop_name || "Tomato"}
            />
          )}
          {activeTab === "crop-recommend" && (
            <CropRecommend 
              language={language} 
              currentWeather={profileData?.weather ? {
                temperature: profileData.weather.temperature,
                humidity: profileData.weather.humidity,
                rain_chance: profileData.weather.rain_chance
              } : undefined}
            />
          )}
          {activeTab === "weather" && (
            <WeatherAdvisory 
              language={language} 
              location={profileData?.farm?.location || "Mandya, Karnataka"} 
              cropName={profileData?.crop?.crop_name || "Tomato"} 
              growthStage={profileData?.crop?.growth_stage || "Flowering"} 
            />
          )}
          {activeTab === "market" && (
            <MarketPrices 
              language={language} 
            />
          )}
          {activeTab === "schemes" && (
            <GovernmentSchemes 
              language={language} 
              userId={userId} 
            />
          )}
          {activeTab === "profile" && (
            <Profile 
              language={language} 
              setLanguage={(lang) => setLanguage(lang)} 
              userId={userId} 
              setFarmerName={setFarmerName}
              onUpdate={handleUpdate}
            />
          )}
        </main>

      </div>

      {/* Bottom Navigation Bar - Mobile devices only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-card/90 backdrop-blur-md py-1 px-2 flex justify-around md:hidden shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center rounded-xl p-2 text-xxs font-bold transition-all ${
                isActive 
                  ? "text-brand-500 scale-105" 
                  : "text-foreground/60 hover:text-brand-500"
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              {item.label.split(" ")[0]} {/* Shorten label for mobile bottom bar */}
            </button>
          );
        })}
        {/* profile shortcut on mobile as 6th option */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center rounded-xl p-2 text-xxs font-bold transition-all ${
            activeTab === "profile" 
              ? "text-brand-500 scale-105" 
              : "text-foreground/60 hover:text-brand-500"
          }`}
        >
          <Settings className="h-5 w-5 mb-0.5" />
          {t.profile.split(" ")[0]}
        </button>
      </nav>

    </div>
  );
}
