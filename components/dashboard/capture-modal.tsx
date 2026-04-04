"use client";

import { useState, useEffect } from "react";
import { Link2, X } from "lucide-react";

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, type: string, tags: string[]) => void;
}

export default function CaptureModal({ isOpen, onClose, onSubmit }: CaptureModalProps) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("Video");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setType("Video");
      setTagsInput("");
      setTags([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (e.metaKey && e.key === "Enter" && isOpen) {
        e.preventDefault();
        if (url) {
          handleSubmit(new Event("submit") as any);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, url, type, tags]);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(",")) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagsInput("");
    } else {
      setTagsInput(value);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Flush any remaining tag input
    let finalTags = [...tags];
    const currentInput = tagsInput.trim();
    if (currentInput && !finalTags.includes(currentInput)) {
      finalTags.push(currentInput);
    }

    onSubmit(url, type, finalTags);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-[480px] bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(124,58,237,0.15)] overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-[#E4E4E7] dark:border-[#27272A] flex justify-between items-center bg-transparent relative z-10">
          <div>
            <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider font-semibold block mb-1">
              NEW ENTRY
            </span>
            <h2 className="text-[20px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
              Add Thought
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-500 transition-colors p-1"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          {/* Source URL */}
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <label htmlFor="url" className="text-xs uppercase text-zinc-500 font-mono tracking-wider font-semibold">
                SOURCE URL <span className="text-indigo-500 float-right">REQUIRED</span>
              </label>
              <div className="relative">
                <input
                  id="url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors pl-2 pr-8"
                  autoFocus
                />
                <Link2 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-xs uppercase text-zinc-500 font-mono tracking-wider font-semibold">
                CONTENT TYPE
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors px-2 cursor-pointer appearance-none"
              >
                <option value="Video" className="bg-white dark:bg-zinc-900">Video</option>
                <option value="Article" className="bg-white dark:bg-zinc-900">Article</option>
                <option value="Tweet" className="bg-white dark:bg-zinc-900">Tweet</option>
                <option value="PDF" className="bg-white dark:bg-zinc-900">PDF</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-xs uppercase text-zinc-500 font-mono tracking-wider font-semibold">
                TAGS <span className="text-zinc-400 lowercase text-[10px] ml-1">(comma separated)</span>
              </label>
              <div className="min-h-[40px] border-b border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 transition-colors flex flex-wrap gap-2 py-2 px-2 items-center">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-[#9492DB] text-[#7164C0] px-2 py-0.5 rounded text-xs font-mono font-bold"
                  >
                    #{tag.toUpperCase()}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-white transition-colors ml-1 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  placeholder={tags.length === 0 ? "Add tag..." : ""}
                  className="bg-transparent flex-1 min-w-[120px] text-sm focus:outline-none p-0"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full h-[40px] bg-[#6366F1] hover:bg-indigo-600 active:transform active:scale-[0.99] text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 rounded"
            >
              Submit Thought
            </button>
          </div>
          
          <div className="text-center pt-2">
            <span className="text-[10px] text-zinc-500 font-mono">
              Press <kbd className="font-sans px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">⌘</kbd> + <kbd className="font-sans px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">Enter</kbd> to quick save
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
