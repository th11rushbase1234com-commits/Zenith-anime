
'use client';

import React from 'react';
import Image from 'next/image';
import { Anime, WatchStatus } from '@/app/types/anime';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Check, Clock, Plus, Trash2, ChevronRight } from 'lucide-react';
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
    <Card className="group relative overflow-hidden bg-card border-none anime-card-hover">
      <div className="relative aspect-[2/3] w-full">
        <Image 
          src={anime.imageUrl} 
          alt={anime.title} 
          fill 
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {anime.status === 'WATCHING' && <Badge variant="default" className="bg-primary text-primary-foreground">Watching</Badge>}
          {anime.status === 'COMPLETED' && <Badge variant="secondary" className="bg-green-500/80 text-white">Done</Badge>}
          {anime.status === 'PLAN_TO_WATCH' && <Badge variant="outline" className="bg-black/40 text-white border-white/20">Queue</Badge>}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-2 justify-center">
            {isSearchMode ? (
              <Button size="sm" onClick={() => onAdd?.(anime)} className="w-full bg-accent hover:bg-accent/80">
                <Plus className="w-4 h-4 mr-2" /> Add to List
              </Button>
            ) : (
              <>
                {anime.status !== 'WATCHING' && (
                  <Button size="icon" variant="secondary" onClick={() => onUpdateStatus?.(anime.id, 'WATCHING')} className="rounded-full">
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                <Button size="icon" variant="secondary" onClick={() => onUpdateEpisode?.(anime.id, anime.currentEpisode + 1)} className="rounded-full">
                   <ChevronRight className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onRemove?.(anime.id)} className="rounded-full">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-headline font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{anime.title}</h3>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{anime.year}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {anime.genres.slice(0, 2).map(g => (
            <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{g}</span>
          ))}
        </div>

        {!isSearchMode && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Ep {anime.currentEpisode} / {anime.totalEpisodes}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-secondary [&>div]:bg-primary" />
          </div>
        )}
      </div>
    </Card>
  );
}
