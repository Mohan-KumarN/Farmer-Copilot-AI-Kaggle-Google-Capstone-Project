"use client";

import React, { useState, useRef } from "react";
import { Language, translations } from "../lib/translations";
import { Upload, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react";

interface DiseaseScannerProps {
  language: Language;
  userId: number;
  cropContext?: string;
}

interface DiagnosisResult {
  crop: string;
  prediction: string;
  confidence: number;
  explanation: string;
  solution: string;
}

export default function DiseaseScanner({ language, userId, cropContext = "Tomato" }: DiseaseScannerProps) {
  const t = translations[language];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("user_id", userId.toString());
    formData.append("crop_context", cropContext);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/api/disease-detection", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Diagnosis request failed");

      const data = await res.json();
      setResult(data.diagnosis);
    } catch (err: any) {
      console.error(err);
      setError("Failed to run diagnosis. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      {/* Introduction */}
      <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-600 dark:text-brand-500 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" /> Crop Disease Diagnostic Scanner
        </h2>
        <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
          Upload a clear photograph of infected crop leaves or stems. Our AI will analyze the visual symptoms and identify the potential pathogen along with chemical and organic treatments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Column */}
        <div className="space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
              previewUrl 
                ? "border-[var(--border)] bg-card" 
                : "border-brand-500/30 hover:border-brand-500 bg-card hover:bg-brand-500/5 cursor-pointer"
            }`}
            onClick={previewUrl ? undefined : triggerSelect}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-4 w-full">
                <img 
                  src={previewUrl} 
                  alt="Uploaded leaf preview" 
                  className="mx-auto max-h-64 rounded-2xl object-cover shadow-md"
                />
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={triggerSelect}
                    className="rounded-xl border border-[var(--border)] bg-background px-4 py-2 text-xs font-semibold hover:bg-[var(--border)]/20 transition"
                  >
                    Change Image
                  </button>
                  <button 
                    onClick={resetScanner}
                    className="rounded-xl border border-red-200 text-red-500 bg-background px-4 py-2 text-xs font-semibold hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-700/10 text-brand-500">
                  <Upload className="h-8 w-8 animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-bold">Drag and drop leaf image here</p>
                  <p className="text-xs text-foreground/50 mt-1">or click to browse from device</p>
                </div>
                <div className="text-xxs text-foreground/40 uppercase font-semibold">
                  Supports JPEG, PNG • Max size 5MB
                </div>
              </div>
            )}
          </div>

          {previewUrl && !result && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" /> Diagnosing Plant...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Run AI Diagnosis
                </>
              )}
            </button>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/20 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          {result ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <p className="text-xs text-foreground/50 font-bold uppercase">Crop Context: {result.crop}</p>
                  <h3 className="text-xl font-bold text-rose-500 mt-1">{result.prediction}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xxs text-foreground/50 font-bold uppercase">Confidence</p>
                  <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Confidence progress bar */}
              <div className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden">
                <div 
                  className="h-full bg-brand-500 transition-all duration-1000"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Diagnostic Summary</h4>
                  <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{result.explanation}</p>
                </div>

                <div className="border-t border-[var(--border)] pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-soil-500">Treatment Plan & Dosages</h4>
                  <div 
                    className="mt-2 text-sm text-foreground/85 leading-relaxed whitespace-pre-line prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: result.solution.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                </div>
              </div>

              <button 
                onClick={resetScanner}
                className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] py-2 text-xs font-bold hover:bg-[var(--border)]/20 transition-all text-brand-600 dark:text-brand-400"
              >
                Scan Another Leaf
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-foreground/40 h-full">
              <ShieldCheck className="h-16 w-16 mb-4 stroke-1" />
              <p className="text-sm font-semibold">Diagnosis Pending</p>
              <p className="text-xs mt-1 max-w-[200px]">Upload an image and run the scanner to see agricultural guidance.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
