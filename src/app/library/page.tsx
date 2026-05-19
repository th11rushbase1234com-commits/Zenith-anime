
'use client';

import React, { useEffect } from 'react';
import { useWatchlist } from '../hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bookmark } from 'lucide-react';
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

  return (
    <div className="bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-12 py-12">
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-10">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-glow">WATCHLIST</h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium italic">Personal archival records</p>
            </div>
            
            <Tabs defaultValue="all" className="w-full md:w-auto">
              <TabsList className="bg-white/5 rounded-full p-1 h-auto flex border border-white/5 backdrop-blur-md overflow-x-auto scrollbar-hide min-w-max">
                <TabsTrigger value="all" className="rounded-full px-4 md:px-8 py-2 md:py-2.5 font-bold uppercase text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">ALL RECORDS</TabsTrigger>
                <TabsTrigger value="watching" className="rounded-full px-4 md:px-8 py-2 md:py-2.5 font-bold uppercase text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">ACTIVE</TabsTrigger>
                <TabsTrigger value="planned" className="rounded-full px-4 md:px-8 py-2 md:py-2.5 font-bold uppercase text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">QUEUED</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full px-4 md:px-8 py-2 md:py-2.5 font-bold uppercase text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">MASTERED</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredWatchlist().map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                  {filteredWatchlist().length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                      <Bookmark className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground italic font-medium">Your library is currently empty.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="watching" className="mt-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredWatchlist('WATCHING').map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="planned" className="mt-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredWatchlist('PLAN_TO_WATCH').map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredWatchlist('COMPLETED').map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
