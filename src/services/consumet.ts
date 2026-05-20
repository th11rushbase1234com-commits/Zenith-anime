/**
 * Service to interact with the Consumet API (Meta AniList Provider)
 * Optimized for Zenith Protocol V4.0: Aggressive metadata recovery and multi-instance resilience.
 */

export interface ConsumetEpisodeCounts {
  sub: number;
  dub: number;
}

export async function getEpisodeCounts(anilistId: string): Promise<ConsumetEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  // Multi-Instance Resilience: Try primary then secondary if first fails
  const instances = [
    `https://api.consumet.org/meta/anilist/info/${anilistId}`,
    `https://consumet-api-fawn.vercel.app/meta/anilist/info/${anilistId}`
  ];

  for (const url of instances) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      
      let subCount = 0;
      let dubCount = 0;

      // ZENITH SCAN V4.0: Ultra-Greedy Metadata Resolution
      if (data && Array.isArray(data.episodes)) {
        // Many providers list sub and dub in a flat array
        const subEpisodes = data.episodes.filter((ep: any) => {
          const id = String(ep.id || '').toLowerCase();
          const title = String(ep.title || '').toLowerCase();
          // Filter OUT dub markers to count true subs
          return !id.includes('-dub') && !id.includes('/dub') && !title.includes('(dub)') && ep.isDub !== true;
        });

        const dubEpisodes = data.episodes.filter((ep: any) => {
          const id = String(ep.id || '').toLowerCase();
          const title = String(ep.title || '').toLowerCase();
          // Filter IN dub markers
          return id.includes('-dub') || id.includes('/dub') || title.includes('(dub)') || title.includes('[dub]') || ep.isDub === true;
        });

        subCount = subEpisodes.length || data.totalEpisodes || data.episodes.length;
        dubCount = dubEpisodes.length;

        // HEURISTIC: If array is flat and markers aren't explicit but hasDub is true
        if (dubCount === 0 && (data.hasDub === true || data.dub === true)) {
          dubCount = subCount;
        }
      }

      // Final fallback to top-level fields
      if (subCount === 0 && data.totalEpisodes) subCount = data.totalEpisodes;
      
      // If we found any data, return it
      if (subCount > 0 || dubCount > 0) {
        return { sub: subCount, dub: dubCount };
      }
    } catch (error) {
      // Instance failed, loop will try next one
      continue;
    }
  }

  return { sub: 0, dub: 0 };
}
