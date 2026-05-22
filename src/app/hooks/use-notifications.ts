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
  addDoc,
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

    // Single-field query to avoid composite index requirement
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ZenithNotification));
      
      // Perform sorting and limiting client-side
      const processedItems = items
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);

      setNotifications(processedItems);
      setUnreadCount(items.filter(i => !i.isRead).length);
    }, (error) => {
      if (error.code === 'failed-precondition') {
        console.warn("Zenith Notifications: Index missing, falling back to manual sort.");
      } else {
        console.error("Zenith Notifications Error:", error);
      }
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
            // Check against current state to prevent duplicates without extra Firestore queries
            const alreadyNotified = notifications.some(n => 
              n.animeId === aired.id && 
              n.type === 'EPISODE'
            );
            
            if (!alreadyNotified) {
              addDoc(collection(db, 'notifications'), {
                userId: user.uid,
                animeId: aired.id,
                animeTitle: aired.title,
                message: `New episode released for ${aired.title}! Check it out.`,
                type: 'EPISODE',
                isRead: false,
                createdAt: new Date().toISOString()
              }).catch(err => console.error("Failed to create notification:", err));
            }
          }
        }
      } catch (err) {
        console.error("Notification sync error:", err);
      }
    };

    const timer = setTimeout(checkNewEpisodes, 3000); // Debounce sync
    return () => clearTimeout(timer);
  }, [user, watchlist, notifications]); // Added notifications to dependencies for duplicate check

  const markAsRead = async (id: string) => {
    if (!user) return;
    const ref = doc(db, 'notifications', id);
    updateDoc(ref, { isRead: true }).catch(err => console.error("Failed to mark read:", err));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const batchPromises = notifications
      .filter(n => !n.isRead)
      .map(n => updateDoc(doc(db, 'notifications', n.id), { isRead: true }));
    await Promise.all(batchPromises).catch(err => console.error("Batch update failed:", err));
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    deleteDoc(doc(db, 'notifications', id)).catch(err => console.error("Failed to delete:", err));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
