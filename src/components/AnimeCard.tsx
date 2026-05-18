'use client';

import React from 'react';
import Image from 'next/image';
import { Anime, WatchStatus } from '@/app/types/anime';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Check, Clock, Plus, Trash2, ChevronRight, Hash } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnimeCardProps {
  anime: Anime;
  onUpdateStatus?: (id: string, status: WatchStatus) => void;
  onUpdateEpisode?: (id: string, episode: number) => void;
  onRemove?: (id: string) => void;
  onAdd?: (anime: Anime) => void;
  isSearchMode?: boolean;
}

export function AnimeCard({ 
  anime, 
  onUpdateStatus, 
  onUpdateEpisode, 
  onRemove, 
  onAdd,
  isSearchMode = false 
}: AnimeCardProps) {
  const progress = (anime.currentEpisode / anime.totalEpisodes) * 100;

  return (
    <Card className="group relative overflow-hidden bg-card/40 border-none anime-card-hover rounded-2xl ring-1 ring-white/5">
      <div className="relative aspect-[3/4] w-full">
        <Image 
          src={anime.imageUrl} 
          alt={anime.title} 
          fill 
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px] brightness-90 group-hover:brightness-50"
          data-ai-hint="anime character"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-80" />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-tighter">
            <Hash className="w-3 h-3 text-primary" /> {anime.year}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {anime.status === 'WATCHING' && (
            <Badge variant="default" className="bg-primary text-primary-foreground font-black italic shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              ACTIVE
            </Badge>
          )}
          {anime.status === 'COMPLETED' && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground font-black italic shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              MASTERED
            </Badge>
          )}
        </div>

        {/* Hover Controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="flex flex-col gap-3 w-full">
            {isSearchMode ? (
              <Button size="lg" onClick={() => onAdd?.(anime)} className="w-full bg-accent hover:bg-accent/80 text-accent-foreground font-black italic rounded-xl">
                <Plus className="w-5 h-5 mr-2" /> INITIALIZE
              </Button>
            ) : (
              <>
                {anime.status !== 'WATCHING' && (
                  <Button size="lg" variant="secondary" onClick={() => onUpdateStatus?.(anime.id, 'WATCHING')} className="w-full bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary font-black italic rounded-xl">
                    <Play className="w-5 h-5 mr-2" /> RESUME
                  </Button>
                )}
                <Button size="lg" variant="secondary" onClick={() => onUpdateEpisode?.(anime.id, anime.currentEpisode + 1)} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black italic rounded-xl">
                   <ChevronRight className="w-5 h-5 mr-2" /> NEXT EPISODE
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onRemove?.(anime.id)} className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 font-bold text-xs">
                  <Trash2 className="w-3 h-3 mr-2" /> PURGE RECORD
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 relative z-10 bg-card/60 backdrop-blur-md">
        <div className="space-y-1">
          <h3 className="font-headline font-bold text-base leading-tight line-clamp-2 text-white group-hover:text-primary transition-colors italic tracking-tight uppercase">
            {anime.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {anime.genres.slice(0, 2).map(g => (
              <span key={g} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-muted-foreground font-bold uppercase tracking-widest">
                {g}
              </span>
            ))}
          </div>
        </div>

        {!isSearchMode && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-end text-[10px] font-mono">
              <span className="text-muted-foreground uppercase tracking-widest">Progress</span>
              <span className="text-white font-bold">{anime.currentEpisode} / {anime.totalEpisodes}</span>
            </div>
            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
