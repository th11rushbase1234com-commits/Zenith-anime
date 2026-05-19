
'use client';

import { useState, useEffect } from 'react';
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
  where,
  orderBy,
  addDoc,
  getDocs,
  limit
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
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ZenithNotification));
      setNotifications(items);
      setUnreadCount(items.filter(i => !i.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync logic to check for new episodes and generate notifications
  useEffect(() => {
    if (!user || watchlist.length === 0) return;

    const checkNewEpisodes = async () => {
      try {
        const recentAiring = await getRecentAiring();
        
        for (const aired of recentAiring) {
          const inWatchlist = watchlist.find(w => w.id === aired.id);
          if (inWatchlist && (inWatchlist.status === 'WATCHING' || inWatchlist.status === 'PLAN_TO_WATCH')) {
            // Check if we already notified for this anime today
            const existingQ = query(
              collection(db, 'notifications'),
              where('userId', '==', user.uid),
              where('animeId', '==', aired.id),
              where('type', '==', 'EPISODE'),
              limit(1)
            );
            
            const existing = await getDocs(existingQ);
            
            // For MVP, we only notify if NO notification exists for this anime yet
            // In a full app, we'd check against aired.nextAiringEpisode.episode
            if (existing.empty) {
              await addDoc(collection(db, 'notifications'), {
                userId: user.uid,
                animeId: aired.id,
                animeTitle: aired.title,
                message: `New episode released for ${aired.title}! Check it out.`,
                type: 'EPISODE',
                isRead: false,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (err) {
        console.error("Notification sync error:", err);
      }
    };

    checkNewEpisodes();
  }, [user, watchlist.length]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    const ref = doc(db, 'notifications', id);
    await updateDoc(ref, { isRead: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const batchPromises = notifications
      .filter(n => !n.isRead)
      .map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true }));
    await Promise.all(batchPromises);
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'notifications', id));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
