
export type WatchStatus = 'PLAN_TO_WATCH' | 'WATCHING' | 'COMPLETED';

export interface Anime {
  id: string;
  title: string;
  genres: string[];
  themes: string[];
  description: string;
  imageUrl: string;
  rating: number;
  totalEpisodes: number;
  currentEpisode: number;
  status: WatchStatus;
  year: number;
  emotionalImpact?: string;
}

export interface RecommendedAnime {
  title: string;
  genres: string[];
  reason: string;
  expectedEmotionalImpact: string;
}
