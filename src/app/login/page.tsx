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
import { Mail, Lock, Loader2, Chrome, User, Zap, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-8 font-body overflow-hidden relative">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center space-y-12 relative z-10">
        {/* Header Section (Zenith Branding) */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-8 cursor-default group">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]">
              <Home className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-glow flex items-center gap-1">
              <span className="text-primary">ZENITH</span>
              <span className="text-white">ANIME</span>
            </h1>
          </div>
          
          <div className="relative inline-block">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-glow">
              {isLogin ? 'WELCOME' : 'SIGN UP'}
            </h2>
            <span className="absolute -right-16 top-1 text-[10px] text-white/30 font-bold [writing-mode:vertical-rl] tracking-[0.2em] uppercase">
              {isLogin ? 'Auth Required' : 'Join Zenith'}
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
                placeholder="email address" 
                className="h-12 bg-white/5 border-white/10 rounded-full pl-14 pr-6 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-white/20 text-sm font-medium"
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
                className="h-12 bg-white/5 border-white/10 rounded-full pl-14 pr-6 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-white/20 text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isLogin && (
                <div className="flex justify-end pt-1">
                  <button type="button" className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-widest rounded-full uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'INITIALIZE LOGIN' : 'CREATE ACCOUNT')}
          </Button>
        </form>

        {/* Social Section */}
        <div className="w-full space-y-6">
          <div className="flex items-center gap-4 px-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">Sync With</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex justify-center">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full max-w-[200px] h-11 rounded-full border border-white/10 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-all group font-bold text-xs uppercase tracking-widest text-white/80"
            >
              <Chrome className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              Google Sync
            </button>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="text-center">
          <button 
            type="button"
            className="text-[11px] font-medium text-white/40 hover:text-white transition-colors group uppercase tracking-widest"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "New to the platform?" : "Already have an uplink?"} 
            <span className="text-primary font-bold ml-1.5 group-hover:underline underline-offset-4">
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </button>
        </div>
      </div>

      {/* Decorative Sidebar (Japanese Text) */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 space-y-4 opacity-5 pointer-events-none">
        <span className="[writing-mode:vertical-rl] text-4xl font-black tracking-[1em] text-white">
          ようこそ ゼンニス
        </span>
      </div>
    </div>
  );
}
