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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Mail, Lock, Loader2, Chrome, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex bg-[#060608] relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[150px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Side Illustration - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image 
          src="https://picsum.photos/seed/zenith-login/1200/1600" 
          alt="Zenith Illustration" 
          fill 
          className="object-cover brightness-50 contrast-125"
          priority
          data-ai-hint="cyberpunk anime"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#060608]" />
        
        <div className="absolute bottom-20 left-20 z-10 space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            <Zap className="w-3 h-3 fill-current" /> System Protocol Active
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white leading-[0.9]">
            ASCEND TO THE <span className="text-primary text-glow">ZENITH</span>
          </h1>
          <p className="text-white/60 text-lg font-medium italic">
            Join the elite network of anime enthusiasts. Track, discover, and master your collection.
          </p>
        </div>
      </div>

      {/* Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <Card className="w-full max-w-md bg-transparent border-none shadow-none">
          <CardHeader className="space-y-6 text-center lg:text-left p-0 mb-10">
            <div className="flex justify-center lg:justify-start">
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Zap className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter text-glow flex items-center gap-1">
                  <span className="text-primary">ZENITH</span>
                  <span className="text-white">ANIME</span>
                </h2>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">
                {isLogin ? 'LOGIN' : 'SIGN UP'}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium italic text-base">
                {isLogin ? 'Enter your credentials to re-sync with the archive.' : 'Initialize your record in the Zenith database.'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 space-y-8">
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="E-MAIL ADDRESS" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary/50 transition-all font-bold tracking-tight text-white placeholder:text-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="PASSWORD" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary/50 transition-all font-bold tracking-tight text-white placeholder:text-white/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 font-black italic rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] active:scale-95 group"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (
                  <span className="flex items-center gap-2 uppercase">
                    {isLogin ? 'AUTHENTICATE' : 'INITIALIZE'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#060608] px-4 text-muted-foreground font-black tracking-[0.3em]">SOCIAL SYNC</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 font-black italic rounded-2xl text-base transition-all gap-3"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="w-5 h-5 text-primary" /> GOOGLE IDENTITY
              </Button>
            </div>

            <div className="text-center pt-4">
              <button 
                type="button"
                className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "New user?" : "Existing operative?"} 
                <span className="text-primary underline underline-offset-4">{isLogin ? "Create account" : "Sign in"}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
