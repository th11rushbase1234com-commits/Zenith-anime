
'use client';

import React, { useState, useEffect } from 'react';
import { useWatchlist } from './hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { GenreVisualizer } from '@/components/GenreVisualizer';
import { DiscoveryTool } from '@/components/DiscoveryTool';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Monitor, Bookmark, CheckCircle, TrendingUp, Sparkles, LayoutDashboard, Zap, Loader2, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchAnime } from '@/services/jikan';
import { Anime } from './types/anime';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="min-h-screen pb-20 selection:bg-accent selection:text-accent-foreground">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header/Hero */}
      <header className="relative pt-12 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-10">
          <div className="w-full flex justify-end mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest text-[10px]"
            >
              <LogOut className="w-4 h-4 mr-2" /> TERMINATE_SESSION
            </Button>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-pulse">
              <Zap className="w-3 h-3 fill-current" /> System Online - USER: {user.email?.split('@')[0]}
            </div>
            <h1 className="text-6xl md:text-9xl font-headline font-extrabold tracking-tighter text-foreground text-glow">
              ZENITH<span className="text-primary">.OS</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl font-light leading-relaxed mx-auto italic">
              "The interface between reality and your next obsession."
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-primary" />
              <Input 
                placeholder="ACCESS GLOBAL ANIME DATABASE..." 
                className="pl-16 pr-12 py-8 rounded-2xl bg-background border-2 border-white/5 shadow-2xl text-xl placeholder:text-muted-foreground/30 focus:ring-0 focus:border-primary/50 transition-all font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="absolute right-6 p-2 text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Navigation Tabs */}
        <div className="sticky top-6 z-40 flex justify-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="glass-panel p-1.5 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5">
            <TabsList className="bg-transparent gap-1 h-auto">
              <TabsTrigger value="dashboard" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold tracking-tight">
                <LayoutDashboard className="w-4 h-4 mr-2" /> DASHBOARD
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold tracking-tight">
                <Bookmark className="w-4 h-4 mr-2" /> LIBRARY
              </TabsTrigger>
              <TabsTrigger value="discovery" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold tracking-tight">
                <Sparkles className="w-4 h-4 mr-2" /> DISCOVERY
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Contents */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-12">
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                   <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                    <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
                      <TrendingUp className="text-primary w-8 h-8" /> RECENTLY ACCESSED
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredWatchlist('WATCHING').slice(0, 3).map(anime => (
                      <AnimeCard 
                        key={anime.id} 
                        anime={anime} 
                        onUpdateStatus={updateAnimeStatus}
                        onUpdateEpisode={updateEpisodeProgress}
                        onRemove={removeAnime}
                      />
                    ))}
                    {filteredWatchlist('WATCHING').length === 0 && (
                      <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2 border-white/5">
                        <p className="text-muted-foreground text-lg italic">The records are empty. Initiate a new series.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-8">
                  <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
                    <CheckCircle className="text-accent w-8 h-8" /> TELEMETRY
                  </h2>
                  <div className="glass-panel p-8 rounded-3xl space-y-6 relative cyber-border">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Runtime (EP)</span>
                      <span className="font-headline font-black text-4xl text-primary">{watchlist.reduce((acc, a) => acc + a.currentEpisode, 0)}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Mastered Titles</span>
                      <span className="font-headline font-black text-4xl text-accent">{watchlist.filter(a => a.status === 'COMPLETED').length}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Sync Rate</span>
                      <span className="font-headline font-black text-4xl text-foreground">
                        {Math.round((watchlist.filter(a => a.status === 'COMPLETED').length / (watchlist.length || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-3xl font-headline font-bold">DATA VISUALIZATION</h2>
                </div>
                <GenreVisualizer watchlist={watchlist} />
              </section>
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <Tabs defaultValue="all" className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
                <h2 className="text-5xl font-headline font-bold text-glow">CENTRAL ARCHIVE</h2>
                <TabsList className="bg-secondary/50 rounded-2xl p-1.5 h-auto">
                  <TabsTrigger value="all" className="rounded-xl px-6 py-2 font-bold uppercase text-xs">ALL</TabsTrigger>
                  <TabsTrigger value="watching" className="rounded-xl px-6 py-2 font-bold uppercase text-xs">ACTIVE</TabsTrigger>
                  <TabsTrigger value="planned" className="rounded-xl px-6 py-2 font-bold uppercase text-xs">QUEUE</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-xl px-6 py-2 font-bold uppercase text-xs">ARCHIVED</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {watchlist.length > 0 ? (
                  watchlist.map(anime => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime} 
                      onUpdateStatus={updateAnimeStatus}
                      onUpdateEpisode={updateEpisodeProgress}
                      onRemove={removeAnime}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
                    <p className="text-muted-foreground text-lg">Your library is empty. Use Discovery to find content.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="watching" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredWatchlist('WATCHING').map(anime => (
                  <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                ))}
              </TabsContent>
              <TabsContent value="planned" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredWatchlist('PLAN_TO_WATCH').map(anime => (
                  <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                ))}
              </TabsContent>
              <TabsContent value="completed" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredWatchlist('COMPLETED').map(anime => (
                  <AnimeCard key={anime.id} anime={anime} onUpdateStatus={updateAnimeStatus} onUpdateEpisode={updateEpisodeProgress} onRemove={removeAnime} />
                ))}
              </TabsContent>
            </Tabs>
          )}

          {/* Discovery Tab */}
          {activeTab === 'discovery' && (
            <div className="max-w-5xl mx-auto space-y-16">
              
              {/* Search Results Section */}
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-primary font-mono animate-pulse">SYNCHRONIZING WITH GLOBAL DATABASE...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-10">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                    <h2 className="text-3xl font-headline font-bold">QUERY RESULTS</h2>
                    <Button variant="ghost" size="sm" onClick={clearSearch} className="text-muted-foreground hover:text-white">
                      CLEAR RESULTS
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {searchResults.map(anime => (
                      <AnimeCard 
                        key={`search-${anime.id}`}
                        anime={anime} 
                        isSearchMode
                        onAdd={() => {
                          addAnime(anime);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="text-center space-y-6 pt-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-black uppercase tracking-widest">
                  Artificial Intelligence
                </div>
                <h2 className="text-6xl font-headline font-bold text-glow">COGNITIVE ENGINE</h2>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto italic font-light">
                  "Parsing viewing patterns. Simulating emotional resonance. Generating optimal matches."
                </p>
              </div>
              <DiscoveryTool watchlist={watchlist} />
            </div>
          )}

        </div>
      </main>

      {/* Footer Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 p-4 flex justify-around items-center z-50 rounded-t-3xl backdrop-blur-2xl">
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}>
          <LayoutDashboard className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('watchlist')} className={activeTab === 'watchlist' ? 'text-primary' : 'text-muted-foreground'}>
          <Bookmark className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('discovery')} className={activeTab === 'discovery' ? 'text-primary' : 'text-muted-foreground'}>
          <Sparkles className="w-6 h-6" />
        </Button>
      </nav>
    </div>
  );
}
