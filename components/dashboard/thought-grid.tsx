import { Thought } from "@/types";
import { ThoughtCard } from "@/components/dashboard/thought-card";

interface ThoughtGridProps {
  initialThoughts: Thought[];
  q?: string;
  tag?: string;
  type?: string;
}

export function ThoughtGrid({ initialThoughts, q, tag, type }: ThoughtGridProps) {

  // Currently we use initialThoughts since server rendering passes this in.
  // Real implementation for instant Client-side Search SWR:
  // const { data: thoughts } = useSWR(`/api/thoughts/search?q=${q}&type=${type}`, fetcher, { fallbackData: initialThoughts })
  const thoughts = initialThoughts;

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