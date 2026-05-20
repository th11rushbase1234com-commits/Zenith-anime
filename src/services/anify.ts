/**
 * Zenith Archival Protocol V13.0: Anify Elite Telemetry Engine
 * Optimized for simultaneous dual-channel metadata recovery.
 */

export interface AnifyEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts from the Anify Protocol.
 * Performs a deep scan of the global release fragments.
 */
export async function getEpisodeCounts(anilistId: string): Promise<AnifyEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Primary Archival Node: Anify API
    const response = await fetch(`https://api.anify.tv/info/${anilistId}`, {
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const data = await response.json();
    
    // Anify typically provides sub and dub counts in a structured format
    // under the metadata or episodes objects.
    let subCount = 0;
    let dubCount = 0;

    // CHANNEL 1: DIRECT FIELD SCAN
    // Some endpoints return 'sub' and 'dub' as root-level summary numbers.
    if (typeof data.sub === 'number') subCount = data.sub;
    if (typeof data.dub === 'number') dubCount = data.dub;

    // CHANNEL 2: RECURSIVE FRAGMENT ANALYSIS
    // If summary fields are missing, scan the episode list.
    if ((subCount === 0 || dubCount === 0) && data.episodes && Array.isArray(data.episodes)) {
      // Anify often returns arrays of episodes where each entry has a sub/dub marker
      const episodes = data.episodes;
      
      // Look for explicit dub flags in the fragment structure
      const dubs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        return ep.isDub === true || id.includes('-dub') || id.includes('/dub');
      });

      const subs = episodes.filter((ep: any) => {
        const id = String(ep.id || '').toLowerCase();
        const isDub = ep.isDub === true || id.includes('-dub');
        return !isDub;
      });

      if (subCount === 0) subCount = subs.length || data.totalEpisodes || episodes.length;
      if (dubCount === 0) dubCount = dubs.length;
    }

    // CHANNEL 3: BASELINE CROSS-REFERENCE
    if (subCount === 0 && data.totalEpisodes) subCount = data.totalEpisodes;
    if (dubCount === 0 && (data.hasDub === true || data.dub === true)) dubCount = subCount;

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    // Fail-safe silent recovery to maintain dashboard stability
    return { sub: 0, dub: 0 };
  }
}
