/**
 * Service to interact with the Anixplay Archival Engine
 * Zenith Protocol V10.0: High-speed metadata recovery.
 */

export interface AnixplayEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts for an AniList ID.
 * Uses the Anixplay lookup endpoint for precise metadata recovery.
 */
export async function getEpisodeCounts(anilistId: string): Promise<AnixplayEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Anixplay API Meta-Endpoint
    const response = await fetch(`https://api.anixplay.buzz/meta/anilist/info/${anilistId}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fallback to secondary node if primary is offline
      const fallbackResponse = await fetch(`https://anixplay.buzz/api/anime/details/${anilistId}`, {
        next: { revalidate: 3600 }
      });
      if (!fallbackResponse.ok) return { sub: 0, dub: 0 };
      const fallbackData = await fallbackResponse.json();
      return { 
        sub: fallbackData.episodes?.length || fallbackData.totalEpisodes || 0,
        dub: fallbackData.episodes?.filter((e: any) => e.isDub || String(e.id).includes('-dub')).length || 0
      };
    }

    const data = await response.json();
    
    let subCount = 0;
    let dubCount = 0;

    if (data && data.episodes && Array.isArray(data.episodes)) {
      const episodes = data.episodes;
      
      // Greedy Scan: Detect dubs via flags and ID patterns
      const dubs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        return ep.isDub === true || id.includes('-dub') || id.includes('/dub');
      });

      const subs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        return !ep.isDub && !id.includes('-dub');
      });

      subCount = subs.length || data.totalEpisodes || episodes.length;
      dubCount = dubs.length;

      // Heuristic Recovery: If API has 'hasDub' flag but flat array
      if (dubCount === 0 && (data.hasDub === true || data.dub === true)) {
        dubCount = subCount; 
      }
    }

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    return { sub: 0, dub: 0 };
  }
}
