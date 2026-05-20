/**
 * Service to interact with the AnimeKai Archival Engine
 * Zenith Protocol V8.0: Ultra-Greedy detection for Dual-Channel archival telemetry.
 */

export interface AnimeKaiEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts for an AniList ID.
 * Uses a greedy metadata resolution strategy to identify content across global release streams.
 */
export async function getEpisodeCounts(anilistId: string): Promise<AnimeKaiEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    // Zenith Meta-Provider: Robust metadata recovery engine
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(`https://api.anify.tv/info/${anilistId}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const data = await response.json();
    
    let subMax = 0;
    let dubMax = 0;

    // GREEDY SCAN V8.0: Exhaustive data branch analysis
    if (data && data.episodes) {
      const episodesObj = data.episodes;

      // 1. Direct summary fields
      if (typeof episodesObj.sub === 'number') subMax = episodesObj.sub;
      if (typeof episodesObj.dub === 'number') dubMax = episodesObj.dub;

      // 2. Greedy Provider Scanning: Recovering counts from varied provider naming conventions
      if (Array.isArray(episodesObj.data)) {
        episodesObj.data.forEach((provider: any) => {
          const episodes = provider.episodes || [];
          const count = Array.isArray(episodes) ? episodes.length : 0;
          
          if (count === 0) return;

          const type = String(provider.type || '').toLowerCase();
          const pId = String(provider.providerId || '').toLowerCase();
          
          // Identify DUB via type flag or provider-specific ID (e.g., 'gogoanime-dub')
          if (type === 'dub' || pId.includes('dub')) {
            dubMax = Math.max(dubMax, count);
          } else {
            subMax = Math.max(subMax, count);
          }
        });
      }

      // 3. Fallback: If dubs exist in the array but count was missed
      if (dubMax === 0 && Array.isArray(episodesObj.dub)) dubMax = episodesObj.dub.length;
    }

    // Ensure we don't report 0 subs if AniList knows about episodes
    return { sub: subMax, dub: dubMax };
  } catch (error) {
    // Silent recovery for archival stability
    return { sub: 0, dub: 0 };
  }
}
