import { redirect } from "next/navigation";
import { ThoughtCard } from "@/components/dashboard/thought-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { OpenBrainLogo } from "@/components/openbrain-logo";
import Link from "next/link";
import { Search } from "lucide-react";

async function getSharedData(token: string) {
  // Determine absolute base URL for server-side fetching
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "localhost:3000";
    
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/share/retrieve?token=${token}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch shared data:", error);
    return null;
  }
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getSharedData(token);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] font-sans">
        <h1 className="font-mono text-zinc-500 uppercase tracking-widest text-lg mb-6">
          Connection Severed
        </h1>
        <Link
          href="/"
          className="px-4 py-2 border border-[#E4E4E7] dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-[#18181B] dark:text-[#FAFAFA] text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          Return to OpenBrain
        </Link>
      </div>
    );
  }

  const { entity_type, thoughts } = data;
  const isGrid = entity_type === "brain" || entity_type === "tag";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#09090B] font-sans text-[#18181B] dark:text-[#FAFAFA]">
      {/* Shared Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA]/80 dark:bg-[#18181B]/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 w-1/3 md:w-1/4 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <OpenBrainLogo className="!w-10 !h-10 !mb-0" />
            <span className="font-sans font-bold tracking-tight text-xl">
              OpenBrain
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3 md:w-1/4 shrink-0 ml-auto">
          <ThemeToggle />
          <Link
            href="/auth/signin"
            className="text-sm font-medium border border-[#E4E4E7] dark:border-[#27272A] px-3 py-1.5 rounded-[4px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] px-3 py-1.5 rounded-[4px] hover:opacity-90 transition-opacity"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 flex flex-col w-full px-6 pb-20 mt-8">
        {isGrid ? (
          <div className="w-full max-w-7xl mx-auto">
            {/* Grid Header */}
            <div className="mb-8 pl-4">
              <h1 className="text-3xl font-semibold mb-2">
                {entity_type === "brain" ? "Public Archive" : `Collection: #${data.entity_id || "tag"}`}
              </h1>
              <p className="text-zinc-500 font-mono text-sm">
                A curated collection of thoughts and insights.
              </p>
            </div>

            {/* Masonry Grid */}
            {thoughts.length === 0 ? (
              <div className="text-center text-zinc-500 mt-20">
                No thoughts found in this collection.
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 max-w-[2000px] mx-auto w-full pb-4">
                {thoughts.map((thought: any) => (
                  <ThoughtCard
                    key={thought.id}
                    thought={thought}
                    isReadOnly={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Focused Single Thought View */
          <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-128px)]">
            <div className="w-full max-w-3xl">
              {thoughts[0] ? (
                <ThoughtCard
                  thought={thoughts[0]}
                  isReadOnly={true}
                  size="large"
                />
              ) : (
                <div className="text-center text-zinc-500">
                  Thought not found.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <footer className="py-8 text-center flex items-center justify-center border-t border-transparent">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          POWERED BY <strong className="font-bold">OpenBrain</strong>
        </span>
      </footer>
    </div>
  );
}
