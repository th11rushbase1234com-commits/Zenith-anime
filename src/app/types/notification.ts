
export type NotificationType = 'EPISODE' | 'DUB' | 'NEWS';

export interface ZenithNotification {
  id: string;
  userId: string;
  animeId?: string;
  animeTitle?: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  episodeNumber?: number;
}
