
'use client';

import React, { useEffect } from 'react';
import { useWatchlist } from '../hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bookmark, LayoutGrid, Play, Clock, CheckCircle2, PauseCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { watchlist, isLoaded, updateAnimeStatus, updateEpisodeProgress, removeAnime } = useWatchlist();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Initialising Zenith Core...</p>
      </div>
    );
  }

  const filteredWatchlist = (status?: string) => watchlist.filter(a => !status || a.status === status);

  const TABS = [
    { id: 'all', label: 'ALL ARCHIVES', icon: LayoutGrid, status: undefined },
    { id: 'watching', label: 'ACTIVE FEED', icon: Play, status: 'WATCHING' },
    { id: 'planned', label: 'SEQUENTIAL QUEUE', icon: Clock, status: 'PLAN_TO_WATCH' },
    { id: 'on_hold', label: 'STALLED UPLINK', icon: PauseCircle, status: 'ON_HOLD' },
    { id: 'completed', label: 'MASTERED RECORDS', icon: CheckCircle2, status: 'COMPLETED' },
    { id: 'dropped', label: 'PURGED DATA', icon: Trash2, status: 'DROPPED' },
  ];

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-12 py-12">
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
          <div className="flex flex-col space-y-10">
            <div className="space-y-2 border-b border-white/10 pb-8">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-glow">LIBRARY</h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium italic uppercase tracking-widest">Digital Archive & Telemetry Records</p>
            </div>
            
            <Tabs defaultValue="all" className="w-full space-y-12">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <TabsList className="bg-white/5 rounded-2xl p-1 h-auto flex border border-white/5 backdrop-blur-md min-w-max">
                  {TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="rounded-xl px-6 py-3 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      <span className="ml-1 opacity-50">({filteredWatchlist(tab.status).length})</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {filteredWatchlist(tab.status).map(anime => (
                      <AnimeCard 
                        key={anime.id} 
                        anime={anime} 
                        onUpdateStatus={updateAnimeStatus} 
                        onUpdateEpisode={updateEpisodeProgress} 
                        onRemove={removeAnime} 
                      />
                    ))}
                    {filteredWatchlist(tab.status).length === 0 && (
                      <div className="col-span-full py-32 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
                        <div className="p-5 rounded-full bg-white/5 border border-white/10">
                          <Bookmark className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground italic font-medium uppercase tracking-widest">No archival records detected in this sector.</p>
                          <p className="text-[10px] text-muted-foreground/50 font-mono uppercase">Status: Offline / Ready for Discovery</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
