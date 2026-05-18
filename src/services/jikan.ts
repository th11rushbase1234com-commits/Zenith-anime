
import { Anime } from '@/app/types/anime';

/**
 * Service to interact with the Jikan API (v4)
 * Jikan is an open-source PHP & REST API for MyAnimeList.net
 */

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export async function searchAnime(query: string): Promise<Anime[]> {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=10`);
    if (!response.ok) throw new Error('Failed to fetch from Jikan');
    
    const data = await response.json();
    
    return data.data.map((item: any) => ({
      id: String(item.mal_id),
      title: item.title,
      genres: item.genres.map((g: any) => g.name),
      themes: item.themes.map((t: any) => t.name),
      description: item.synopsis || 'No description available.',
      imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url,
      rating: item.score || 0,
      totalEpisodes: item.episodes || 0,
      currentEpisode: 0,
      status: 'PLAN_TO_WATCH' as const,
      year: item.year || (item.aired?.prop?.from?.year) || 0,
      emotionalImpact: 'TBD'
    }));
  } catch (error) {
    console.error('Jikan search error:', error);
    return [];
  }
}
