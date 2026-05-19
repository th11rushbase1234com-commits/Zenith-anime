'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Pencil, 
  Check, 
  User, 
  Mail, 
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AVATAR_OPTIONS = [
  'https://picsum.photos/seed/z1/200/200',
  'https://picsum.photos/seed/z2/200/200',
  'https://picsum.photos/seed/z3/200/200',
  'https://picsum.photos/seed/z4/200/200',
  'https://picsum.photos/seed/z5/200/200',
  'https://picsum.photos/seed/z6/200/200',
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, authLoading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });
      toast({
        title: "Profile Updated",
        description: "Your Zenith identity records have been synchronized.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const selectAvatar = (url: string) => {
    setPhotoURL(url);
    setIsAvatarDialogOpen(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Accessing Zenith Core...</p>
      </div>
    );
  }

  const initial = user.email?.charAt(0).toUpperCase() || 'Z';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 md:px-8">
      <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-glow">
            TELEMETRY <span className="text-primary">SETTINGS</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-medium italic uppercase tracking-widest">
            Identity Configuration & Neural Link
          </p>
        </div>

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/30 p-1.5 shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all group-hover:border-primary group-hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden bg-white/5 flex items-center justify-center text-5xl font-black text-primary italic">
                {photoURL ? (
                  <Image 
                    src={photoURL} 
                    alt="Profile" 
                    width={160} 
                    height={160} 
                    className="w-full h-full object-cover"
                    data-ai-hint="profile avatar"
                  />
                ) : (
                  initial
                )}
              </div>
            </div>

            <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
              <DialogTrigger asChild>
                <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-background">
                  <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black italic uppercase tracking-widest text-primary">SELECT AVATAR</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 pt-6">
                  {AVATAR_OPTIONS.map((url, i) => (
                    <button 
                      key={i} 
                      onClick={() => selectAvatar(url)}
                      className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105"
                    >
                      <Image src={url} alt={`Preset ${i}`} width={100} height={100} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
              {displayName || 'Zenith User'}
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">{user.email}</p>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                <User className="w-3 h-3" /> Display Identity
              </label>
              <Input 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="h-12 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-bold"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Communication Node
              </label>
              <Input 
                value={user.email || ''}
                disabled
                className="h-12 bg-white/5 border-white/10 rounded-2xl px-6 opacity-50 cursor-not-allowed text-sm font-bold"
              />
            </div>
            
            <div className="pt-4 flex flex-col md:flex-row gap-4">
              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black italic rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                SYNCHRONIZE PROFILE
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="h-14 border-white/10 hover:bg-white/5 font-black italic rounded-full uppercase tracking-widest text-xs px-8"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" /> EXIT TO HUB
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-accent" /> Status: SECURE
            </span>
            <span>UID: {user.uid.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}