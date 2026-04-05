"use client";

import { useState, useEffect } from "react";
import { X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalShareModal({ isOpen, onClose }: GlobalShareModalProps) {
  const [entityType, setEntityType] = useState<"brain" | "tag">("brain");
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [cachedBrainUrl, setCachedBrainUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEntityType("brain");
      setTagInput("");
      setError("");
      setCopied(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (entityType === "tag" && !tagInput.trim()) {
      setError("Please enter a tag");
      return;
    }
    
    if (entityType === "brain" && cachedBrainUrl) {
      setGeneratedUrl(cachedBrainUrl);
      setStep(2);
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/share/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId: entityType === "tag" ? tagInput.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate link");
      }

      const url = `${window.location.origin}/share/${data.token}`;
      if (entityType === "brain") {
        setCachedBrainUrl(url);
      }
      setGeneratedUrl(url);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const resetAndClose = () => {
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        resetAndClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && step === 1) {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step, entityType, tagInput]); // Re-bind so handleGenerate has latest state

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={resetAndClose}
      />
      
      <div className="relative w-[400px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[20px] font-semibold font-sans tracking-tight text-zinc-900 dark:text-zinc-50">
                Share Brain
              </h2>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mt-1">
                COGNITIVE ARCHIVE ACCESS
              </p>
            </div>
            <button 
              onClick={resetAndClose}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                <button
                  onClick={() => setEntityType("brain")}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    entityType === "brain" 
                      ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" 
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  Entire Archive
                </button>
                <button
                  onClick={() => setEntityType("tag")}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    entityType === "tag" 
                      ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" 
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  Specific Tag
                </button>
              </div>

              {entityType === "tag" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag (e.g. neuroscience)"
                    className="w-full h-10 px-3 font-mono text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full h-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-sm rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Link"}
              </button>
              
              <div className="text-center text-xs text-zinc-500 font-mono mt-4">
                Press <kbd className="font-sans px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">⌘</kbd> + <kbd className="font-sans px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">Enter</kbd> to generate link
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative">
                <input
                  readOnly
                  value={generatedUrl}
                  className="w-full h-10 pl-3 pr-24 font-mono text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded transition-colors flex items-center justify-center min-w-[70px]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-zinc-500 text-center">
                This link provides read-only access to your selected thoughts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}