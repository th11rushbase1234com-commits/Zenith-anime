export type WatchStatus = 'PLAN_TO_WATCH' | 'WATCHING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED';

export interface Anime {
  id: string;
  idMal?: string;
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
  subCount?: number;
  dubCount?: number;
  externalLinks?: { site: string; url: string }[];
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
  };
}

export interface RecommendedAnime {
  title: string;
  genres: string[];
  reason: string;
  expectedEmotionalImpact: string;
}
