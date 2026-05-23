'use client';

import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  Zap, 
  Info
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from '@/app/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group">
          <Bell className={cn("w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-12", unreadCount > 0 && "text-primary animate-pulse")} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        sideOffset={12}
        className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 glass-panel border-white/10 p-0 overflow-hidden mt-2 z-[100]"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-[10px] font-black italic uppercase tracking-widest text-white">Broadcast Center</h3>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-[9px] font-black uppercase text-primary hover:text-white transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "px-4 py-3 flex gap-4 transition-colors hover:bg-white/5 group relative",
                  !notification.isRead && "bg-primary/5"
                )}
              >
                {!notification.isRead && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                )}
                
                <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  {notification.type === 'EPISODE' ? (
                    <Calendar className="w-4 h-4 text-accent" />
                  ) : (
                    <Info className="w-4 h-4 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                      {notification.animeTitle || 'ZENITH BROADCAST'}
                    </p>
                    <span className="text-[8px] font-mono text-muted-foreground/60 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight italic font-medium">
                    {notification.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-40">
              <Bell className="w-8 h-8 text-muted-foreground" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">No active broadcasts</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
