import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { OpenBrainLogo } from '@/components/openbrain-logo';
import { InteractiveGridBg } from '@/components/interactive-grid-bg';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background transition-colors duration-500 ease-in-out px-6 relative overflow-hidden">
      
      <InteractiveGridBg />

      {/* Theme Action Group */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center text-center relative z-10">
        
        <OpenBrainLogo />

        {/* Hero Title */}
        <h1 className="text-[48px] font-[600] leading-tight text-foreground tracking-tight">
          OpenBrain
        </h1>
        
        {/* Subtitle */}
        <p className="mt-4 text-[16px] font-[400] text-muted">
          A minimal repository for the digital mind.
        </p>

        {/* Actions Container */}
        <div className="mt-10 mx-auto flex w-full max-w-[320px] items-center justify-center gap-4">
          
          {/* Create Account Button (Primary Inverted) */}
          <Link 
            href="/auth/register"
            className="flex h-[40px] flex-1 items-center justify-center bg-foreground text-background font-medium text-[14px] transition-colors duration-150 ease-linear hover:opacity-90 active:opacity-100 rounded-none border border-foreground"
          >
            Create Account
          </Link>
          
          {/* Sign In Button (Secondary Outlined) */}
          <Link 
            href="/auth/signin"
            className="flex h-[40px] flex-1 items-center justify-center border border-border bg-transparent text-foreground font-medium text-[14px] transition-colors duration-150 ease-linear hover:bg-surface active:bg-transparent rounded-none"
          >
            Sign In
          </Link>

        </div>
      </div>
    </main>
  );
}
