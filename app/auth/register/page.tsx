'use client';

import { useState, useCallback, useRef, useTransition, useActionState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, CheckSquare, Square, Check } from 'lucide-react';
import { OpenBrainLogo } from '@/components/openbrain-logo';
import { ThemeToggle } from '@/components/theme-toggle';

import { signUpAction } from '@/actions/auth';
import {
  EMAIL_REGEX,
  USERNAME_REGEX,
  PASSWORD_MIN_LENGTH_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_CHAR_REGEX
} from '@/lib/validations';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const isValidEmail = email.length > 0 && EMAIL_REGEX.test(email);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameStatus('idle');

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!val) return;

    if (!USERNAME_REGEX.test(val)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(val)}`);
        const data = await res.json();
        
        if (data.error) {
          setUsernameStatus('unavailable');
        } else if (data.available) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('unavailable');
        }
      } catch (err) {
        setUsernameStatus('unavailable');
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!email || !username || !password || !termsAccepted) {
      setServerError('Please fulfill all identity requirements.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);

    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setServerSuccess(result.success);
      }
    });
  };

  const isMinLength = PASSWORD_MIN_LENGTH_REGEX.test(password);
  const hasNumber = PASSWORD_NUMBER_REGEX.test(password);
  const hasSpecial = PASSWORD_SPECIAL_CHAR_REGEX.test(password);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Header Group */}
      <div className="flex flex-col items-center mb-8">
        <OpenBrainLogo className="mb-4" />
        <h1 className="font-sans font-[600] text-[24px] tracking-tight text-foreground">
          OpenBrain
        </h1>
        <h2 className="font-mono text-[12px] uppercase tracking-widest text-[#A1A1AA] mt-1">
          INITIALIZE CONNECTION
        </h2>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-[400px] bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] p-8 pb-10">
        
        {serverError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-mono">
            {serverError}
          </div>
        )}
        
        {serverSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] text-[12px] font-mono">
            {serverSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Field 1: EMAIL IDENTITY */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[12px] font-mono uppercase">
              <label htmlFor="email" className="text-foreground">EMAIL IDENTITY</label>
              {isValidEmail && (
                <span className="flex items-center text-[#10B981]">
                  Valid email <Check className="w-3 h-3 ml-1" />
                </span>
              )}
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ARCHITECT@OPENBRAIN.IO"
              className="h-[40px] px-3 bg-transparent border border-[#E4E4E7] dark:border-[#27272A] text-[14px] font-mono rounded-[2px] focus:outline-none focus:border-[#6366F1] dark:focus:border-[#6366F1] transition-colors placeholder:text-[#A1A1AA]"
              required
            />
          </div>

          {/* Field 2: NEURAL ALIAS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[12px] font-mono uppercase">
              <label htmlFor="username" className="text-foreground">NEURAL ALIAS</label>
              {usernameStatus === 'available' && (
                <span className="flex items-center text-[#10B981]">
                  Available <Check className="w-3 h-3 ml-1" />
                </span>
              )}
              {usernameStatus === 'unavailable' && (
                <span className="text-red-500">Unavailable</span>
              )}
              {usernameStatus === 'invalid' && (
                <span className="text-red-500">Invalid format</span>
              )}
              {usernameStatus === 'checking' && (
                <span className="text-[#A1A1AA]">Verifying...</span>
              )}
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="NEURAL_NODE_01"
              maxLength={20}
              className="h-[40px] px-3 bg-transparent border border-[#E4E4E7] dark:border-[#27272A] text-[14px] font-mono rounded-[2px] focus:outline-none focus:border-[#6366F1] dark:focus:border-[#6366F1] transition-colors placeholder:text-[#A1A1AA]"
              required
            />
          </div>

          {/* Field 3: ACCESS KEY */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] sm:text-[12px] font-mono uppercase">
              <label htmlFor="password" className="text-foreground">ACCESS KEY</label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[40px] pl-3 pr-10 bg-transparent border border-[#E4E4E7] dark:border-[#27272A] text-[14px] font-mono rounded-[2px] focus:outline-none focus:border-[#6366F1] dark:focus:border-[#6366F1] transition-colors placeholder:text-[#A1A1AA]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[10px] text-[#A1A1AA] hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Checklist */}
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 mt-2 text-[10px] font-mono">
              <span className={`flex items-center gap-1 ${isMinLength ? 'text-[#10B981]' : 'text-zinc-500'}`}>
                {isMinLength ? <Check className="w-3 h-3" /> : <div className="w-3" />}
                8+ CHARS
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-[#10B981]' : 'text-zinc-500'}`}>
                {hasNumber ? <Check className="w-3 h-3" /> : <div className="w-3" />}
                1 NUMBER
              </span>
              <span className={`flex items-center gap-1 ${hasSpecial ? 'text-[#10B981]' : 'text-zinc-500'}`}>
                {hasSpecial ? <Check className="w-3 h-3" /> : <div className="w-3" />}
                1 SPECIAL
              </span>
            </div>
          </div>

          {/* Terms & Submit Action */}
          <div className="mt-4 flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="flex items-start gap-3 group text-left"
            >
              <div className="mt-[2px] text-[#A1A1AA] group-hover:text-foreground transition-colors">
                {termsAccepted ? (
                  <CheckSquare className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </div>
              <span className="font-sans text-[12px] text-[#A1A1AA] group-hover:text-foreground transition-colors leading-snug">
                I accept the Neural Protocol and Privacy Logic governing this node.
              </span>
            </button>

            <button
              type="submit"
              disabled={isPending || !termsAccepted || !isValidEmail || usernameStatus !== 'available' || !isMinLength || !hasNumber || !hasSpecial}
              className="w-full h-[40px] bg-[#6366F1] text-white font-sans font-[500] text-[14px] rounded-[2px] hover:opacity-90 active:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? 'ESTABLISHING...' : 'ESTABLISH CONNECTION'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[13px]">
        <span className="font-sans text-muted">Existing entity? </span>
        <Link 
          href="/auth/signin" 
          className="font-sans text-primary hover:opacity-80 transition-opacity"
        >
          Sign in to Brain
        </Link>
      </div>
    </main>
  );
}