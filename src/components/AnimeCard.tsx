'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Anime, WatchStatus } from '@/app/types/anime';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  Star, 
  Settings2, 
  Play,
  Clock,
  PauseCircle,
  XCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  existingItem?: Anime;
  onUpdateStatus?: (id: string, status: WatchStatus) => void;
  onUpdateEpisode?: (id: string, episode: number) => void;
  onRemove?: (id: string) => void;
  onAdd?: (anime: Anime, status: WatchStatus) => void;
}

export function AnimeCard({ 
  anime, 
  existingItem,
  onUpdateStatus, 
  onUpdateEpisode, 
  onRemove, 
  onAdd
}: AnimeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemInWatchlist = existingItem || (anime.status !== undefined && anime.id ? anime : undefined);
  const currentItem = itemInWatchlist || anime;
  
  const progress = currentItem.totalEpisodes > 0 
    ? (currentItem.currentEpisode / currentItem.totalEpisodes) * 100 
    : 0;

  const STATUS_CONFIG: Record<WatchStatus, { label: string; icon: any; color: string; bgColor: string }> = {
    WATCHING: { label: 'WATCHING', icon: Play, color: 'text-primary', bgColor: 'bg-primary/20' },
    PLAN_TO_WATCH: { label: 'PLAN TO WATCH', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
    COMPLETED: { label: 'COMPLETED', icon: CheckCircle2, color: 'text-accent', bgColor: 'bg-accent/20' },
    ON_HOLD: { label: 'ON HOLD', icon: PauseCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
    DROPPED: { label: 'DROPPED', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/20' },
  };

  const currentStatus = itemInWatchlist ? STATUS_CONFIG[itemInWatchlist.status] : null;

  const handleStatusSelect = (status: WatchStatus) => {
    if (itemInWatchlist) {
      onUpdateStatus?.(itemInWatchlist.id, status);
    } else {
      onAdd?.(anime, status);
    }
    setIsDialogOpen(false);
  };

  const handleRemove = () => {
    if (itemInWatchlist) {
      onRemove?.(itemInWatchlist.id);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="group relative flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative aspect-[3/4.2] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_25px_50px_rgba(0,0,0,0.8)] border border-white/5">
        <Image 
          src={currentItem.imageUrl} 
          alt={currentItem.title} 
          fill 
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.8] group-hover:brightness-[0.4]"
          data-ai-hint="anime poster"
        />
        
        {/* Context Badges */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 z-10">
          {currentStatus && (
            <div className={cn(
              "px-2.5 py-1 rounded-lg backdrop-blur-md text-[8px] font-black uppercase tracking-widest border border-white/5 w-fit flex items-center gap-1.5",
              currentStatus.bgColor,
              currentStatus.color
            )}>
              <currentStatus.icon className="w-2.5 h-2.5" />
              {currentStatus.label}
            </div>
          )}
          <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10 w-fit">
            {currentItem.totalEpisodes > 0 ? `${currentItem.totalEpisodes} EP` : 'MOVIE'}
          </div>
        </div>

        {/* Rating Badge */}
        {currentItem.rating > 0 && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 rounded-lg bg-accent text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-1 shadow-lg z-10">
            <Star className="w-2.5 h-2.5 fill-current" /> {currentItem.rating.toFixed(1)}
          </div>
        )}

        {/* Interaction Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/80 to-transparent p-5 flex flex-col justify-end gap-4 z-20">
          <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 text-primary" />
              <h4 className="text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">ZENITH INTEL</h4>
            </div>
            <p className="text-[11px] text-white/70 line-clamp-3 leading-relaxed font-medium italic">
              {currentItem.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 pt-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className={cn(
                    "w-full font-black italic rounded-xl text-[10px] h-11 transition-all",
                    itemInWatchlist 
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/10" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  )}
                >
                  {itemInWatchlist ? (
                    <><Settings2 className="w-4 h-4 mr-2" /> EDIT WATCHLIST</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> ADD TO WATCHLIST</>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10 max-w-[320px] rounded-[2rem] p-6">
                <DialogHeader>
                  <DialogTitle className="text-sm font-black italic uppercase tracking-widest text-primary text-center">
                    WATCHLIST PORTAL
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 pt-4">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center mb-2">Select Sector</p>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <Button
                      key={status}
                      variant="ghost"
                      onClick={() => handleStatusSelect(status as WatchStatus)}
                      className={cn(
                        "h-12 justify-start gap-4 rounded-2xl px-4 font-black uppercase text-[10px] tracking-widest border border-transparent transition-all",
                        itemInWatchlist?.status === status 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "hover:bg-white/5 text-muted-foreground hover:text-white"
                      )}
                    >
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </Button>
                  ))}
                  {itemInWatchlist && (
                    <Button
                      variant="ghost"
                      onClick={handleRemove}
                      className="h-12 justify-start gap-4 rounded-2xl px-4 font-black uppercase text-[10px] tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      PURGE RECORD
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {itemInWatchlist && itemInWatchlist.status === 'WATCHING' && (
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => onUpdateEpisode?.(itemInWatchlist.id, itemInWatchlist.currentEpisode + 1)} 
                className="w-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 font-black italic rounded-xl h-11 text-[9px] transition-all"
              >
                <ChevronRight className="w-4 h-4 mr-1.5" /> INCREMENT EPISODE
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {itemInWatchlist && itemInWatchlist.status === 'WATCHING' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-30">
            <div 
              className="h-full bg-primary shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="px-2 flex flex-col gap-1">
        <h3 className="font-black text-[14px] md:text-[15px] leading-tight line-clamp-1 text-white group-hover:text-primary transition-colors tracking-tight italic uppercase">
          {currentItem.title}
        </h3>
        <div className="flex items-center justify-between opacity-60">
          <div className="flex items-center gap-2">
             <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-primary/60" /> {itemInWatchlist ? `${itemInWatchlist.currentEpisode} / ` : ''}{currentItem.totalEpisodes || '?'} EP
            </span>
          </div>
          <span className="text-[8px] text-white/40 font-black uppercase italic flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> {currentItem.year || 'TBA'}
          </span>
        </div>
      </div>
    </div>
  );
}
