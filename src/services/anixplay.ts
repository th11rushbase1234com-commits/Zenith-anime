/**
 * Service to interact with the Anixplay Archival Engine
 * Zenith Protocol V12.0: Optimized dual-channel metadata recovery.
 */

export interface AnixplayEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts for an AniList ID.
 * Protocol V12.0: Prioritizes summary fields with recursive array fallback.
 */
export async function getEpisodeCounts(anilistId: string): Promise<AnixplayEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Primary Archival Node: Anixplay Meta-Provider
    const response = await fetch(`https://api.anixplay.buzz/meta/anilist/info/${anilistId}`, {
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const data = await response.json();
    
    let subCount = 0;
    let dubCount = 0;

    // CHANNEL 1: DIRECT FIELD RECOVERY (Highest Priority)
    // Most Anixplay-compatible APIs return 'sub' and 'dub' as numbers in the root object.
    if (typeof data.sub === 'number') subCount = data.sub;
    if (typeof data.dub === 'number') dubCount = data.dub;

    // CHANNEL 2: GREEDY HEURISTIC SCAN (Fallback if direct fields are missing or 0)
    if ((subCount === 0 || dubCount === 0) && data.episodes && Array.isArray(data.episodes)) {
      const episodes = data.episodes;
      
      const dubs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        return ep.isDub === true || 
               id.includes('-dub') || 
               id.includes('/dub') || 
               title.includes('(Dub)') || 
               title.includes('[Dub]');
      });

      const subs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        const isDub = ep.isDub === true || id.includes('-dub') || title.includes('(Dub)');
        return !isDub;
      });

      if (subCount === 0) subCount = subs.length || data.totalEpisodes || episodes.length;
      if (dubCount === 0) dubCount = dubs.length;
    }

    // CHANNEL 3: BASELINE VALIDATION
    if (subCount === 0 && data.totalEpisodes) subCount = data.totalEpisodes;
    if (dubCount === 0 && (data.hasDub === true || data.dub === true)) dubCount = subCount;

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    // Fail-safe silent recovery to maintain dashboard stability
    return { sub: 0, dub: 0 };
  }
}
