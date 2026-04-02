"use client";

import { useState } from "react";
import { signInAction } from "@/actions/auth";
import { OpenBrainLogo } from "@/components/openbrain-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("identifier", email);
    formData.append("password", password);

    const result = await signInAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative">
      {/* Theme Action Group */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Header Group */}
        <div className="flex flex-col items-center mb-8">
          <OpenBrainLogo />
          <h1 className="font-sans font-semibold text-2xl text-foreground mt-4 mb-1 tracking-tight">
            OpenBrain
          </h1>
          <p className="font-mono text-muted text-[10px] sm:text-[12px] tracking-widest uppercase">
            SYSTEM ACCESS PROTOCOL
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full bg-white dark:bg-transparent dark:border-transparent dark:shadow-none border border-border sm:shadow-[0_4px_0_rgba(0,0,0,0.1)] rounded-[2px] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Field 1: IDENTITY IDENTIFIER */}
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="identifier"
                className="font-mono text-[10px] sm:text-[12px] uppercase text-foreground leading-none"
              >
                IDENTITY IDENTIFIER
              </label>
              <input
                id="identifier"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Username"
                disabled={isLoading}
                className="w-full h-[40px] px-3 font-sans text-sm bg-transparent border border-border rounded-[2px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-70"
                required
              />
            </div>

            {/* Field 2: ACCESS KEY */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-end justify-between leading-none">
                <label 
                  htmlFor="password"
                  className="font-mono text-[10px] sm:text-[12px] uppercase text-foreground"
                >
                  ACCESS KEY
                </label>
                <Link 
                  href="/auth/forgot" 
                  className="font-mono text-[10px] sm:text-[12px] uppercase text-primary hover:opacity-80 transition-opacity"
                >
                  FORGOT PASSWORD?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full h-[40px] px-3 pr-10 font-sans text-sm bg-transparent border border-border rounded-[2px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-70 tracking-widest placeholder:tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[40px] mt-2 bg-primary text-white font-sans font-medium text-sm rounded-[2px] hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* Error Message Container */}
          {error && (
            <div className="mt-4 font-mono text-[12px] text-destructive text-center">
              {error}
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="mt-8 text-center text-[13px]">
          <span className="font-sans text-muted">No account? </span>
          <Link 
            href="/auth/register" 
            className="font-sans text-primary hover:opacity-80 transition-opacity"
          >
            Initialize New Brain
          </Link>
        </div>
      </div>
    </main>
  );
}