/**
 * Service to interact with the Anixplay Archival Engine
 * Zenith Protocol V11.0: Advanced dual-channel metadata recovery.
 */

export interface AnixplayEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts for an AniList ID.
 * Uses the Anixplay meta-provider for precise situational awareness.
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

    // GREEDY ARCHIVAL SCAN V11.0: Recursive Metadata Recovery
    if (data && data.episodes && Array.isArray(data.episodes)) {
      const episodes = data.episodes;
      
      // 1. DUB DETECTION: Exhaustive heuristic analysis of ID patterns and flags
      const dubs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        // Check for explicit flags OR naming conventions common in archival streams
        return ep.isDub === true || 
               id.includes('-dub') || 
               id.includes('/dub') || 
               title.includes('(Dub)') || 
               title.includes('[Dub]');
      });

      // 2. SUB DETECTION: Baseline SITREP (Total episodes minus duplicates or flagged subs)
      const subs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        const isDub = ep.isDub === true || id.includes('-dub') || title.includes('(Dub)');
        return !isDub;
      });

      subCount = subs.length || data.totalEpisodes || episodes.length;
      dubCount = dubs.length;

      // 3. HEURISTIC RECOVERY: If API has 'hasDub' flag but flat array
      if (dubCount === 0 && (data.hasDub === true || data.dub === true)) {
        dubCount = subCount; 
      }
    } else {
      // Direct summary field fallback if episode array is missing
      subCount = data.totalEpisodes || 0;
      dubCount = data.hasDub ? subCount : 0;
    }

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    // Fail-safe silent recovery to maintain dashboard stability
    return { sub: 0, dub: 0 };
  }
}
