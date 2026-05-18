'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Mail, Lock, Loader2, Chrome, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Auth Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F3F3F3] flex items-center justify-center p-4 md:p-8 font-body overflow-hidden relative">
      {/* Background Anime Stickers (Decorative) */}
      <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 md:w-64 md:h-64 opacity-60 z-0">
        <Image 
          src="https://picsum.photos/seed/anime-sticker-1/400/400" 
          alt="decoration" 
          width={400} 
          height={400} 
          className="object-contain"
          data-ai-hint="anime character sticker"
        />
        <div className="absolute top-0 right-0 h-full flex items-center">
          <span className="[writing-mode:vertical-rl] text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] rotate-180">
            こんにちは
          </span>
        </div>
      </div>

      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 md:w-48 md:h-48 opacity-20 z-0 rotate-12">
        <Image 
          src="https://picsum.photos/seed/anime-sticker-2/300/300" 
          alt="decoration" 
          width={300} 
          height={300} 
          className="object-contain"
          data-ai-hint="anime graphic"
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center space-y-12 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="w-5 h-5 text-[#FFB7B7] fill-current" />
            <h1 className="text-xl font-bold tracking-[0.3em] text-[#FFB7B7] uppercase">ZENITH</h1>
          </div>
          
          <div className="relative inline-block">
            <h2 className="text-3xl font-bold tracking-widest uppercase">
              {isLogin ? 'WELCOME' : 'SIGN UP'}
            </h2>
            <span className="absolute -right-16 top-1 text-[10px] text-white/30 font-bold [writing-mode:vertical-rl] tracking-[0.2em]">
              {isLogin ? 'どういたしまして' : 'サインアップ'}
            </span>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleAuth} className="w-full space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input 
                type="email" 
                placeholder="email" 
                className="h-12 bg-transparent border-white/20 rounded-full pl-14 pr-6 focus:border-[#FFB7B7] focus:ring-1 focus:ring-[#FFB7B7]/30 transition-all placeholder:text-white/20 text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input 
                type="password" 
                placeholder="password" 
                className="h-12 bg-transparent border-white/20 rounded-full pl-14 pr-6 focus:border-[#FFB7B7] focus:ring-1 focus:ring-[#FFB7B7]/30 transition-all placeholder:text-white/20 text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isLogin && (
                <div className="flex justify-end pt-1">
                  <button type="button" className="text-[10px] font-bold text-[#FFB7B7]/60 hover:text-[#FFB7B7] transition-colors">
                    forget password?
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-[#FFB7B7] hover:bg-[#FFB7B7]/90 text-black font-black tracking-widest rounded-full uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(255,183,183,0.3)]"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'LOG IN' : 'SIGN UP')}
          </Button>
        </form>

        {/* Social Section */}
        <div className="w-full space-y-6">
          <div className="flex items-center gap-4 px-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-black text-white/30 tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex justify-center gap-6">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group"
            >
              <Chrome className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </button>
            <button type="button" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group">
              <span className="text-white/60 group-hover:text-white font-black text-xs">f</span>
            </button>
            <button type="button" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group">
              <span className="text-white/60 group-hover:text-white font-black text-xs">𝕏</span>
            </button>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="text-center">
          <button 
            type="button"
            className="text-[11px] font-medium text-white/40 hover:text-white transition-colors group"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <span className="text-[#FFB7B7] font-bold ml-1.5 group-hover:underline underline-offset-4">
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </button>
        </div>
      </div>

      {/* Side Japanese Decoration (Desktop Only) */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 space-y-4 opacity-10">
        <span className="[writing-mode:vertical-rl] text-4xl font-black tracking-[1em]">
          あなたを失いたくない
        </span>
      </div>
    </div>
  );
}
