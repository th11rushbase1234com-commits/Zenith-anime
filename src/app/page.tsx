
'use client';

import React, { useState, useEffect } from 'react';
import { useWatchlist } from './hooks/use-watchlist';
import { AnimeCard } from '@/components/AnimeCard';
import { GenreVisualizer } from '@/components/GenreVisualizer';
import { DiscoveryTool } from '@/components/DiscoveryTool';
import { 
  Monitor, 
  Zap, 
  Loader2, 
  Play,
  Star,
  Plus,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getTrendingAnime, getRecentAiring } from '@/services/anilist';
import { Anime } from './types/anime';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { watchlist, isLoaded, addAnime, updateAnimeStatus, updateEpisodeProgress, removeAnime } = useWatchlist();
  
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [recentAiring, setRecentAiring] = useState<Anime[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

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
    if (!carouselApi) return;
    const intervalId = setInterval(() => {
      carouselApi.scrollNext();
    }, 6000);
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
    return () => clearInterval(intervalId);
  }, [carouselApi]);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Initialising Zenith Core...</p>
      </div>
    );
  }

  const watchingAnime = watchlist.filter(a => a.status === 'WATCHING');

  return (
    <div className="bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-[1920px] mx-auto overflow-x-hidden pb-12">
        <div className="space-y-10 animate-in fade-in duration-700">
          <section className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[350px] md:min-h-[600px] overflow-hidden">
            <Carousel 
              setApi={setCarouselApi} 
              className="w-full h-full"
              opts={{ loop: true, align: "start" }}
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
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 space-y-4 md:space-y-6 max-w-4xl">
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-0.5 md:px-3 md:py-1 bg-primary text-primary-foreground text-[8px] md:text-[10px] font-black italic rounded uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            TRENDING NOW
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[8px] md:text-[10px] font-bold rounded uppercase tracking-widest">
                            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent fill-current" /> {Math.round(anime.rating * 10)}%
                          </div>
                        </div>
                        
                        <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter text-glow leading-[0.9] line-clamp-2">
                          {anime.title.split(' ').map((word, i) => (
                            <span key={i} className={i % 2 === 1 ? 'text-primary' : 'text-white'}>
                              {word}{' '}
                            </span>
                          ))}
                        </h2>
                        
                        <p className="text-white/70 text-xs md:text-lg max-w-2xl line-clamp-2 md:line-clamp-3 font-medium italic">
                          {anime.description}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2 md:pt-4">
                          <Button 
                            onClick={() => addAnime(anime)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black italic px-6 md:px-10 h-10 md:h-14 rounded-full gap-2 text-sm md:text-lg shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4 md:w-6 md:h-6" /> ADD TO WATCHLIST
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 animate-pulse">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                )}
              </CarouselContent>
            </Carousel>

            <div className="absolute bottom-4 right-4 md:bottom-12 md:right-16 flex gap-1.5 md:gap-2 z-20">
              {trendingAnime.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => carouselApi?.scrollTo(i)}
                  className={`h-1 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 md:w-12 bg-primary' : 'w-2 md:w-4 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </section>

          <div className="px-4 md:px-12 space-y-16 md:space-y-20">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-12 md:space-y-16">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                      <History className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Recently Aired
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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

                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-widest flex items-center gap-3">
                      <Monitor className="w-5 h-5 md:w-6 md:h-6 text-accent" /> Active Feed
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {watchingAnime.slice(0, 5).map(anime => (
                      <AnimeCard 
                        key={anime.id} 
                        anime={anime} 
                        onUpdateStatus={updateAnimeStatus}
                        onUpdateEpisode={updateEpisodeProgress}
                        onRemove={removeAnime}
                      />
                    ))}
                    {watchingAnime.length === 0 && (
                      <div className="col-span-full py-16 md:py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/30" />
                        <p className="text-xs md:text-sm text-muted-foreground italic font-medium">Your active feed is currently offline.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 shrink-0 space-y-8">
                <div className="bg-card/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6 md:space-y-8 sticky top-24">
                  <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-white/5 pb-4">
                    <Zap className="w-4 h-4 fill-current" /> Profile Telemetry
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-muted-foreground font-black uppercase">Archive Volume</span>
                        <span className="font-bold text-base md:text-lg text-glow">{watchlist.reduce((acc, a) => acc + (a.currentEpisode || 0), 0)} EP</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (watchlist.length * 10))}%` }} 
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                      <span className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase">Mastered</span>
                      <span className="font-black text-lg md:text-xl text-accent">{watchlist.filter(a => a.status === 'COMPLETED').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                      <span className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase">Efficiency</span>
                      <span className="font-black text-lg md:text-xl text-primary">
                        {Math.round((watchlist.filter(a => a.status === 'COMPLETED').length / (watchlist.length || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="pt-8 pb-12">
              <div className="flex flex-col space-y-2 mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-glow">Analytic Insights</h2>
                <div className="h-1 w-16 md:w-20 bg-primary rounded-full" />
              </div>
              <GenreVisualizer watchlist={watchlist} />
            </section>

            <section className="pt-8 pb-12">
              <DiscoveryTool watchlist={watchlist} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
