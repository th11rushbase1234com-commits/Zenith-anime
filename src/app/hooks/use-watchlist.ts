
'use client';

import { useState, useEffect } from 'react';
import { Anime, WatchStatus } from '../types/anime';
import { INITIAL_ANIME } from '../lib/mock-data';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zenith-watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        setWatchlist(INITIAL_ANIME);
      }
    } else {
      setWatchlist(INITIAL_ANIME);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('zenith-watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addAnime = (anime: Anime) => {
    setWatchlist(prev => {
      // Avoid duplicates
      if (prev.some(a => a.id === anime.id)) return prev;
      return [...prev, { ...anime, status: 'PLAN_TO_WATCH', currentEpisode: 0 }];
    });
  };

  const updateAnimeStatus = (id: string, status: WatchStatus) => {
    setWatchlist(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateEpisodeProgress = (id: string, episode: number) => {
    setWatchlist(prev => prev.map(a => {
      if (a.id === id) {
        const newEp = Math.max(0, Math.min(episode, a.totalEpisodes || 999));
        let newStatus = a.status;
        
        if (newEp === a.totalEpisodes && a.totalEpisodes > 0) {
          newStatus = 'COMPLETED';
        } else if (newEp > 0 && a.status === 'PLAN_TO_WATCH') {
          newStatus = 'WATCHING';
        }

        return { ...a, currentEpisode: newEp, status: newStatus };
      }
      return a;
    }));
  };

  const removeAnime = (id: string) => {
    setWatchlist(prev => prev.filter(a => a.id !== id));
  };

  return {
    watchlist,
    isLoaded,
    addAnime,
    updateAnimeStatus,
    updateEpisodeProgress,
    removeAnime
  };
}
