import { Share2, Trash2, ExternalLink, PlaySquare, FileText, MessageSquare, FileBox, Link as LinkIcon } from "lucide-react";
import { Thought } from "@/types";
import { cn } from "@/lib/utils";
import React from 'react';
import { Tweet } from 'react-tweet';

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  // Determine if it is a tweet based on the type
  const isTweet = thought.type?.toLowerCase() === "tweet" || thought.type?.toLowerCase() === "twitter";

  const getTweetId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const tweetId = isTweet ? getTweetId(thought.embed_url || thought.url) : null;
  
  const TypeIcon = (() => {
    switch (thought.type?.toLowerCase()) {
      case "video":
      case "youtube":
        return <PlaySquare className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "tweet":
      case "twitter":
        return <MessageSquare className="w-4 h-4" />;
      case "doc":
      case "document":
        return <FileBox className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  })();

  // The layout trick here is: break-inside-avoid w-full inline-block mb-6
  // This ensures CSS Masonry works perfectly without cutting off cards.

  const getYoutubeEmbed = (url?: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      return `https://www.youtube.com/embed/${parsed.pathname.split('/').pop()}`;
    } catch {
      return '';
    }
  };

  return (
    <div 
      className={cn(
        "break-inside-avoid w-full inline-block mb-6 bg-[#FAFAFA] dark:bg-[#18181B] rounded-[4px] border border-[#E4E4E7] dark:border-[#27272A] shadow-sm hover:shadow-md transition-shadow duration-150 overflow-hidden flex flex-col",
        isTweet && "border-l-2 border-l-[#6366F1]"
      )}
    >
      {/* Header */}
      <div className="px-4 h-10 flex items-center justify-between border-b border-[#E4E4E7]/50 dark:border-[#27272A]/50 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
          {/* Simple Type Icon based on type */}
          <div className="text-[#6366F1] shrink-0 flex items-center justify-center" title={thought.type || "Link"}>
            {TypeIcon}
          </div>
          <h3 className="font-sans font-medium text-sm text-[#18181B] dark:text-[#FAFAFA] truncate">
            {thought.title || thought.url || "Untitled Thought"}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button className="text-zinc-400 hover:text-[#6366F1] transition-colors" title="Share Thought">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button className="text-zinc-400 hover:text-[#EF4444] transition-colors" title="Delete Thought">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body / Media Embed */}
      <div className="w-full relative bg-white dark:bg-black/20 text-sm font-sans text-zinc-700 dark:text-zinc-300">
        {(thought.type?.toLowerCase() === "video" || thought.type?.toLowerCase() === "youtube") ? (
          <div className="aspect-video w-full bg-black">
            <iframe 
              width="560"
              height="315"
              src={thought.embed_url || getYoutubeEmbed(thought.url) || ""}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
        ) : thought.type === "image" ? (
          <div className="w-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thought.url} alt={thought.title} className="w-full object-cover" />
          </div>
        ) : isTweet && tweetId ? (
          <div className="w-full flex justify-center bg-white dark:bg-[#18181B] overflow-hidden">
            <div className="light sm:dark w-full">
              <Tweet id={tweetId} />
            </div>
          </div>
        ) : (
          <div className="p-4 leading-relaxed line-clamp-4 overflow-hidden">
             {thought.description || thought.url}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 h-10 flex items-center justify-between border-t border-[#E4E4E7] dark:border-[#27272A] shrink-0 bg-white/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 mr-4">
          {thought.tags?.map((tag, i) => (
            <span 
              key={i} 
              className="bg-[#9492DB]/20 text-[#7164c0] px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
        
        <a 
          href={thought.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-[#18181B] dark:hover:text-[#FAFAFA] transition-colors shrink-0"
          title="Open Original"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}