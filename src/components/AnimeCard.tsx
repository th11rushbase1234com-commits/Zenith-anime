'use client';

import React from 'react';
import Image from 'next/image';
import { Anime, WatchStatus } from '@/app/types/anime';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronRight, Hash, Eye, Settings2, CheckCircle2 } from 'lucide-react';
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
  const progress = anime.totalEpisodes > 0 ? (anime.currentEpisode / anime.totalEpisodes) * 100 : 0;

  return (
    <div className="group relative flex flex-col gap-2 w-full">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 shadow-2xl transition-transform duration-500 hover:scale-[1.02] active:scale-[0.98]">
        <Image 
          src={anime.imageUrl} 
          alt={anime.title} 
          fill 
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-50"
          data-ai-hint="anime character"
        />
        
        {/* Quality/Type Tags */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          <div className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
            TV
          </div>
          {anime.year > 0 && (
            <div className="px-1.5 py-0.5 rounded bg-primary/80 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest">
              {anime.year}
            </div>
          )}
        </div>

        {/* Hover Information Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end gap-3 z-20">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Archive Data</h4>
            <p className="text-[10px] text-white/70 line-clamp-3 leading-relaxed font-medium">
              {anime.description.substring(0, 100)}...
            </p>
          </div>
          
          <div className="flex flex-col gap-2 pt-2">
            {isSearchMode ? (
              <Button size="sm" onClick={() => onAdd?.(anime)} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-black italic rounded-full text-[10px] h-8">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> ADD TO ARCHIVE
              </Button>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => onUpdateStatus?.(anime.id, anime.status === 'COMPLETED' ? 'WATCHING' : 'COMPLETED')} 
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black italic rounded-full h-8 text-[9px]"
                  >
                    {anime.status === 'COMPLETED' ? <Settings2 className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {anime.status === 'COMPLETED' ? 'MANAGE' : 'FINISH'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => onUpdateEpisode?.(anime.id, anime.currentEpisode + 1)} 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-black italic rounded-full h-8 text-[9px]"
                  >
                    <ChevronRight className="w-3 h-3 mr-1" /> EP +1
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onRemove?.(anime.id)} className="w-full text-white/40 hover:text-destructive hover:bg-destructive/10 font-bold text-[9px] h-6 rounded-full">
                  <Trash2 className="w-3 h-3 mr-1" /> PURGE RECORD
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar on card for active ones */}
        {!isSearchMode && anime.status === 'WATCHING' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      <div className="px-1 py-1 flex flex-col gap-1.5">
        <h3 className="font-bold text-sm leading-tight line-clamp-1 text-white group-hover:text-primary transition-colors tracking-tight uppercase">
          {anime.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
             <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
              <Hash className="w-2.5 h-2.5 text-primary" /> {anime.currentEpisode}/{anime.totalEpisodes || '??'} EP
            </span>
          </div>
          {anime.rating > 0 && (
            <span className="text-[9px] text-accent font-black tracking-widest flex items-center gap-1">
              <Eye className="w-3 h-3" /> {anime.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
