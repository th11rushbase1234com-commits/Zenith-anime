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
  Calendar
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
  
  const itemInWatchlist = existingItem || (anime.status !== undefined && (anime as any).userId ? anime : undefined);
  const currentItem = itemInWatchlist || anime;

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
    <div className="group relative flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 font-body h-full">
      <div className="relative aspect-[3/4.2] rounded-[1.25rem] md:rounded-[2rem] overflow-hidden bg-white/5 shadow-2xl transition-all duration-500 border border-white/5 isolate transform-gpu [backface-visibility:hidden] [transform:translateZ(0)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] shrink-0">
        <Image 
          src={currentItem.imageUrl} 
          alt={currentItem.title} 
          fill 
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-1000 md:group-hover:scale-110 brightness-[0.85] md:group-hover:brightness-[0.4]"
        />
        
        <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 z-10 pointer-events-none">
          {currentStatus && (
            <div className={cn(
              "px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg backdrop-blur-md text-[6px] md:text-[7px] font-black uppercase tracking-tight border border-white/5 flex items-center gap-1",
              currentStatus.bgColor,
              currentStatus.color
            )}>
              <currentStatus.icon className="w-2 h-2 md:w-2.5 md:h-2.5" />
              {currentStatus.label}
            </div>
          )}
        </div>

        {currentItem.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg bg-accent text-[7px] md:text-[8px] font-black text-black uppercase tracking-tight flex items-center gap-1 shadow-lg z-10 pointer-events-none">
            <Star className="w-2 h-2 md:w-2.5 md:h-2.5 fill-current" /> {Math.round(currentItem.rating * 10)}%
          </div>
        )}
      </div>

      <div className="px-1 flex flex-col gap-1.5 flex-1 h-full">
        <div className="space-y-1">
          <h3 className="font-black text-[10px] md:text-[12px] leading-tight line-clamp-2 text-white group-hover:text-primary transition-colors tracking-tight uppercase min-h-[2.4em]">
            {currentItem.title}
          </h3>
          
          <p className="text-[9px] md:text-[10px] text-white/50 italic line-clamp-2 leading-tight font-medium min-h-[2.4em]">
            {currentItem.description}
          </p>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-white/40">
              <Calendar className="w-2.5 h-2.5" />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none">
                {currentItem.year || 'TBA'}
              </span>
            </div>
            {currentItem.genres?.[0] && (
              <span className="text-[7px] md:text-[8px] text-primary/60 font-black uppercase tracking-widest truncate max-w-[70px] md:max-w-[100px] text-right">
                {currentItem.genres[0]}
              </span>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className={cn(
                  "w-full font-black rounded-xl text-[7px] md:text-[8px] h-8 md:h-9 transition-all uppercase tracking-widest flex items-center justify-center border border-white/5 shadow-none",
                  itemInWatchlist 
                    ? "bg-white/5 hover:bg-white/10 text-white" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                )}
              >
                {itemInWatchlist ? (
                  <><Settings2 className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 shrink-0" /> EDIT WATCHLIST</>
                ) : (
                  <><Plus className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 shrink-0" /> ADD TO WATCHLIST</>
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
  );
}
