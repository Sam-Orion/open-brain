"use client";

import { useState, useEffect } from "react";
import { X, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThoughtShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  thoughtId: string;
}

export function ThoughtShareModal({ isOpen, onClose, thoughtId }: ThoughtShareModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && !generatedUrl && !error) {
      generateLink();
    }
  }, [isOpen]);

  const generateLink = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/share/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "thought",
          entityId: thoughtId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate link");
      }

      setGeneratedUrl(`${window.location.origin}/share/${data.token}`);
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
      if (e.key === "Escape" && isOpen) {
        resetAndClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
                Share Thought
              </h2>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mt-1">
                ISOLATED NODE ACCESS
              </p>
            </div>
            <button 
              onClick={resetAndClose}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
              <p className="text-sm text-zinc-500 font-mono animate-pulse">
                Generating secure link...
              </p>
            </div>
          ) : error ? (
            <div className="py-4 text-center space-y-4">
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={generateLink}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-sm font-medium rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative relative flex items-center">
                <input
                  readOnly
                  value={generatedUrl}
                  className="w-full h-10 pl-3 pr-24 font-mono text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={cn(
                    "absolute right-1 top-1 bottom-1 px-3 text-white text-xs font-medium rounded transition-colors flex items-center justify-center min-w-[70px]",
                    copied ? "bg-[#10B981] hover:bg-[#059669]" : "bg-[#6366F1] hover:bg-[#4F46E5]"
                  )}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-zinc-500 text-center">
                Anyone with this link can view this specific thought.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}