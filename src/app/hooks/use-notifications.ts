'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  addDoc
} from 'firebase/firestore';
import { ZenithNotification } from '../types/notification';
import { getRecentAiring } from '@/services/anilist';
import { useWatchlist } from './use-watchlist';

export function useNotifications() {
  const [notifications, setNotifications] = useState<ZenithNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ZenithNotification));
      
      const processedItems = items
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);

      setNotifications(processedItems);
      setUnreadCount(items.filter(i => !i.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || watchlist.length === 0) return;

    const checkNewEpisodes = async () => {
      try {
        const recentAiring = await getRecentAiring();
        
        for (const aired of recentAiring) {
          const inWatchlist = watchlist.find(w => w.id === aired.id);
          if (inWatchlist && (inWatchlist.status === 'WATCHING' || inWatchlist.status === 'PLAN_TO_WATCH')) {
            const alreadyNotified = notifications.some(n => 
              n.animeId === aired.id && 
              n.type === 'EPISODE' &&
              n.episodeNumber === aired.lastAiredEpisode
            );
            
            if (!alreadyNotified && aired.lastAiredEpisode) {
              addDoc(collection(db, 'notifications'), {
                userId: user.uid,
                animeId: aired.id,
                animeTitle: aired.title,
                message: `Episode ${aired.lastAiredEpisode} of ${aired.title} is now available!`,
                type: 'EPISODE',
                isRead: false,
                episodeNumber: aired.lastAiredEpisode,
                createdAt: new Date().toISOString()
              }).catch(() => {});
            }
          }
        }
      } catch (err) {}
    };

    const timer = setTimeout(checkNewEpisodes, 3000);
    return () => clearTimeout(timer);
  }, [user, watchlist, notifications]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    const ref = doc(db, 'notifications', id);
    updateDoc(ref, { isRead: true }).catch(() => {});
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const batchPromises = notifications
      .filter(n => !n.isRead)
      .map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true }));
    await Promise.all(batchPromises).catch(() => {});
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    deleteDoc(doc(db, 'notifications', id)).catch(() => {});
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
