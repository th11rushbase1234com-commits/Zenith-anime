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
import { Zap, Mail, Lock, Loader2, Chrome } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/15 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <Card className="w-full max-w-md glass-panel relative z-10 border-white/5 rounded-[2.5rem] p-4 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-3xl bg-primary/20 border border-primary/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Zap className="w-10 h-10 text-primary fill-primary/30" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black italic tracking-tighter text-glow">
            ZENITH<span className="text-primary">ANIME</span>
          </CardTitle>
          <CardDescription className="text-white/60 font-medium italic">
            Sign in to access your personal collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 font-black italic rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isLogin ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0c0c0e] px-4 text-muted-foreground font-black tracking-widest">OR CONTINUE WITH</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 font-black italic rounded-2xl text-lg transition-all"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="w-5 h-5 mr-3" /> GOOGLE SIGN IN
          </Button>

          <div className="text-center pt-2">
            <button 
              type="button"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "New user? Create an account" : "Have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
