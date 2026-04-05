"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Share, Plus, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header({ user }: { user: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with URL when it changes
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  // Helper to parse >type and /tag visually into spans.
  const renderVisualText = (text: string) => {
    if (!text) {
      return (
        <span className="text-zinc-400 dark:text-zinc-500">
          Search thoughts, use &gt;type or /tag...
        </span>
      );
    }
    
    const parts = text.split(/(>[\w-]+|\/[\w-]+)/g);
    return parts.map((part, i) => {
      // Regex purely for syntax highlighting visualization
      if (part.match(/^>[A-Za-z0-9_-]+$/)) {
        return (
          <span 
            key={i} 
            className="relative inline-block z-10 text-[#7164c0]"
          >
            <span className="absolute inset-y-[-2px] inset-x-0 bg-[#9492DB]/20 rounded -z-10" />
            {part}
          </span>
        );
      }
      if (part.match(/^\/[A-Za-z0-9_-]+$/)) {
        return (
          <span 
            key={i} 
            className="relative inline-block z-10 text-indigo-500"
          >
            <span className="absolute inset-y-[-2px] inset-x-0 bg-indigo-500/10 rounded -z-10" />
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 flex justify-center">
        <form 
          onSubmit={handleSubmit}
          className={cn(
            "relative w-full max-w-[480px] h-10 transition-all rounded-full flex items-center group",
            isFocused 
              ? "ring-2 ring-indigo-500 bg-white dark:bg-zinc-900" 
              : "ring-1 ring-zinc-200 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800"
          )}
        >
          <Search className="w-4 h-4 text-zinc-400 ml-3 shrink-0" />
          
          <div className="relative flex-1 h-full mx-2 overflow-hidden">
            {/* Ghost input - absolute identical rendering element */}
            <div 
              className="pointer-events-none absolute inset-0 flex items-center whitespace-pre overflow-hidden text-sm font-mono tracking-normal p-0 m-0 text-zinc-900 dark:text-zinc-100"
              style={{ wordSpacing: "4px" }}
              aria-hidden="true"
            >
              {renderVisualText(query)}
            </div>
            
            {/* Real input - transparent */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-indigo-500 flex items-center focus:outline-none focus:ring-0 outline-none border-none p-0 m-0 text-sm font-mono tracking-normal placeholder-transparent"
              style={{ wordSpacing: "4px" }}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="mr-3 shrink-0 text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800">
            ⌘K
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openGlobalShareModal'))}
          className="hidden sm:flex items-center gap-2 h-9 px-3 text-sm font-medium border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
        >
          <Share className="w-4 h-4" />
          Share Brain
        </button>
        
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openCaptureModal'))}
          className="hidden sm:flex items-center gap-2 h-9 px-4 text-sm font-medium bg-zinc-900 text-zinc-50 dark:bg-indigo-500 dark:text-white rounded-md hover:bg-zinc-800 dark:hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Thought
        </button>

        <ThemeToggle />

        <button className="h-8 w-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          {user?.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}