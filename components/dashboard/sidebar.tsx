"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');
  const [tags, setTags] = useState<string[]>([]);
  
  useEffect(() => {
    // For MVP, we fetch tags using our server action in the background
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
    { label: 'Docs', id: 'doc', icon: <FileBox className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col py-6 px-4 shrink-0">
        <Link href="/dashboard" className="px-2 mb-8">
          <OpenBrainLogo className="h-8 w-auto text-zinc-900 dark:text-zinc-50" />
        </Link>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">
            Types
          </div>
          <nav className="space-y-1 mb-8">
            {types.map((t) => (
              <Link
                key={t.id}
                href={`/dashboard?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), type: t.id }).toString()}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                  currentType === t.id 
                    ? "bg-indigo-500/10 text-indigo-500 ring-1 ring-inset ring-indigo-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                )}
              >
                {t.icon}
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">
            Tags
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {tags.map((tag) => (
              <Link 
                key={tag}
                href={`/dashboard?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), tag: tag.replace('#', '') }).toString()}`}
                className={cn(
                  "px-2.5 py-1 text-xs rounded font-mono transition-colors border border-transparent",
                  searchParams.get('tag') === tag.replace('#', '')
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500 ring-1 ring-inset ring-indigo-500/20 rounded-xl"
                    : "bg-[#9492DB]/20 text-[#7164c0] hover:bg-[#9492DB]/30"
                )}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-500 text-white shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-transform active:scale-95 z-50 focus:outline-none">
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}