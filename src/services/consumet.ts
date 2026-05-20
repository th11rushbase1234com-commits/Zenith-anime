/**
 * Service to interact with the Consumet API (Meta AniList Provider)
 * Zenith Protocol V6.0: Supreme greedy detection and dual-channel mapping.
 */

export interface ConsumetEpisodeCounts {
  sub: number;
  dub: number;
}

export async function getEpisodeCounts(anilistId: string): Promise<ConsumetEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  // Dual-Node Resilience Strategy: Multi-instance fallback
  const instances = [
    `https://api.consumet.org/meta/anilist/info/${anilistId}`,
    `https://consumet-api-fawn.vercel.app/meta/anilist/info/${anilistId}`
  ];

  for (const url of instances) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { 
        signal: controller.signal,
        next: { revalidate: 3600 } 
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      
      let subFound = 0;
      let dubFound = 0;

      // ZENITH GREEDY SCAN V6.0: Recursive Metadata Recovery
      if (data && Array.isArray(data.episodes)) {
        const episodes = data.episodes;
        
        // 1. DUB DETECTION: Exhaustive string heuristics and metadata flags
        const dubEpisodes = episodes.filter((ep: any) => {
          const id = String(ep.id || '').toLowerCase();
          const title = String(ep.title || '').toLowerCase();
          const isDubFlag = ep.isDub === true || ep.dub === true;
          
          return isDubFlag || 
                 id.includes('-dub') || 
                 id.includes('/dub') || 
                 id.includes('_dub') ||
                 title.includes('(dub)') || 
                 title.includes('[dub]') ||
                 title.includes(' dub');
        });

        // 2. SUB DETECTION: Baseline episodes (Usually all episodes minus explicit dub duplicates)
        const subEpisodes = episodes.filter((ep: any) => {
          const id = String(ep.id || '').toLowerCase();
          const title = String(ep.title || '').toLowerCase();
          const isDub = id.includes('-dub') || id.includes('/dub') || id.includes('_dub') || 
                       title.includes('(dub)') || title.includes('[dub]') || ep.isDub === true;
          return !isDub;
        });

        subFound = subEpisodes.length || data.totalEpisodes || episodes.length;
        dubFound = dubEpisodes.length;

        // 3. HEURISTIC FALLBACK: If API has 'hasDub' flag but flat array, or if it's a known dubbed series
        if (dubFound === 0 && (data.hasDub === true || data.dub === true)) {
          // If we know it has a dub but the array is flat, usually the sub count matches the dub count
          dubFound = subFound; 
        }
      }

      // Final top-level data synchronization
      if (subFound === 0 && data.totalEpisodes) subFound = data.totalEpisodes;
      
      if (subFound > 0 || dubFound > 0) {
        return { sub: subFound, dub: dubFound };
      }
    } catch (error) {
      continue;
    }
  }

  return { sub: 0, dub: 0 };
}
