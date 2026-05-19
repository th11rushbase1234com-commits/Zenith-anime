
import { Anime } from '@/app/types/anime';

const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_QUERY_FIELDS = `
  id
  title {
    english
    romaji
  }
  genres
  description
  coverImage {
    extraLarge
    large
  }
  averageScore
  episodes
  seasonYear
  externalLinks {
    site
    url
  }
  nextAiringEpisode {
    airingAt
    episode
  }
`;

async function fetchAniList(query: string, variables: any = {}) {
  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('AniList Rate Limit Hit. Cooling down...');
      }
      return { errors: [{ message: `HTTP Error: ${response.status}` }] };
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Fetch error:', error);
    return { errors: [{ message: error instanceof Error ? error.message : 'Network error' }] };
  }
}

function mapMediaToAnime(media: any): Anime {
  return {
    id: String(media.id),
    title: media.title.english || media.title.romaji,
    genres: media.genres || [],
    themes: [], 
    description: media.description?.replace(/<[^>]*>/g, '') || 'No description available.',
    imageUrl: media.coverImage.extraLarge || media.coverImage.large,
    rating: media.averageScore ? media.averageScore / 10 : 0,
    totalEpisodes: media.episodes || 0,
    currentEpisode: 0,
    status: 'PLAN_TO_WATCH',
    year: media.seasonYear || 0,
    externalLinks: media.externalLinks || [],
    nextAiringEpisode: media.nextAiringEpisode
  };
}

export async function searchAnime(query: string, page: number = 1): Promise<{ anime: Anime[], hasNextPage: boolean, lastPage: number }> {
  const searchQuery = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 18) {
        pageInfo {
          hasNextPage
          lastPage
        }
        media(search: $search, type: ANIME) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;
  
  try {
    const data = await fetchAniList(searchQuery, { search: query, page });
    if (data.errors) return { anime: [], hasNextPage: false, lastPage: 1 };
    
    return {
      anime: data.Page.media.map(mapMediaToAnime),
      hasNextPage: data.Page.pageInfo.hasNextPage,
      lastPage: data.Page.pageInfo.lastPage
    };
  } catch (error) {
    console.error('Search error:', error);
    return { anime: [], hasNextPage: false, lastPage: 1 };
  }
}

export async function getAnimeByMalId(malId: number): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(idMal: $id, type: ANIME) {
        ${MEDIA_QUERY_FIELDS}
      }
    }
  `;
  try {
    const data = await fetchAniList(query, { id: malId });
    if (data.errors || !data.data?.Media) {
      return null;
    }
    return mapMediaToAnime(data.data.Media);
  } catch (error) {
    console.error(`Metadata recovery failed for ID ${malId}:`, error);
    return null;
  }
}

export async function getTrendingAnime(): Promise<Anime[]> {
  const trendingQuery = `
    query {
      Page(page: 1, perPage: 5) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;
  
  try {
    const data = await fetchAniList(trendingQuery);
    if (data.errors) return [];
    return data.data.Page.media.map(mapMediaToAnime);
  } catch (error) {
    console.error('Trending error:', error);
    return [];
  }
}

export async function getRecentAiring(): Promise<Anime[]> {
  const recentQuery = `
    query {
      Page(page: 1, perPage: 12) {
        airingSchedules(notYetAired: false, sort: TIME_DESC) {
          media {
            ${MEDIA_QUERY_FIELDS}
          }
          episode
        }
      }
    }
  `;
  
  try {
    const data = await fetchAniList(recentQuery);
    if (data.errors) return [];
    
    const uniqueMedia = new Map();
    data.data.Page.airingSchedules.forEach((item: any) => {
      if (!uniqueMedia.has(item.media.id)) {
        uniqueMedia.set(item.media.id, mapMediaToAnime(item.media));
      }
    });
    return Array.from(uniqueMedia.values());
  } catch (error) {
    console.error('Recent airing error:', error);
    return [];
  }
}
