import { Anime } from '@/app/types/anime';

const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_QUERY_FIELDS = `
  id
  idMal
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
  isAdult
  externalLinks {
    site
    url
  }
  nextAiringEpisode {
    airingAt
    episode
  }
`;

// List of official AniList Genres to separate from Tags
const OFFICIAL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", 
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", 
  "Psychological", "Romance", "Sci-Fi", "Slice of Life", 
  "Sports", "Supernatural", "Thriller"
];

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

    const json = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        return { errors: [{ message: 'AniList Rate Limit Hit.' }] };
      }
      return { errors: json.errors || [{ message: `HTTP Error: ${response.status}` }] };
    }

    return json;
  } catch (error) {
    return { errors: [{ message: 'Connection failed' }] };
  }
}

function mapMediaToAnime(media: any): Anime {
  return {
    id: String(media.id),
    idMal: media.idMal ? String(media.idMal) : undefined,
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

export async function searchAnime(params: {
  query?: string,
  page?: number,
  status?: string,
  genres?: string[],
  sort?: string[]
}): Promise<{ anime: Anime[], hasNextPage: boolean, lastPage: number }> {
  const { query, page = 1, status, genres, sort } = params;

  // Split input into genres and tags for accurate AniList filtration
  const genreInput = genres?.filter(g => OFFICIAL_GENRES.includes(g));
  const tagInput = genres?.filter(g => !OFFICIAL_GENRES.includes(g));

  const searchQuery = `
    query ($search: String, $page: Int, $status: MediaStatus, $genres: [String], $tags: [String], $sort: [MediaSort]) {
      Page(page: $page, perPage: 24) {
        pageInfo {
          hasNextPage
          lastPage
        }
        media(search: $search, status: $status, genre_in: $genres, tag_in: $tags, sort: $sort, type: ANIME, isAdult: false) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;
  
  try {
    const data = await fetchAniList(searchQuery, { 
      search: query || undefined, 
      page,
      status: status || undefined,
      genres: genreInput && genreInput.length > 0 ? genreInput : undefined,
      tags: tagInput && tagInput.length > 0 ? tagInput : undefined,
      sort: sort || ["SEARCH_MATCH", "TRENDING_DESC"]
    });
    if (data.errors) return { anime: [], hasNextPage: false, lastPage: 1 };
    
    return {
      anime: data.data.Page.media.map(mapMediaToAnime),
      hasNextPage: data.data.Page.pageInfo.hasNextPage,
      lastPage: data.data.Page.pageInfo.lastPage
    };
  } catch (error) {
    return { anime: [], hasNextPage: false, lastPage: 1 };
  }
}

export async function getAnimeByMalIds(malIds: number[]): Promise<Anime[]> {
  const query = `
    query ($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(idMal_in: $ids, type: ANIME, isAdult: false) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;
  try {
    const data = await fetchAniList(query, { ids: malIds });
    if (data.errors || !data.data?.Page?.media) {
      return [];
    }
    return data.data.Page.media.map(mapMediaToAnime);
  } catch (error) {
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
    if (data.errors) return [];
    return data.data.Page.media.map(mapMediaToAnime);
  } catch (error) {
    return [];
  }
}

export async function getRecentAiring(page: number = 1, perPage: number = 12): Promise<Anime[]> {
  const recentQuery = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
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
    const data = await fetchAniList(recentQuery, { page, perPage });
    if (data.errors) return [];
    
    const uniqueMedia = new Map();
    data.data.Page.airingSchedules.forEach((item: any) => {
      // Apply strict manual filter for airing schedules as they don't support a top-level isAdult argument
      if (item.media && item.media.isAdult === false) {
        if (!uniqueMedia.has(item.media.id)) {
          uniqueMedia.set(item.media.id, mapMediaToAnime(item.media));
        }
      }
    });
    return Array.from(uniqueMedia.values());
  } catch (error) {
    return [];
  }
}
