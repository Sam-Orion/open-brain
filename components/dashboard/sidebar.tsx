"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { 
  PlaySquare, 
  FileText, 
  MessageSquare, 
  FileBox, 
  Settings, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { OpenBrainLogo } from '@/components/openbrain-logo';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getSidebarTags } from '@/actions/getSidebarTags';
import { parseSearchQuery } from '@/lib/search-parser';

export default function Sidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Sync directly with the Master Search Query 'q'
  const q = searchParams.get('q') || '';
  const parsed = parseSearchQuery(q);
  const currentType = parsed.type;
  const selectedTags = parsed.tags;
  
  const [tags, setTags] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadTags() {
      const dbTags = await getSidebarTags();
      setTags(dbTags);
    }
    loadTags();
  }, []);

  const types = [
    { label: 'YouTube', id: 'youtube', icon: <PlaySquare className="w-4 h-4" /> },
    { label: 'Articles', id: 'article', icon: <FileText className="w-4 h-4" /> },
    { label: 'Twitter', id: 'twitter', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'PDF', id: 'pdf', icon: <FileBox className="w-4 h-4" /> },
  ];

  // 2. Master builder for robust parameter replacement
  const handleTypeClick = (typeId: string) => {
    const parts = [];
    if (parsed.cleanedQuery) parts.push(parsed.cleanedQuery);
    
    // Toggle type -> Either attach the new one, or omit it completely to disable
    if (currentType !== typeId) parts.push(`>${typeId}`);
    
    // Stitch all existing active tags back into the line
    selectedTags.forEach(tag => parts.push(`/${tag}`));
    
    const newQuery = parts.join(' ').trim();
    
    // 3. Clear orphaned '?type=' parameters and execute
    router.push(newQuery ? `/dashboard?q=${encodeURIComponent(newQuery)}` : '/dashboard');
  };

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    const parts = [];
    if (parsed.cleanedQuery) parts.push(parsed.cleanedQuery);
    if (currentType) parts.push(`>${currentType}`);
    
    // Toggle tags -> Skip it if it already exists, otherwise add the clicked one
    selectedTags.forEach(t => {
      if (t !== cleanTag) parts.push(`/${t}`);
    });

    if (!selectedTags.includes(cleanTag)) {
      parts.push(`/${cleanTag}`);
    }
    
    const newQuery = parts.join(' ').trim();
    router.push(newQuery ? `/dashboard?q=${encodeURIComponent(newQuery)}` : '/dashboard');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col py-6 px-4 shrink-0">
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-2 mb-8 hover:opacity-80 transition-opacity flex items-center justify-center focus:outline-none focus:ring-0 cursor-pointer bg-transparent border-none p-0"
        >
          <OpenBrainLogo className="h-8 w-auto text-zinc-900 dark:text-zinc-50 shrink-0" />
        </button>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">
            Types
          </div>
          <nav className="space-y-1 mb-8">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeClick(t.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors w-full text-left cursor-pointer border-none bg-transparent",
                  currentType === t.id 
                    ? "bg-indigo-500/10 text-indigo-500 ring-1 ring-inset ring-indigo-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">
            Tags
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {tags.map((tag) => (
              <button 
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full font-mono transition-colors border border-transparent cursor-pointer",
                  selectedTags.includes(tag.replace('#', ''))
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500 ring-1 ring-inset ring-indigo-500/20"
                    : "bg-[#9492DB]/20 text-[#7164c0] hover:bg-[#9492DB]/30"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-left cursor-pointer border-none bg-transparent">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-left cursor-pointer border-none bg-transparent">
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-500 text-white shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-transform active:scale-95 z-50 focus:outline-none cursor-pointer border-none">
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}
