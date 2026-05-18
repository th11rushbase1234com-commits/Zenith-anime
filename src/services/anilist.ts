
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
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    console.error('AniList API Error:', json.errors);
    throw new Error('AniList request failed');
  }
  return json.data;
}

function mapMediaToAnime(media: any): Anime {
  return {
    id: String(media.id),
    title: media.title.english || media.title.romaji,
    genres: media.genres || [],
    themes: [], // AniList uses 'tags' for themes, but for MVP genres is enough
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

export async function searchAnime(query: string): Promise<Anime[]> {
  const searchQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 12) {
        media(search: $search, type: ANIME) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;
  
  try {
    const data = await fetchAniList(searchQuery, { search: query });
    return data.Page.media.map(mapMediaToAnime);
  } catch (error) {
    console.error('Search error:', error);
    return [];
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
    return data.Page.media.map(mapMediaToAnime);
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
    // Use a Map to keep only the latest entry per anime id
    const uniqueMedia = new Map();
    data.Page.airingSchedules.forEach((item: any) => {
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
