
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWatchlist } from './hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { GenreVisualizer } from '@/components/GenreVisualizer';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Monitor, 
  Bookmark, 
  Zap, 
  Loader2, 
  LogOut, 
  Bell, 
  Play,
  Settings,
  Star,
  Plus,
  X,
  History,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { searchAnime, getTrendingAnime, getRecentAiring } from '@/services/anilist';
import { Anime } from './types/anime';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ZenithApp() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { 
    watchlist, 
    isLoaded, 
    updateAnimeStatus, 
    updateEpisodeProgress, 
    removeAnime,
    addAnime 
  } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [recentAiring, setRecentAiring] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const observerTarget = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadInitialData() {
      const [trending, recent] = await Promise.all([
        getTrendingAnime(),
        getRecentAiring()
      ]);
      setTrendingAnime(trending.slice(0, 5));
      setRecentAiring(recent);
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!api) return;
    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 6000);
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
    return () => clearInterval(intervalId);
  }, [api]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setCurrentPage(1);
    try {
      const { anime, hasNextPage } = await searchAnime(searchQuery, 1);
      setSearchResults(anime);
      setHasNextPage(hasNextPage);
      setActiveTab('search');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const { anime, hasNextPage: more } = await searchAnime(searchQuery, nextPage);
      setSearchResults(prev => [...prev, ...anime]);
      setHasNextPage(more);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasNextPage, isLoadingMore, searchQuery]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (activeTab !== 'search' || !hasNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreResults();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [activeTab, hasNextPage, isLoadingMore, loadMoreResults]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('home');
    setCurrentPage(1);
    setHasNextPage(false);
  };

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Initialising Zenith Core...</p>
      </div>
    );
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'Zenith User';

  const filteredWatchlist = (status?: string) => {
    return watchlist.filter(a => !status || a.status === status);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-background/95 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <h1 className="text-2xl font-black italic tracking-tighter text-glow flex items-center gap-1">
              <span className="text-primary">ZENITH</span>
              <span className="text-white">ANIME</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search anime" 
              className="pl-10 pr-10 h-10 w-48 md:w-64 bg-white/5 border-none rounded-full text-sm focus:ring-1 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] overflow-hidden">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={userName} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-panel border-white/10 mt-2 p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black italic uppercase tracking-tight text-white">{userName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={() => setActiveTab('library')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                  <Bookmark className="w-4 h-4" /> Personal Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                  <Settings className="w-4 h-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-destructive/10 text-xs font-bold uppercase tracking-widest text-destructive"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1920px] mx-auto overflow-x-hidden pb-12">
        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Draggable Auto-sliding Hero Section */}
            <section className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[400px] md:min-h-[600px] overflow-hidden">
              <Carousel 
                setApi={setApi} 
                className="w-full h-full"
                opts={{
                  loop: true,
                  align: "start",
                }}
              >
                <CarouselContent className="h-full ml-0">
                  {trendingAnime.length > 0 ? trendingAnime.map((anime, index) => (
                    <CarouselItem key={anime.id} className="relative w-full h-full pl-0">
                      <div className="relative w-full h-full">
                        <Image 
                          src={anime.imageUrl} 
                          alt={anime.title} 
                          fill 
                          priority={index === 0}
                          className="object-cover brightness-[0.4]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
                        
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 space-y-6 max-w-4xl">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black italic rounded uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                              TRENDING NOW
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold rounded uppercase tracking-widest">
                              <Star className="w-3 h-3 text-accent fill-current" /> {Math.round(anime.rating * 10)}%
                            </div>
                          </div>
                          
                          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-glow leading-[0.9] line-clamp-2">
                            {anime.title.split(' ').map((word, i) => (
                              <span key={i} className={i % 2 === 1 ? 'text-primary' : 'text-white'}>
                                {word}{' '}
                              </span>
                            ))}
                          </h2>
                          
                          <p className="text-white/70 text-sm md:text-lg max-w-2xl line-clamp-3 font-medium italic">
                            {anime.description}
                          </p>

                          <div className="flex flex-wrap gap-4 pt-4">
                            <Button 
                              onClick={() => addAnime(anime)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black italic px-8 md:px-10 h-12 md:h-14 rounded-full gap-2 text-base md:text-lg shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-transform hover:scale-105"
                            >
                              <Plus className="w-5 h-5 md:w-6 md:h-6" /> ADD TO WATCHLIST
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  )) : (
                    <CarouselItem className="w-full h-full flex items-center justify-center bg-white/5 animate-pulse">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </CarouselItem>
                  )}
                </CarouselContent>
              </Carousel>

              <div className="absolute bottom-6 right-6 md:bottom-12 md:right-16 flex gap-2 z-20">
                {trendingAnime.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-10 md:w-12 bg-primary' : 'w-3 md:w-4 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            </section>

            {/* Content Body */}
            <div className="px-4 md:px-12 space-y-20">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-16">
                  {/* Recent Airing / Latest Releases Feed */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                        <History className="w-6 h-6 text-primary" /> Recently Aired
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                      {recentAiring.map(anime => (
                        <AnimeCard 
                          key={`recent-${anime.id}`} 
                          anime={anime} 
                          isSearchMode
                          onAdd={() => addAnime(anime)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Active Watching */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                        <Monitor className="w-6 h-6 text-accent" /> Active Feed
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                      {filteredWatchlist('WATCHING').slice(0, 5).map(anime => (
                        <AnimeCard 
                          key={anime.id} 
                          anime={anime} 
                          onUpdateStatus={updateAnimeStatus}
                          onUpdateEpisode={updateEpisodeProgress}
                          onRemove={removeAnime}
                        />
                      ))}
                      {filteredWatchlist('WATCHING').length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                          <Play className="w-12 h-12 text-muted-foreground/30" />
                          <p className="text-muted-foreground italic font-medium">Your active feed is currently offline.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Stats */}
                <div className="w-full lg:w-80 shrink-0 space-y-8">
                  <div className="bg-card/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-8 sticky top-24">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-white/5 pb-4">
                      <Zap className="w-4 h-4 fill-current" /> Profile Telemetry
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] text-muted-foreground font-black uppercase">Archive Volume</span>
                          <span className="font-bold text-lg text-glow">{watchlist.reduce((acc, a) => acc + (a.currentEpisode || 0), 0)} EP</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (watchlist.length * 10))}%` }} 
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Mastered</span>
                        <span className="font-black text-xl text-accent">{watchlist.filter(a => a.status === 'COMPLETED').length}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Efficiency</span>
                        <span className="font-black text-xl text-primary">
                          {Math.round((watchlist.filter(a => a.status === 'COMPLETED').length / (watchlist.length || 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Visualizer Section */}
              <section className="pt-8">
                <div className="flex flex-col space-y-2 mb-10">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-glow">Analytic Insights</h2>
                  <div className="h-1 w-20 bg-primary rounded-full" />
                </div>
                <GenreVisualizer watchlist={watchlist} />
              </section>
            </div>
          </div>
        )}

        {/* Collection Tab */}
        {activeTab === 'library' && (
          <div className="px-4 md:px-12 pt-12 space-y-12 animate-in slide-in-from-right-10 duration-500">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-10">
                <div className="space-y-2">
                  <h2 className="text-6xl font-black italic tracking-tighter uppercase text-glow">WATCHLIST</h2>
                  <p className="text-muted-foreground font-medium italic">Personal archival records</p>
                </div>
                <Tabs defaultValue="all" className="w-full md:w-auto">
                  <TabsList className="bg-white/5 rounded-full p-1 h-auto w-full md:w-auto border border-white/5 backdrop-blur-md">
                    <TabsTrigger value="all" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">ALL RECORDS</TabsTrigger>
                    <TabsTrigger value="watching" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">ACTIVE</TabsTrigger>
                    <TabsTrigger value="planned" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">QUEUED</TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">MASTERED</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-6">
                {watchlist.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Tab */}
        {activeTab === 'search' && (
          <div className="px-4 md:px-12 pt-12 space-y-16 animate-in slide-in-from-right-10 duration-500">
            {isSearching && currentPage === 1 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-primary font-mono animate-pulse uppercase tracking-[0.3em] font-black">SCANNING DATABASE...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-black italic uppercase tracking-widest text-glow">Search Results</h2>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Page {currentPage} {hasNextPage && "• Scanning more..."}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                  {searchResults.map((anime, idx) => (
                    <AnimeCard 
                      key={`search-${anime.id}-${idx}`}
                      anime={anime} 
                      isSearchMode
                      onAdd={() => addAnime(anime)}
                    />
                  ))}
                </div>
                
                {/* Intersection Target for Pagination */}
                <div ref={observerTarget} className="flex justify-center py-12">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-3 text-primary font-mono text-xs uppercase tracking-widest animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin" /> 
                      Synchronizing more records...
                    </div>
                  ) : hasNextPage ? (
                    <div className="h-10" /> 
                  ) : (
                    <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">End of resonance match archive.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                <p className="text-muted-foreground font-mono uppercase tracking-[0.3em]">No resonance matches found.</p>
                <Button variant="outline" onClick={clearSearch} className="rounded-full border-white/10">Return Home</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
