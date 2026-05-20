'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWatchlist } from '../hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { searchAnime } from '@/services/anilist';
import { Anime } from '../types/anime';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  Check,
  Filter
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface GenreInfo {
  name: string;
  color: string;
  activeColor: string;
}

const GENRE_MATRIX: GenreInfo[] = [
  { name: "Action", color: "border-red-500/20 text-red-400 bg-red-500/5", activeColor: "bg-red-500 text-white border-red-500" },
  { name: "Adventure", color: "border-green-500/20 text-green-400 bg-green-500/5", activeColor: "bg-green-500 text-white border-green-500" },
  { name: "Comedy", color: "border-yellow-500/20 text-yellow-400 bg-yellow-500/5", activeColor: "bg-yellow-500 text-white border-yellow-500" },
  { name: "Drama", color: "border-blue-500/20 text-blue-400 bg-blue-500/5", activeColor: "bg-blue-500 text-white border-blue-500" },
  { name: "Ecchi", color: "border-rose-500/20 text-rose-400 bg-rose-500/5", activeColor: "bg-rose-500 text-white border-rose-500" },
  { name: "Fantasy", color: "border-purple-500/20 text-purple-400 bg-purple-500/5", activeColor: "bg-purple-500 text-white border-purple-500" },
  { name: "Horror", color: "border-zinc-500/20 text-zinc-400 bg-zinc-500/5", activeColor: "bg-zinc-500 text-white border-zinc-500" },
  { name: "Mahou Shoujo", color: "border-pink-400/20 text-pink-300 bg-pink-400/5", activeColor: "bg-pink-400 text-white border-pink-400" },
  { name: "Mecha", color: "border-orange-500/20 text-orange-400 bg-orange-500/5", activeColor: "bg-orange-500 text-white border-orange-500" },
  { name: "Music", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5", activeColor: "bg-emerald-500 text-white border-emerald-500" },
  { name: "Mystery", color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5", activeColor: "bg-indigo-500 text-white border-indigo-500" },
  { name: "Psychological", color: "border-violet-500/20 text-violet-400 bg-violet-500/5", activeColor: "bg-violet-500 text-white border-violet-500" },
  { name: "Romance", color: "border-rose-400/20 text-rose-300 bg-rose-400/5", activeColor: "bg-rose-400 text-white border-rose-400" },
  { name: "Sci-Fi", color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5", activeColor: "bg-cyan-500 text-white border-cyan-500" },
  { name: "Slice of Life", color: "border-sky-500/20 text-sky-400 bg-sky-500/5", activeColor: "bg-sky-500 text-white border-sky-500" },
  { name: "Sports", color: "border-lime-500/20 text-lime-400 bg-lime-500/5", activeColor: "bg-lime-500 text-white border-lime-500" },
  { name: "Supernatural", color: "border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5", activeColor: "bg-fuchsia-500 text-white border-fuchsia-500" },
  { name: "Thriller", color: "border-red-600/20 text-red-500 bg-red-600/5", activeColor: "bg-red-600 text-white border-red-600" }
];

const STATUSES = [
  { label: "Airing", value: "RELEASING" },
  { label: "Finished", value: "FINISHED" },
  { label: "Upcoming", value: "NOT_YET_RELEASED" }
];

function SearchResults() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || '';
  
  const { addAnime, isLoaded, watchlist, updateAnimeStatus, removeAnime } = useWatchlist();
  const [results, setResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filter State
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function performSearch() {
      setIsSearching(true);
      // Command Reset: Force origin on any telemetry update
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      try {
        const sortParam = initialSort === 'airing' ? ["START_DATE_DESC"] : ["SEARCH_MATCH", "TRENDING_DESC"];
        const { anime, hasNextPage: more, lastPage: total } = await searchAnime({
          query: initialQuery,
          page: currentPage,
          status: selectedStatus,
          genres: selectedGenres,
          sort: sortParam
        });
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
  }, [initialQuery, initialSort, currentPage, selectedStatus, selectedGenres]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage) return;
    setCurrentPage(newPage);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const getExistingItem = (id: string) => watchlist.find(a => a.id === id);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-black uppercase tracking-widest">INITIALIZING ZENITH CORE...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-12 py-12">
        <div className="space-y-12 animate-in fade-in duration-700">
          
          <div className="space-y-10 border-b border-white/5 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-glow">
                  DISCOVERY <span className="text-primary">COMMAND</span>
                </h2>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em]">Sector Selection & Archive Telemetry</p>
              </div>
              
              <div className="flex flex-wrap gap-2 md:justify-end">
                {STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setSelectedStatus(selectedStatus === status.value ? '' : status.value);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all h-10 flex items-center gap-2",
                      selectedStatus === status.value 
                        ? "bg-primary border-primary text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">CHROMATIC GENRE MATRIX</p>
                </div>
                {selectedGenres.length > 0 && (
                  <button 
                    onClick={() => setSelectedGenres([])}
                    className="text-[9px] font-black uppercase text-primary hover:text-white transition-colors"
                  >
                    PURGE SELECTION
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-2">
                {GENRE_MATRIX.map((genre) => {
                  const isActive = selectedGenres.includes(genre.name);
                  return (
                    <button
                      key={genre.name}
                      onClick={() => toggleGenre(genre.name)}
                      className={cn(
                        "h-9 px-3 rounded-xl text-[8px] font-black uppercase tracking-tight flex items-center justify-between border transition-all truncate",
                        isActive 
                          ? genre.activeColor 
                          : `${genre.color} hover:brightness-125`
                      )}
                    >
                      <span className="truncate mr-1">{genre.name}</span>
                      {isActive && <Check className="w-2.5 h-2.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-24 md:py-32 gap-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-primary font-black uppercase tracking-[0.2em] text-xs md:text-sm">SCANNING ARCHIVES...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-glow">
                    {initialQuery ? (
                      <>RESULTS: <span className="text-primary">{initialQuery}</span></>
                    ) : (
                      <>{initialSort === 'airing' ? 'RECENT TELEMETRY' : 'GLOBAL DISCOVERY'}</>
                    )}
                  </h2>
                  <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    SECTOR: {results.length} RECORDS LOADED
                  </div>
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

                <div className="flex justify-center py-10">
                  <div className="inline-grid grid-cols-3 items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full h-11 px-1 shadow-2xl min-w-[220px] text-center">
                    <div className="flex justify-start">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={cn(
                          "h-9 px-4 rounded-full hover:bg-white/10 text-[10px] font-black tracking-widest text-primary",
                          currentPage <= 1 && "invisible pointer-events-none"
                        )}
                      >
                        <ChevronLeft className="w-4 h-4 mr-0.5" /> PREV
                      </Button>
                    </div>
                    
                    <div className="px-2 font-black text-[10px] uppercase tracking-tighter text-glow whitespace-nowrap">
                      PAGE <span className="text-primary ml-0.5">{currentPage}</span>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={cn(
                          "h-9 px-4 rounded-full hover:bg-white/10 text-[10px] font-black tracking-widest text-primary",
                          !hasNextPage && "invisible pointer-events-none"
                        )}
                      >
                        NEXT <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 gap-6 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <X className="w-16 h-16 text-muted-foreground/20" />
                <div className="space-y-2">
                  <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-sm">SECTOR OFFLINE</p>
                  <p className="text-[10px] text-muted-foreground/40 font-black uppercase">NO RECORDS FOUND IN CURRENT ARCHIVE</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStatus('');
                    setSelectedGenres([]);
                    router.push('/search');
                  }} 
                  className="rounded-full border-white/10 font-black uppercase tracking-widest h-14 px-12"
                >
                  RESET PROTOCOL
                </Button>
              </div>
            )}
          </div>
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
