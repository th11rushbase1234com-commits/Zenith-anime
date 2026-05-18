
'use client';

import { useState, useEffect } from 'react';
import { Anime, WatchStatus } from '../types/anime';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  where
} from 'firebase/firestore';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setIsLoaded(true);
      return;
    }

    const q = query(collection(db, 'watchlists'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Anime));
      setWatchlist(items);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  const addAnime = async (anime: Anime) => {
    if (!user) return;
    
    // Avoid duplicates
    if (watchlist.some(a => a.id === anime.id)) return;

    try {
      const animeRef = doc(db, 'watchlists', anime.id);
      await setDoc(animeRef, {
        ...anime,
        userId: user.uid,
        status: 'PLAN_TO_WATCH',
        currentEpisode: 0,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error adding anime:", e);
    }
  };

  const updateAnimeStatus = async (id: string, status: WatchStatus) => {
    if (!user) return;
    try {
      const animeRef = doc(db, 'watchlists', id);
      await updateDoc(animeRef, { status, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const updateEpisodeProgress = async (id: string, episode: number) => {
    if (!user) return;
    const anime = watchlist.find(a => a.id === id);
    if (!anime) return;

    const newEp = Math.max(0, Math.min(episode, anime.totalEpisodes || 999));
    let newStatus = anime.status;
    
    if (newEp === anime.totalEpisodes && anime.totalEpisodes > 0) {
      newStatus = 'COMPLETED';
    } else if (newEp > 0 && anime.status === 'PLAN_TO_WATCH') {
      newStatus = 'WATCHING';
    }

    try {
      const animeRef = doc(db, 'watchlists', id);
      await updateDoc(animeRef, { 
        currentEpisode: newEp, 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error updating episodes:", e);
    }
  };

  const removeAnime = async (id: string) => {
    if (!user) return;
    try {
      const animeRef = doc(db, 'watchlists', id);
      await deleteDoc(animeRef);
    } catch (e) {
      console.error("Error removing anime:", e);
    }
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
