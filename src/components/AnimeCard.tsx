'use client';

import React, { useState, useEffect } from 'react';
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
  Tv
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { scrapeLiveTelemetry } from '@/services/scraper-engine';

interface AnimeCardProps {
  anime: Anime;
  existingItem?: Anime;
  onUpdateStatus?: (id: string, status: WatchStatus) => void;
  onRemove?: (id: string) => void;
  onAdd?: (anime: Anime, status: WatchStatus) => void;
}

export function AnimeCard({ 
  anime, 
  existingItem,
  onUpdateStatus, 
  onRemove, 
  onAdd
}: AnimeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<{ sub: number; dub: number }>({ 
    sub: anime.subCount || anime.totalEpisodes || 0, 
    dub: anime.dubCount || 0 
  });
  
  const itemInWatchlist = existingItem || (anime.status !== undefined && (anime as any).userId ? anime : undefined);
  const currentItem = itemInWatchlist || anime;

  useEffect(() => {
    let isMounted = true;
    async function fetchTelemetry() {
      if (!currentItem.id || currentItem.id === '0') return;
      // AnixTV/Anify Greedy Protocol V14.0
      const data = await scrapeLiveTelemetry(currentItem.id, currentItem.title);
      if (isMounted) {
        setTelemetry({
          sub: data.sub > 0 ? data.sub : (currentItem.totalEpisodes || 0),
          dub: data.dub
        });
      }
    }
    fetchTelemetry();
    return () => { isMounted = false; };
  }, [currentItem.id, currentItem.title, currentItem.totalEpisodes]);

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
    <div className="group relative flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 font-body">
      {/* Poster Section */}
      <div className="relative aspect-[3/4.2] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_25px_50px_rgba(0,0,0,0.8)] border border-white/5">
        <Image 
          src={currentItem.imageUrl} 
          alt={currentItem.title} 
          fill 
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.8] group-hover:brightness-[0.4]"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 z-10">
          {currentStatus && (
            <div className={cn(
              "px-2 py-0.5 rounded-lg backdrop-blur-md text-[7px] font-black uppercase tracking-tight border border-white/5 w-fit flex items-center gap-1",
              currentStatus.bgColor,
              currentStatus.color
            )}>
              <currentStatus.icon className="w-2.5 h-2.5" />
              {currentStatus.label}
            </div>
          )}
        </div>

        {/* Rating Badge */}
        {currentItem.rating > 0 && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2 py-0.5 rounded-lg bg-accent text-[8px] font-black text-black uppercase tracking-tight flex items-center gap-1 shadow-lg z-10">
            <Star className="w-2.5 h-2.5 fill-current" /> {currentItem.rating.toFixed(1)}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col justify-end gap-3 z-20">
          <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 text-primary" />
              <h4 className="text-[7px] font-black text-primary uppercase tracking-widest leading-none">ZENITH INTEL</h4>
            </div>
            <p className="text-[9px] text-white/70 line-clamp-3 leading-tight font-black uppercase">
              {currentItem.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 pt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className={cn(
                    "w-full font-black rounded-lg text-[8px] h-9 transition-all uppercase tracking-widest flex items-center justify-center px-1 shrink-0 border border-white/5 shadow-none",
                    itemInWatchlist 
                      ? "bg-white/10 hover:bg-white/20 text-white" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  )}
                >
                  {itemInWatchlist ? (
                    <><Settings2 className="w-3.5 h-3.5 mr-1.5 shrink-0" /> EDIT WATCHLIST</>
                  ) : (
                    <><Plus className="w-3.5 h-3.5 mr-1.5 shrink-0" /> ADD TO WATCHLIST</>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10 max-w-[320px] rounded-[2rem] p-6">
                <DialogHeader>
                  <DialogTitle className="text-sm font-black uppercase tracking-widest text-primary text-center">
                    {itemInWatchlist ? 'MANAGEMENT PORTAL' : 'INITIALIZATION PORTAL'}
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
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <Button
                        variant="ghost"
                        onClick={handleRemove}
                        className="w-full h-12 justify-center gap-4 rounded-2xl px-4 font-black uppercase text-[10px] tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        PURGE RECORD
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Info Section - Prim & Proper UI */}
      <div className="px-1 flex flex-col gap-2">
        <h3 className="font-black text-[11px] md:text-[12px] leading-tight line-clamp-1 text-white group-hover:text-primary transition-colors tracking-tight uppercase">
          {currentItem.title}
        </h3>
        
        {/* DUAL-CHANNEL TELEMETRY */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* SUB CHANNEL (Grey) */}
          <div className="flex items-center bg-white/10 rounded-md px-2 py-1 border border-white/5 shrink-0 h-7">
            <Tv className="w-3 h-3 text-white/60 mr-1.5" />
            <span className="text-[8px] font-black text-white/80 uppercase tracking-wider leading-none">
              SUB {telemetry.sub}
            </span>
          </div>
          
          {/* DUB CHANNEL (Purple) */}
          <div className={cn(
            "flex items-center rounded-md px-2 py-1 border shrink-0 transition-all duration-300 h-7",
            telemetry.dub > 0 
              ? "bg-primary/20 border-primary/30 opacity-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]" 
              : "bg-white/5 border-white/5 opacity-30"
          )}>
            <Tv className={cn("w-3 h-3 mr-1.5", telemetry.dub > 0 ? "text-primary" : "text-white/40")} />
            <span className={cn(
              "text-[8px] font-black uppercase tracking-wider leading-none",
              telemetry.dub > 0 ? "text-primary" : "text-white/40"
            )}>
              DUB {telemetry.dub}
            </span>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between opacity-50 mt-0.5">
          <span className="text-[7px] text-white/40 font-black uppercase flex items-center gap-1 tracking-widest">
            <Calendar className="w-2.5 h-2.5" /> {currentItem.year || 'TBA'}
          </span>
          {currentItem.genres && currentItem.genres.length > 0 && (
            <span className="text-[7px] text-primary/60 font-black uppercase tracking-widest truncate max-w-[70px] text-right">
              {currentItem.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
