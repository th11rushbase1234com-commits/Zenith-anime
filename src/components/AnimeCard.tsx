
'use client';

import React from 'react';
import Image from 'next/image';
import { Anime, WatchStatus } from '@/app/types/anime';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  Hash, 
  Star, 
  Settings2, 
  CheckCircle2,
  Play,
  Clock,
  PauseCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const STATUS_CONFIG: Record<WatchStatus, { label: string; icon: any; color: string }> = {
    WATCHING: { label: 'ACTIVE', icon: Play, color: 'text-primary' },
    PLAN_TO_WATCH: { label: 'QUEUED', icon: Clock, color: 'text-muted-foreground' },
    COMPLETED: { label: 'MASTERED', icon: CheckCircle2, color: 'text-accent' },
    ON_HOLD: { label: 'STALLED', icon: PauseCircle, color: 'text-yellow-500' },
    DROPPED: { label: 'PURGED', icon: XCircle, color: 'text-destructive' },
  };

  const currentStatus = STATUS_CONFIG[anime.status] || STATUS_CONFIG.PLAN_TO_WATCH;

  return (
    <div className="group relative flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative aspect-[3/4.2] rounded-[1.5rem] overflow-hidden bg-white/5 shadow-xl transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        <Image 
          src={anime.imageUrl} 
          alt={anime.title} 
          fill 
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.85] group-hover:brightness-50"
          data-ai-hint="anime poster"
        />
        
        {/* Status/Rating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10 w-fit">
            {anime.totalEpisodes > 0 ? `${anime.totalEpisodes} EP` : 'MOVIE'}
          </div>
          {anime.rating > 0 && (
            <div className="px-2 py-1 rounded-lg bg-accent/90 backdrop-blur-md text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-1 w-fit shadow-lg">
              <Star className="w-2.5 h-2.5 fill-current" /> {anime.rating}
            </div>
          )}
        </div>

        {/* Hover Information Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/60 to-transparent p-5 flex flex-col justify-end gap-4 z-20">
          <div className="space-y-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Synopsis</h4>
            <p className="text-[11px] text-white/80 line-clamp-3 leading-relaxed font-medium">
              {anime.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 pt-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
            {isSearchMode ? (
              <Button 
                size="sm" 
                onClick={() => onAdd?.(anime)} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black italic rounded-xl text-[10px] h-10 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" /> ADD TO LIST
              </Button>
            ) : (
              <>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black italic rounded-xl h-10 text-[9px] backdrop-blur-sm"
                      >
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                        STATUS
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-panel border-white/10 w-48">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-primary">MANAGE RECORD</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => onUpdateStatus?.(anime.id, status as WatchStatus)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 text-[9px] font-bold uppercase tracking-widest ${anime.status === status ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                        >
                          <config.icon className="w-3.5 h-3.5" /> {config.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem 
                        onClick={() => onRemove?.(anime.id)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-destructive/10 text-[9px] font-bold uppercase tracking-widest text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> PURGE RECORD
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => onUpdateEpisode?.(anime.id, anime.currentEpisode + 1)} 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-black italic rounded-xl h-10 text-[9px] shadow-lg"
                  >
                    <ChevronRight className="w-3.5 h-3.5 mr-1" /> EP +1
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress bar on card for active ones */}
        {!isSearchMode && anime.status === 'WATCHING' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
            <div 
              className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      <div className="px-1 flex flex-col gap-1.5">
        <h3 className="font-bold text-[15px] leading-tight line-clamp-1 text-white group-hover:text-primary transition-colors tracking-tight">
          {anime.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
              <currentStatus.icon className={`w-3 h-3 ${currentStatus.color}`} /> {anime.currentEpisode} / {anime.totalEpisodes || '?'}
            </span>
          </div>
          <span className="text-[10px] text-white/40 font-bold uppercase">{anime.year || 'TBA'}</span>
        </div>
      </div>
    </div>
  );
}
