'use client';

import React, { useState, useEffect } from 'react';
import { useWatchlist } from './hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { GenreVisualizer } from '@/components/GenreVisualizer';
import { DiscoveryTool } from '@/components/DiscoveryTool';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Monitor, 
  Bookmark, 
  CheckCircle, 
  Sparkles, 
  LayoutDashboard, 
  Zap, 
  Loader2, 
  LogOut, 
  Bell, 
  Library, 
  Menu,
  ChevronRight,
  ListPlus,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchAnime } from '@/services/jikan';
import { Anime } from './types/anime';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'zenith-hero');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const filteredWatchlist = (status?: string) => {
    return watchlist.filter(a => !status || a.status === status);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchAnime(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
    setActiveTab('discovery');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Loading Zenith Anime...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-background/95 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Menu className="w-6 h-6 text-muted-foreground md:hidden cursor-pointer" />
            <h1 className="text-2xl font-black italic tracking-tighter text-glow flex items-center gap-1">
              <span className="text-primary">ZENITH</span>
              <span className="text-white">ANIME</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'library' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              Watchlist
            </button>
            <button 
              onClick={() => setActiveTab('discovery')}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'discovery' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              Discovery
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search anime..." 
              className="pl-10 h-10 w-48 md:w-64 bg-white/5 border-none rounded-full text-sm focus:ring-1 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1920px] mx-auto overflow-x-hidden pb-12">
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <section className="relative w-full aspect-[21/9] min-h-[450px] md:min-h-[550px] overflow-hidden">
              {heroPlaceholder && (
                <Image 
                  src={heroPlaceholder.imageUrl} 
                  alt="Zenith Anime Hero" 
                  fill 
                  priority
                  className="object-cover transition-transform duration-10000 hover:scale-105"
                  data-ai-hint={heroPlaceholder.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 space-y-6 max-w-4xl">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black italic rounded w-fit uppercase tracking-widest">
                  Personal Archive
                </div>
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-glow leading-[0.9]">
                  TRACK YOUR <br />
                  <span className="text-primary">JOURNEY</span>
                </h2>
                <p className="text-white/80 text-sm md:text-xl max-w-2xl line-clamp-3 font-medium">
                  The ultimate hub for anime enthusiasts. Organize your collection, monitor your progress, and simulate your next discovery with Zenith Anime.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Button onClick={() => setActiveTab('library')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 h-14 rounded-full gap-2 text-lg shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-transform hover:scale-105">
                    <Library className="w-6 h-6" /> OPEN WATCHLIST
                  </Button>
                  <Button onClick={() => setActiveTab('discovery')} variant="outline" className="border-white/20 bg-white/5 backdrop-blur-md font-bold px-10 h-14 rounded-full gap-2 hover:bg-white/10 text-lg">
                    <Sparkles className="w-6 h-6 text-accent" /> DISCOVER NEW
                  </Button>
                </div>
              </div>
            </section>

            {/* Content Body */}
            <div className="px-4 md:px-12 space-y-16">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-12">
                  {/* Active Watching */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                        <Monitor className="w-6 h-6 text-primary" /> Continue Watching
                      </h3>
                      <button onClick={() => setActiveTab('library')} className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 uppercase tracking-widest transition-colors">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
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
                          <p className="text-muted-foreground italic font-medium">Your active list is currently empty.</p>
                          <Button onClick={() => setActiveTab('discovery')} variant="ghost" className="text-primary hover:bg-primary/10">Browse Library</Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Planned */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                        <Bookmark className="w-6 h-6 text-accent" /> Planned to Watch
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                      {filteredWatchlist('PLAN_TO_WATCH').slice(0, 5).map(anime => (
                        <AnimeCard 
                          key={anime.id} 
                          anime={anime} 
                          onUpdateStatus={updateAnimeStatus}
                          onUpdateEpisode={updateEpisodeProgress}
                          onRemove={removeAnime}
                        />
                      ))}
                      {filteredWatchlist('PLAN_TO_WATCH').length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                          <p className="text-muted-foreground italic font-medium">Nothing planned yet. Start exploring!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Stats */}
                <div className="w-full lg:w-80 shrink-0 space-y-8">
                  <div className="bg-card/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-8 sticky top-24">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-white/5 pb-4">
                      <Zap className="w-4 h-4 fill-current" /> Profile Overview
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] text-muted-foreground font-black uppercase">Progress Velocity</span>
                          <span className="font-bold text-lg text-glow">{watchlist.reduce((acc, a) => acc + a.currentEpisode, 0)} EP</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '65%' }} />
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
                    
                    <div className="pt-4">
                      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('discovery')}>
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-primary opacity-20 group-hover:scale-125 transition-transform duration-500" />
                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-primary">ZENITH PROBE</h3>
                        <p className="text-[10px] text-white/60 font-medium mt-2 leading-relaxed">
                          Analyze your taste profile to find high-resonance titles.
                        </p>
                        <Button size="sm" className="mt-4 w-full bg-primary hover:bg-primary/80 rounded-full h-8 px-4 text-[10px] font-black italic uppercase">
                          EXECUTE SCAN
                        </Button>
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
          <div className="px-4 md:px-12 pt-12 space-y-12">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h2 className="text-6xl font-black italic tracking-tighter uppercase text-glow">YOUR WATCHLIST</h2>
                  <p className="text-muted-foreground font-medium italic">Archive management system</p>
                </div>
                <Tabs defaultValue="all" className="w-full md:w-auto">
                  <TabsList className="bg-white/5 rounded-full p-1 h-auto w-full md:w-auto border border-white/5 backdrop-blur-md">
                    <TabsTrigger value="all" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">ALL</TabsTrigger>
                    <TabsTrigger value="watching" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">ACTIVE</TabsTrigger>
                    <TabsTrigger value="planned" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">PLANNED</TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-full px-8 py-2.5 font-bold uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">MASTERED</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-12">
                    {watchlist.map(anime => (
                      <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                    ))}
                  </TabsContent>
                  <TabsContent value="watching" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-12">
                    {filteredWatchlist('WATCHING').map(anime => (
                      <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                    ))}
                  </TabsContent>
                  <TabsContent value="planned" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-12">
                    {filteredWatchlist('PLAN_TO_WATCH').map(anime => (
                      <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                    ))}
                  </TabsContent>
                  <TabsContent value="completed" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-12">
                    {filteredWatchlist('COMPLETED').map(anime => (
                      <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Discovery Tab */}
        {activeTab === 'discovery' && (activeTab === 'discovery' && (
          <div className="px-4 md:px-12 pt-12 space-y-16">
            {/* Search Results */}
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-primary font-mono animate-pulse uppercase tracking-[0.3em] font-black">SEARCHING DATABASE...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-black italic uppercase tracking-widest text-glow">SEARCH RESULTS</h2>
                  <Button variant="ghost" size="sm" onClick={clearSearch} className="text-muted-foreground hover:text-white border border-white/10 rounded-full px-6 transition-all hover:bg-white/5">
                    CLEAR SEARCH
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                  {searchResults.map(anime => (
                    <AnimeCard 
                      key={`search-${anime.id}`}
                      anime={anime} 
                      isSearchMode
                      onAdd={() => {
                        addAnime(anime);
                        // Optional: Navigate to library or show success
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="max-w-6xl mx-auto space-y-16 py-12">
              <div className="text-center space-y-6">
                <div className="inline-block px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                  Zenith Discovery Core
                </div>
                <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-glow leading-none">
                  FIND YOUR NEXT <br /><span className="text-primary">MASTERPIECE</span>
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto italic font-medium leading-relaxed">
                  "Parsing aesthetic resonances and narrative archetypes. Simulate potential matches for your unique taste profile."
                </p>
              </div>
              <DiscoveryTool watchlist={watchlist} />
            </div>
          </div>
        ))}
      </main>

      {/* Footer Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-2xl border-t border-white/10 p-4 flex justify-around items-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-primary bg-primary/15 rounded-2xl' : 'text-muted-foreground'}>
          <LayoutDashboard className="w-7 h-7" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('library')} className={activeTab === 'library' ? 'text-primary bg-primary/15 rounded-2xl' : 'text-muted-foreground'}>
          <Bookmark className="w-7 h-7" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('discovery')} className={activeTab === 'discovery' ? 'text-primary bg-primary/15 rounded-2xl' : 'text-muted-foreground'}>
          <Sparkles className="w-7 h-7" />
        </Button>
      </nav>
    </div>
  );
}
