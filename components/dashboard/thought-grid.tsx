"use client";

import { useState, useEffect } from "react";
import { Thought } from "@/types";
import { ThoughtCard } from "@/components/dashboard/thought-card";

interface ThoughtGridProps {
  initialThoughts: Thought[];
  q?: string;
  tag?: string;
  type?: string;
}

export function ThoughtGrid({ initialThoughts, q, tag, type }: ThoughtGridProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);

  useEffect(() => {
    setThoughts(initialThoughts);
  }, [initialThoughts]);

  useEffect(() => {
    const handleAddThought = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { url, type: contentType, tags } = customEvent.detail;
      
      const tempId = `temp-${Date.now()}`;
      const optimisticThought: Thought = {
        id: tempId,
        url,
        type: contentType,
        tags,
        title: "Adding...",
        description: "",
        status: "processing",
        supermemory_status: "extracting",
      };

      setThoughts((prev) => [optimisticThought, ...prev]);

      try {
        const response = await fetch("/api/thoughts/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, type: contentType, manualTags: tags }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to process thought");
        }

        // It could be processing or done or failed
        setThoughts((prev) =>
          prev.map((t) => (t.id === tempId ? { ...data } : t))
        );

        // If returned status is still processing, we need to poll
        if (data.status === "processing") {
          let currentStatus = "processing";
          let currentData = data;
          
          const intervalId = setInterval(async () => {
            try {
              const res = await fetch(`/api/thoughts/${currentData.id}`);
              if (res.ok) {
                const refreshed = await res.json();
                setThoughts((prev) =>
                  prev.map((t) => (t.id === currentData.id ? { ...refreshed } : t))
                );
                if (refreshed.status === "done" || refreshed.status === "failed") {
                  clearInterval(intervalId);
                }
              }
            } catch (pollErr) {
              console.error("Polling error", pollErr);
            }
          }, 5000);
        }

      } catch (err: any) {
        // Update the optimistic thought to failed state
        setThoughts((prev) =>
          prev.map((t) =>
            t.id === tempId
              ? { ...t, status: "failed", supermemory_status: err.message, title: "Failed" }
              : t
          )
        );
      }
    };

    window.addEventListener("addThoughtSubmit", handleAddThought);
    return () => window.removeEventListener("addThoughtSubmit", handleAddThought);
  }, []);

  // Derive dynamic title based on filters
  let title = "My Cognitive Archive";
  let status = `SYNCHRONIZED / ${thoughts.length} ACTIVE CONNECTIONS`;

  if (q && type && tag) {
        title = `Search: ${q} in ${type} tagged ${tag}`;
        status = `${thoughts.length} MATCHES FOUND`;
  } else if (q) {
        title = `Search: ${q}`;
        status = `${thoughts.length} MATCHES FOUND`;
  } else if (type && tag) {
        title = `${type.toUpperCase()}s - #${tag}`;
        status = `${thoughts.length} ITEMS`;
  } else if (type) {
        title = `Collected ${type}s`;
        status = `${thoughts.length} ITEMS`;
  } else if (tag) {
        title = `Tag Archive: #${tag}`;
        status = `${thoughts.length} ITEMS`;
  }

  return (
    <div className="w-full h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Page Header */}
      <header className="space-y-1.5 transition-all">
        <h1 className="text-2xl font-sans font-semibold tracking-tight text-[#18181B] dark:text-[#FAFAFA]">
          {title}
        </h1>
        <p className="text-xs font-mono text-[#A1A1AA] uppercase tracking-[0.15em]">
          SYSTEM STATUS: {status}
        </p>
      </header>

      {/* Masonry Layout Container */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {thoughts.length > 0 ? (
          thoughts.map((thought) => (
            <ThoughtCard key={thought.id} thought={thought} />
          ))
        ) : (
          <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-[#E4E4E7] dark:border-[#27272A] rounded-xl">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-[#18181B] dark:text-[#FAFAFA]">No Thoughts Found</h3>
              <p className="text-xs text-[#A1A1AA] font-mono">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}