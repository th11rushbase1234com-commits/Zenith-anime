'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWatchlist } from '../hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { searchAnime } from '@/services/anilist';
import { Anime } from '../types/anime';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

function SearchResults() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const { addAnime, isLoaded, watchlist, updateAnimeStatus, removeAnime } = useWatchlist();
  const [results, setResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function performSearch() {
      if (!query) return;
      setIsSearching(true);
      try {
        const { anime, hasNextPage: more, lastPage: total } = await searchAnime(query, currentPage);
        setResults(anime);
        setHasNextPage(more);
        setLastPage(total);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }
    performSearch();
  }, [query, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getExistingItem = (id: string) => watchlist.find(a => a.id === id);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Initialising Zenith Core...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-12 py-12">
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-6">
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-spin" />
              <p className="text-primary font-mono animate-pulse uppercase tracking-[0.2em] font-black text-xs md:text-sm">SCANNING DATABASE...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-8 md:space-y-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 md:pb-6">
                <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-widest text-glow">
                  Results for: <span className="text-primary">{query}</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
                {results.map((anime, idx) => (
                  <AnimeCard 
                    key={`search-${anime.id}-${idx}`}
                    anime={anime} 
                    existingItem={getExistingItem(anime.id)}
                    onAdd={addAnime}
                    onUpdateStatus={updateAnimeStatus}
                    onRemove={removeAnime}
                  />
                ))}
              </div>

              <div className="flex justify-center py-10 md:py-12">
                <div className="inline-grid grid-cols-3 items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full h-9 md:h-10 px-1 shadow-2xl min-w-[180px] md:min-w-[200px] text-center">
                  <div className="flex justify-start">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`h-7 md:h-8 px-2 md:px-3 rounded-full hover:bg-white/10 text-[9px] md:text-[10px] font-black italic tracking-widest text-primary ${currentPage <= 1 ? 'invisible pointer-events-none' : 'visible'}`}
                    >
                      <ChevronLeft className="w-3 md:w-3.5 h-3 md:h-3.5 mr-0.5" /> PREV
                    </Button>
                  </div>
                  
                  <div className="px-1 md:px-2 font-black italic text-[9px] md:text-[10px] uppercase tracking-tighter text-glow whitespace-nowrap">
                    Page <span className="text-primary ml-0.5">{currentPage}</span>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`h-7 md:h-8 px-2 md:px-3 rounded-full hover:bg-white/10 text-[9px] md:text-[10px] font-black italic tracking-widest text-primary ${!hasNextPage ? 'invisible pointer-events-none' : 'visible'}`}
                    >
                      NEXT <ChevronRight className="w-3 md:w-3.5 h-3 md:h-3.5 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-6 text-center">
              <p className="text-muted-foreground font-mono uppercase tracking-[0.2em] text-xs md:text-sm">No search results found for "{query}"</p>
              <Button variant="outline" onClick={() => router.push('/')} className="rounded-full border-white/10">RETURN HOME</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchResults />
    </Suspense>
  );
}
