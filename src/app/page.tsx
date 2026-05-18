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
  TrendingUp, 
  Sparkles, 
  LayoutDashboard, 
  Zap, 
  Loader2, 
  X, 
  LogOut, 
  Bell, 
  User, 
  Library, 
  Info,
  Menu,
  ChevronRight,
  ListPlus
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
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Initialising Zenith OS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Menu className="w-6 h-6 text-muted-foreground md:hidden cursor-pointer" />
            <h1 className="text-2xl font-black italic tracking-tighter text-glow">
              ZENITH<span className="text-primary">.OS</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'library' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              Collection
            </button>
            <button 
              onClick={() => setActiveTab('discovery')}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'discovery' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              Intelligence
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Query database..." 
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
            <section className="relative w-full aspect-[21/9] min-h-[400px] md:min-h-[500px] overflow-hidden group">
              {heroPlaceholder && (
                <Image 
                  src={heroPlaceholder.imageUrl} 
                  alt="Hero" 
                  fill 
                  priority
                  className="object-cover transition-transform duration-10000 group-hover:scale-105"
                  data-ai-hint={heroPlaceholder.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 space-y-4 max-w-4xl">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black italic rounded w-fit uppercase tracking-widest">
                  Personal Database
                </div>
                <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-glow">
                  CURATE YOUR <span className="text-primary">LEGACY</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-lg max-w-xl line-clamp-3">
                  Organize thousands of titles with institutional precision. Track progress, visualize genres, and discover your next obsession.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Button onClick={() => setActiveTab('library')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-12 rounded-full gap-2">
                    <Library className="w-5 h-5" /> VIEW COLLECTION
                  </Button>
                  <Button onClick={() => setActiveTab('discovery')} variant="outline" className="border-white/10 bg-white/5 backdrop-blur-md font-bold px-8 h-12 rounded-full gap-2 hover:bg-white/10">
                    <ListPlus className="w-5 h-5" /> ADD NEW TITLES
                  </Button>
                </div>
              </div>
            </section>

            {/* Horizontal Scroll Lists */}
            <div className="px-4 md:px-12 space-y-12">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-8">
                  {/* Currently Watching */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black italic uppercase tracking-widest border-l-4 border-primary pl-3 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-primary" /> Active Progression
                      </h3>
                      <button onClick={() => setActiveTab('library')} className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 uppercase tracking-widest">
                        Full Archive <ChevronRight className="w-4 h-4" />
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
                        <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                          <p className="text-muted-foreground italic">No active trackers detected.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Planned */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black italic uppercase tracking-widest border-l-4 border-accent pl-3 flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-accent" /> Sequential Queue
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
                        <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                          <p className="text-muted-foreground italic">Queue is currently empty.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Stats */}
                <div className="w-full lg:w-80 shrink-0 space-y-8">
                  <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" /> Database Telemetry
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Total Logged</span>
                        <span className="font-bold text-lg text-glow">{watchlist.reduce((acc, a) => acc + a.currentEpisode, 0)} EP</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Archive Finalized</span>
                        <span className="font-bold text-lg text-accent">{watchlist.filter(a => a.status === 'COMPLETED').length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5">
                        <span className="text-xs text-muted-foreground font-bold uppercase">Sync Efficiency</span>
                        <span className="font-bold text-lg text-primary">
                          {Math.round((watchlist.filter(a => a.status === 'COMPLETED').length / (watchlist.length || 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('discovery')}>
                    <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-primary opacity-20 group-hover:scale-125 transition-transform duration-500" />
                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-primary">AI ANALYTICS</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                      Optimize your catalog based on high-frequency genre resonance.
                    </p>
                    <Button size="sm" className="mt-4 bg-primary hover:bg-primary/80 rounded-full h-8 px-4 text-[10px] font-black italic uppercase">
                      START PROBE
                    </Button>
                  </div>
                </div>
              </div>

              {/* Data Visualizer Section */}
              <section className="pt-8">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                  <h2 className="text-2xl font-black italic uppercase tracking-widest">Neural Affinity Map</h2>
                </div>
                <GenreVisualizer watchlist={watchlist} />
              </section>
            </div>
          </div>
        )}

        {/* Collection Tab */}
        {activeTab === 'library' && (
          <div className="px-4 md:px-12 pt-8 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-6">
              <h2 className="text-5xl font-black italic tracking-tighter uppercase text-glow">GLOBAL COLLECTION</h2>
              <Tabs defaultValue="all" className="w-full md:w-auto">
                <TabsList className="bg-white/5 rounded-full p-1 h-auto w-full md:w-auto">
                  <TabsTrigger value="all" className="rounded-full px-6 py-2 font-bold uppercase text-[10px] data-[state=active]:bg-primary">ALL</TabsTrigger>
                  <TabsTrigger value="watching" className="rounded-full px-6 py-2 font-bold uppercase text-[10px] data-[state=active]:bg-primary">ACTIVE</TabsTrigger>
                  <TabsTrigger value="planned" className="rounded-full px-6 py-2 font-bold uppercase text-[10px] data-[state=active]:bg-primary">QUEUED</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-full px-6 py-2 font-bold uppercase text-[10px] data-[state=active]:bg-primary">MASTERED</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-10">
                  {watchlist.map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </TabsContent>
                <TabsContent value="watching" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-10">
                  {filteredWatchlist('WATCHING').map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </TabsContent>
                <TabsContent value="planned" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-10">
                  {filteredWatchlist('PLAN_TO_WATCH').map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </TabsContent>
                <TabsContent value="completed" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-10">
                  {filteredWatchlist('COMPLETED').map(anime => (
                    <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <div className="px-4 md:px-12 pt-8 space-y-16">
            {/* Search Results */}
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-primary font-mono animate-pulse uppercase tracking-widest">QUERYING GLOBAL ARCHIVES...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                  <h2 className="text-2xl font-black italic uppercase tracking-widest">QUERY RESULTS</h2>
                  <Button variant="ghost" size="sm" onClick={clearSearch} className="text-muted-foreground hover:text-white border border-white/5 rounded-full px-4">
                    CLEAR
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {searchResults.map(anime => (
                    <AnimeCard 
                      key={`search-${anime.id}`}
                      anime={anime} 
                      isSearchMode
                      onAdd={() => addAnime(anime)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  Neural Intelligence Core
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-glow leading-none">
                  NEURAL <span className="text-primary">DISCOVERY</span>
                </h2>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto italic font-medium opacity-80 leading-relaxed">
                  "Parsing your archival architecture. Simulating aesthetic resonance. Generating optimal matches for your unique neural profile."
                </p>
              </div>
              <DiscoveryTool watchlist={watchlist} />
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-2xl border-t border-white/10 p-4 flex justify-around items-center z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-primary bg-primary/10 rounded-2xl' : 'text-muted-foreground'}>
          <LayoutDashboard className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('library')} className={activeTab === 'library' ? 'text-primary bg-primary/10 rounded-2xl' : 'text-muted-foreground'}>
          <Bookmark className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('discovery')} className={activeTab === 'discovery' ? 'text-primary bg-primary/10 rounded-2xl' : 'text-muted-foreground'}>
          <Sparkles className="w-6 h-6" />
        </Button>
      </nav>
    </div>
  );
}
