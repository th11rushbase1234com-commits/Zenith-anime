
import { Anime } from '../types/anime';

export const INITIAL_ANIME: Anime[] = [
  {
    id: '1',
    title: 'Neon Shadows',
    genres: ['Action', 'Sci-Fi', 'Cyberpunk'],
    themes: ['Artificial Intelligence', 'Dystopia'],
    description: 'In a future where memories can be traded, a detective searches for the phantom who stole his childhood.',
    imageUrl: 'https://picsum.photos/seed/cyber/400/600',
    rating: 8.5,
    totalEpisodes: 24,
    currentEpisode: 12,
    status: 'WATCHING',
    year: 2023,
    emotionalImpact: 'Tense, philosophical, slightly melancholic'
  },
  {
    id: '2',
    title: 'Wind Weaver',
    genres: ['Fantasy', 'Adventure'],
    themes: ['Nature', 'Magic'],
    description: 'A young girl discovers she can speak to the winds of the world, leading her on a quest across floating islands.',
    imageUrl: 'https://picsum.photos/seed/fantasy/400/600',
    rating: 9.1,
    totalEpisodes: 12,
    currentEpisode: 12,
    status: 'COMPLETED',
    year: 2022,
    emotionalImpact: 'Whimsical, inspiring, heartwarming'
  },
  {
    id: '3',
    title: 'Stellar Drift',
    genres: ['Space', 'Drama'],
    themes: ['Survival', 'Humanity'],
    description: 'A crew of a drifting freighter must reconcile their pasts as they approach the edge of the galaxy.',
    imageUrl: 'https://picsum.photos/seed/space/400/600',
    rating: 7.8,
    totalEpisodes: 26,
    currentEpisode: 0,
    status: 'PLAN_TO_WATCH',
    year: 2024,
    emotionalImpact: 'Contemplative, desolate, hopeful'
  },
  {
    id: '4',
    title: 'Cherry Blossom Echo',
    genres: ['Romance', 'School'],
    themes: ['First Love', 'Youth'],
    description: 'A quiet student begins hearing the thoughts of the most popular girl in school every time they pass each other.',
    imageUrl: 'https://picsum.photos/seed/school/400/600',
    rating: 8.2,
    totalEpisodes: 13,
    currentEpisode: 13,
    status: 'COMPLETED',
    year: 2021,
    emotionalImpact: 'Bittersweet, nostalgic'
  }
];
