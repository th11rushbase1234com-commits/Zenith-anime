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
  MoreVertical,
  Activity
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

  const STATUS_CONFIG: Record<WatchStatus, { label: string; icon: any; color: string; bgColor: string }> = {
    WATCHING: { label: 'WATCHING', icon: Play, color: 'text-primary', bgColor: 'bg-primary/20' },
    PLAN_TO_WATCH: { label: 'PLAN TO WATCH', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
    COMPLETED: { label: 'COMPLETED', icon: CheckCircle2, color: 'text-accent', bgColor: 'bg-accent/20' },
    ON_HOLD: { label: 'ON HOLD', icon: PauseCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
    DROPPED: { label: 'DROPPED', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/20' },
  };

  const currentStatus = STATUS_CONFIG[anime.status] || STATUS_CONFIG.PLAN_TO_WATCH;

  return (
    <div className="group relative flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative aspect-[3/4.2] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
        <Image 
          src={anime.imageUrl} 
          alt={anime.title} 
          fill 
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.8] group-hover:brightness-50"
          data-ai-hint="anime poster"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 z-10">
          <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10 w-fit">
            {anime.totalEpisodes > 0 ? `${anime.totalEpisodes} EP` : 'MOVIE'}
          </div>
          {!isSearchMode && (
            <div className={`px-2.5 py-1 rounded-lg ${currentStatus.bgColor} backdrop-blur-md text-[8px] font-black ${currentStatus.color} uppercase tracking-widest border border-white/5 w-fit flex items-center gap-1.5`}>
              <currentStatus.icon className="w-2.5 h-2.5" />
              {currentStatus.label}
            </div>
          )}
        </div>

        {/* Floating Rating */}
        {anime.rating > 0 && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 rounded-lg bg-accent text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-1 shadow-lg z-10">
            <Star className="w-2.5 h-2.5 fill-current" /> {anime.rating}
          </div>
        )}

        {/* Interaction Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/80 to-transparent p-5 flex flex-col justify-end gap-5 z-20">
          <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">SYNOPSIS</h4>
            <p className="text-[11px] text-white/70 line-clamp-3 leading-relaxed font-medium italic">
              {anime.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 pt-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
            {isSearchMode ? (
              <Button 
                size="sm" 
                onClick={() => onAdd?.(anime)} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black italic rounded-xl text-[10px] h-12 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                <Plus className="w-4 h-4 mr-2" /> ADD TO ARCHIVE
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black italic rounded-xl h-11 text-[9px] backdrop-blur-md transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                        MANAGE
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-panel border-white/10 w-52 p-2">
                      <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-primary/60 pb-2">ARCHIVE STATUS</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/5" />
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => onUpdateStatus?.(anime.id, status as WatchStatus)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all ${anime.status === status ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-white'}`}
                        >
                          <config.icon className="w-3.5 h-3.5" /> {config.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem 
                        onClick={() => onRemove?.(anime.id)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-destructive/10 text-[9px] font-black uppercase tracking-widest text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> PURGE RECORD
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => onUpdateEpisode?.(anime.id, anime.currentEpisode + 1)} 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-black italic rounded-xl h-11 text-[9px] shadow-lg transition-transform active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" /> EP +1
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!isSearchMode && anime.status === 'WATCHING' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
            <div 
              className="h-full bg-primary shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="px-2 flex flex-col gap-1">
        <h3 className="font-black text-[14px] md:text-[16px] leading-tight line-clamp-1 text-white group-hover:text-primary transition-colors tracking-tight italic uppercase">
          {anime.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-primary/60" /> {anime.currentEpisode} / {anime.totalEpisodes || '?'} EP
            </span>
          </div>
          <span className="text-[9px] text-white/30 font-black uppercase italic">{anime.year || 'TBA'}</span>
        </div>
      </div>
    </div>
  );
}
