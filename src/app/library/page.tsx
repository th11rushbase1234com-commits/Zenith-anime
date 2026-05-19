'use client';

import React, { useEffect } from 'react';
import { useWatchlist } from '../hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Bookmark, 
  Play, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  Trash2,
  Database
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { watchlist, isLoaded, updateAnimeStatus, removeAnime } = useWatchlist();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Accessing Zenith Archives...</p>
      </div>
    );
  }

  const filteredWatchlist = (status?: string) => watchlist.filter(a => !status || a.status === status);

  const TABS = [
    { id: 'all', label: 'ALL ANIME', icon: Database, status: undefined },
    { id: 'watching', label: 'WATCHING', icon: Play, status: 'WATCHING' },
    { id: 'planned', label: 'PLAN TO WATCH', icon: Clock, status: 'PLAN_TO_WATCH' },
    { id: 'on_hold', label: 'ON HOLD', icon: PauseCircle, status: 'ON_HOLD' },
    { id: 'completed', label: 'COMPLETED', icon: CheckCircle2, status: 'COMPLETED' },
    { id: 'dropped', label: 'DROPPED', icon: Trash2, status: 'DROPPED' },
  ];

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen overflow-x-hidden">
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
          
          {/* Watchlist Header */}
          <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
            <div className="space-y-0.5">
              <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-glow leading-tight">
                WATCHLIST <span className="text-primary">ARCHIVES</span>
              </h2>
              <p className="text-[7px] md:text-[8px] text-muted-foreground/60 font-black italic uppercase tracking-[0.4em]">
                Anime Records & Zenith Nexus
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full space-y-8">
            {/* Category Grid - 3 on Left, 3 on Right */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
              <TabsList className="bg-white/5 rounded-2xl p-1.5 h-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 border border-white/5 w-full max-w-4xl mx-auto">
                {TABS.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="rounded-xl px-3 py-3 font-black uppercase text-[8px] md:text-[9px] tracking-widest flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 shadow-none border border-transparent data-[state=active]:border-primary/50"
                  >
                    <tab.icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    <span className="ml-1 opacity-50 font-mono">[{filteredWatchlist(tab.status).length}]</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
                  {filteredWatchlist(tab.status).map(anime => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime} 
                      onUpdateStatus={updateAnimeStatus} 
                      onRemove={removeAnime} 
                    />
                  ))}
                  {filteredWatchlist(tab.status).length === 0 && (
                    <div className="col-span-full py-24 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
                      <div className="p-5 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Bookmark className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground italic font-black uppercase tracking-[0.2em]">Sector Offline</p>
                        <p className="text-[9px] text-muted-foreground/40 font-mono uppercase">Status: No records found</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}