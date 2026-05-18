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

    setIsLoaded(false);

    // Ensure the query matches the security rules
    const q = query(
      collection(db, 'watchlists'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Anime));
      setWatchlist(items);
      setIsLoaded(true);
    }, (error) => {
      // Handle the permission error gracefully
      if (error.code === 'permission-denied') {
        console.warn("Zenith Watchlist: Waiting for permissions or index sync...");
      } else {
        console.error("Zenith Watchlist Error:", error.message);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  const addAnime = async (anime: Anime) => {
    if (!user) return;
    
    // Check local state first to prevent unnecessary writes
    if (watchlist.some(a => a.id === anime.id)) return;

    const animeRef = doc(db, 'watchlists', anime.id);
    setDoc(animeRef, {
      ...anime,
      userId: user.uid,
      status: 'PLAN_TO_WATCH',
      currentEpisode: 0,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(err => {
      console.error("Failed to add anime:", err);
    });
  };

  const updateAnimeStatus = async (id: string, status: WatchStatus) => {
    if (!user) return;
    const animeRef = doc(db, 'watchlists', id);
    updateDoc(animeRef, { 
      status, 
      updatedAt: new Date().toISOString() 
    }).catch(err => {
      console.error("Failed to update status:", err);
    });
  };

  const updateEpisodeProgress = async (id: string, episode: number) => {
    if (!user) return;
    const anime = watchlist.find(a => a.id === id);
    if (!anime) return;

    const newEp = Math.max(0, Math.min(episode, anime.totalEpisodes || 999));
    let newStatus = anime.status;
    
    if (anime.totalEpisodes > 0 && newEp === anime.totalEpisodes) {
      newStatus = 'COMPLETED';
    } else if (newEp > 0 && anime.status === 'PLAN_TO_WATCH') {
      newStatus = 'WATCHING';
    }

    const animeRef = doc(db, 'watchlists', id);
    updateDoc(animeRef, { 
      currentEpisode: newEp, 
      status: newStatus,
      updatedAt: new Date().toISOString()
    }).catch(err => {
      console.error("Failed to update progress:", err);
    });
  };

  const removeAnime = async (id: string) => {
    if (!user) return;
    const animeRef = doc(db, 'watchlists', id);
    deleteDoc(animeRef).catch(err => {
      console.error("Failed to remove anime:", err);
    });
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
