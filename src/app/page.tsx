
'use client';

import React, { useState } from 'react';
import { useWatchlist } from './hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { GenreVisualizer } from '@/components/GenreVisualizer';
import { DiscoveryTool } from '@/components/DiscoveryTool';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Monitor, Bookmark, CheckCircle, TrendingUp, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INITIAL_ANIME } from './lib/mock-data';

export default function ZenithApp() {
  const { 
    watchlist, 
    isLoaded, 
    updateAnimeStatus, 
    updateEpisodeProgress, 
    removeAnime,
    addAnime 
  } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const filteredWatchlist = (status?: string) => {
    return watchlist.filter(a => !status || a.status === status);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger an API search
    console.log('Searching for:', searchQuery);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pb-20">
      {/* Header/Hero */}
      <header className="relative py-12 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter text-foreground">
              ZENITH<span className="text-primary">ANIME</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md font-light">
              Elevate your viewing experience with intelligent discovery and real-time tracking.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search global metadata database..." 
              className="pl-12 py-6 rounded-2xl glass-panel border-none shadow-xl text-lg focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        
        {/* Navigation Tabs */}
        <div className="sticky top-4 z-40 flex justify-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="glass-panel p-1 rounded-full shadow-2xl border border-white/10">
            <TabsList className="bg-transparent gap-2 h-auto">
              <TabsTrigger value="dashboard" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Bookmark className="w-4 h-4 mr-2" /> Watchlist
              </TabsTrigger>
              <TabsTrigger value="discovery" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" /> Discovery
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Contents */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
                      <TrendingUp className="text-primary w-6 h-6" /> Continue Watching
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      <div className="col-span-full py-12 text-center glass-panel rounded-2xl">
                        <p className="text-muted-foreground">No active series. Start something new!</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-8">
                  <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
                    <CheckCircle className="text-accent w-6 h-6" /> Stats
                  </h2>
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Total Episodes</span>
                      <span className="font-headline font-bold text-2xl">{watchlist.reduce((acc, a) => acc + a.currentEpisode, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Completed Titles</span>
                      <span className="font-headline font-bold text-2xl">{watchlist.filter(a => a.status === 'COMPLETED').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Completion Rate</span>
                      <span className="font-headline font-bold text-2xl">
                        {Math.round((watchlist.filter(a => a.status === 'COMPLETED').length / watchlist.length) * 100 || 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-headline font-bold mb-6">Visual Insights</h2>
                <GenreVisualizer watchlist={watchlist} />
              </section>
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-headline font-bold">Personal Library</h2>
                <TabsList className="bg-secondary/50 rounded-xl p-1">
                  <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                  <TabsTrigger value="watching" className="rounded-lg">Watching</TabsTrigger>
                  <TabsTrigger value="planned" className="rounded-lg">Planning</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {watchlist.map(anime => (
                  <AnimeCard 
                    key={anime.id} 
                    anime={anime} 
                    onUpdateStatus={updateAnimeStatus}
                    onUpdateEpisode={updateEpisodeProgress}
                    onRemove={removeAnime}
                  />
                ))}
              </TabsContent>

              <TabsContent value="watching" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredWatchlist('WATCHING').map(anime => (
                  <AnimeCard 
                    key={anime.id} 
                    anime={anime} 
                    onUpdateStatus={updateAnimeStatus}
                    onUpdateEpisode={updateEpisodeProgress}
                    onRemove={removeAnime}
                  />
                ))}
              </TabsContent>

              <TabsContent value="planned" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredWatchlist('PLAN_TO_WATCH').map(anime => (
                  <AnimeCard 
                    key={anime.id} 
                    anime={anime} 
                    onUpdateStatus={updateAnimeStatus}
                    onUpdateEpisode={updateEpisodeProgress}
                    onRemove={removeAnime}
                  />
                ))}
              </TabsContent>

              <TabsContent value="completed" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredWatchlist('COMPLETED').map(anime => (
                  <AnimeCard 
                    key={anime.id} 
                    anime={anime} 
                    onUpdateStatus={updateAnimeStatus}
                    onUpdateEpisode={updateEpisodeProgress}
                    onRemove={removeAnime}
                  />
                ))}
              </TabsContent>
            </Tabs>
          )}

          {/* Discovery Tab */}
          {activeTab === 'discovery' && (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-headline font-bold">Intelligent Discovery</h2>
                <p className="text-muted-foreground">We use advanced pattern recognition to find titles that resonate with your specific emotional preference.</p>
              </div>
              <DiscoveryTool watchlist={watchlist} />
              
              <div className="space-y-6">
                <h3 className="text-xl font-headline font-semibold">Hot in the Community</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {/* This could be trending items from global search */}
                   {INITIAL_ANIME.slice(0, 3).map(anime => (
                    <AnimeCard 
                      key={`trending-${anime.id}`}
                      anime={{...anime, id: `trending-${anime.id}`, status: 'PLAN_TO_WATCH'}} 
                      isSearchMode
                      onAdd={addAnime}
                    />
                   ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 p-4 flex justify-around items-center z-50">
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-primary' : ''}>
          <LayoutDashboard className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('watchlist')} className={activeTab === 'watchlist' ? 'text-primary' : ''}>
          <Bookmark className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('discovery')} className={activeTab === 'discovery' ? 'text-primary' : ''}>
          <Sparkles className="w-6 h-6" />
        </Button>
      </nav>
    </div>
  );
}
