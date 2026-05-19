'use client';

import React, { useEffect } from 'react';
import { useWatchlist } from '../hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Bookmark, 
  LayoutGrid, 
  Play, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  Trash2,
  Database,
  BarChart3
} from 'lucide-react';
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
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Accessing Zenith Archives...</p>
      </div>
    );
  }

  const filteredWatchlist = (status?: string) => watchlist.filter(a => !status || a.status === status);

  const TABS = [
    { id: 'all', label: 'GLOBAL NEXUS', icon: Database, status: undefined },
    { id: 'watching', label: 'WATCHING', icon: Play, status: 'WATCHING' },
    { id: 'planned', label: 'PLAN TO WATCH', icon: Clock, status: 'PLAN_TO_WATCH' },
    { id: 'on_hold', label: 'ON HOLD', icon: PauseCircle, status: 'ON_HOLD' },
    { id: 'completed', label: 'COMPLETED', icon: CheckCircle2, status: 'COMPLETED' },
    { id: 'dropped', label: 'DROPPED', icon: Trash2, status: 'DROPPED' },
  ];

  const totalEpisodes = watchlist.reduce((acc, a) => acc + (a.currentEpisode || 0), 0);
  const completionRate = watchlist.length > 0 
    ? Math.round((watchlist.filter(a => a.status === 'COMPLETED').length / watchlist.length) * 100) 
    : 0;

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-12 py-12">
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
          
          {/* Library Header & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-10">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-glow">
                LIBRARY <span className="text-primary">ARCHIVES</span>
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground font-black italic uppercase tracking-[0.3em]">
                System Records & Consumption Telemetry
              </p>
            </div>
            
            <div className="flex gap-4 md:gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Volume</span>
                <span className="text-xl md:text-2xl font-black italic">{watchlist.length} TITLES</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Impact</span>
                <span className="text-xl md:text-2xl font-black italic">{totalEpisodes} EPISODES</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sync</span>
                <span className="text-xl md:text-2xl font-black italic">{completionRate}%</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full space-y-10">
            <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-md py-2 -mx-4 px-4">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="bg-white/5 rounded-2xl p-1 h-auto flex border border-white/5 min-w-max">
                  {TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="rounded-xl px-5 py-3 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      <span className="ml-1 opacity-50 font-mono">[{filteredWatchlist(tab.status).length}]</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
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
                    <div className="col-span-full py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
                      <div className="p-6 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Bookmark className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground italic font-black uppercase tracking-[0.2em]">Archival sector empty</p>
                        <p className="text-[10px] text-muted-foreground/40 font-mono uppercase">Status: No records detected in {tab.label}</p>
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
