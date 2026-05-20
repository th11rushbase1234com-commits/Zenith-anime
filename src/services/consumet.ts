/**
 * Service to interact with the Consumet API (Meta AniList Provider)
 * Optimized for aggressive metadata recovery of sub/dub counts.
 */

export interface ConsumetEpisodeCounts {
  sub: number;
  dub: number;
}

export async function getEpisodeCounts(anilistId: string): Promise<ConsumetEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    // Consumet Meta AniList Info Endpoint
    // We use a shorter timeout to ensure the UI remains responsive
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://api.consumet.org/meta/anilist/info/${anilistId}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const data = await response.json();
    
    let subCount = 0;
    let dubCount = 0;

    // ZENITH SCAN V3.0: Exhaustive Metadata Resolution
    if (data && Array.isArray(data.episodes)) {
      subCount = data.episodes.length;

      // HEURISTIC 1: Check explicit boolean flags
      const explicitDubs = data.episodes.filter((ep: any) => 
        ep.isDub === true || ep.dub === true
      );

      // HEURISTIC 2: String analysis of IDs and Titles (The most reliable for Consumet)
      const stringDubs = data.episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        return id.includes('-dub') || id.includes('/dub') || title.includes('(dub)') || title.includes('[dub]');
      });

      // HEURISTIC 3: Sub-provider check
      // Consumet often lists dubs as separate entries in the array
      const uniqueDubs = new Set([...explicitDubs, ...stringDubs]);
      dubCount = uniqueDubs.size;

      // CROSS-CHECK: If metadata confirms dub exists but array is flat
      if (dubCount === 0 && data.hasDub === true) {
        dubCount = subCount;
      }
    }

    // Fallback to top-level episode count if subCount resolved to 0
    if (subCount === 0 && data.totalEpisodes) {
      subCount = data.totalEpisodes;
    }

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    // Silently return zero-state on network or API failures
    return { sub: 0, dub: 0 };
  }
}
