/**
 * Service to interact with the AnimeKai Archival Engine
 * Zenith Protocol V9.0: High-performance scraper integration.
 * Source: leodevil334-eng/AnimeKai-API
 */

export interface AnimeKaiEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts for an AniList ID.
 * Uses the AnimeKai lookup endpoint for precise metadata recovery.
 */
export async function getEpisodeCounts(anilistId: string): Promise<AnimeKaiEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    // AnimeKai Meta-Provider: Modern scraping engine
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Using the official AnimeKai-API endpoint structure as documented
    const response = await fetch(`https://anikai-api.vercel.app/api/anikai/${anilistId}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const json = await response.json();
    
    if (json.status !== 'success' || !json.data) {
      return { sub: 0, dub: 0 };
    }

    const data = json.data;
    let subCount = 0;
    let dubCount = 0;

    // Archival Logic: Extracting counts from the AnimeKai data structure
    if (data.episodes && Array.isArray(data.episodes)) {
      // AnimeKai typically returns a flat list or categorized episodes
      // We perform a greedy scan for dub markers
      const dubs = data.episodes.filter((ep: any) => {
        const title = String(ep.title || '').toLowerCase();
        const id = String(ep.id || ep.episode_id || '').toLowerCase();
        return ep.isDub === true || title.includes('(dub)') || id.includes('-dub');
      });

      const subs = data.episodes.filter((ep: any) => {
        const title = String(ep.title || '').toLowerCase();
        const id = String(ep.id || ep.episode_id || '').toLowerCase();
        const isDub = ep.isDub === true || title.includes('(dub)') || id.includes('-dub');
        return !isDub;
      });

      subCount = subs.length || data.total_episodes || data.episodes.length;
      dubCount = dubs.length;
    } else if (data.sub_count || data.dub_count) {
      // Fallback for direct summary fields if available
      subCount = data.sub_count || 0;
      dubCount = data.dub_count || 0;
    }

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    // Silent recovery for archival stability
    return { sub: 0, dub: 0 };
  }
}
