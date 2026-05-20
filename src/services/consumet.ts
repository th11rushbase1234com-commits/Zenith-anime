/**
 * Service to interact with the Consumet API (Meta AniList Provider)
 * Used for real-time sub/dub episode counts and deep metadata recovery.
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
    // Use a stable mirror if the primary is unstable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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

    // CONSUMET SCAN V2.1: Aggressive metadata resolution
    if (data) {
      // 1. Check the episodes array (standard Consumet structure)
      if (Array.isArray(data.episodes) && data.episodes.length > 0) {
        subCount = data.episodes.length;

        // Count episodes explicitly marked as DUB or containing dub markers in IDs
        const dubs = data.episodes.filter((ep: any) => 
          ep.isDub === true || 
          ep.dub === true || 
          String(ep.id || '').toLowerCase().includes('-dub') ||
          String(ep.title || '').toLowerCase().includes('(dub)')
        );

        if (dubs.length > 0) {
          dubCount = dubs.length;
        } else if (data.hasDub === true) {
          // Fallback: If Consumet confirms dub exists but hasn't mapped individual episodes
          dubCount = subCount;
        }
      } 
      
      // 2. Secondary check for top-level count overrides
      if (data.totalEpisodes && data.totalEpisodes > subCount) {
        subCount = data.totalEpisodes;
      }
    }

    return { 
      sub: subCount, 
      dub: dubCount 
    };
  } catch (error) {
    // Silently handle transient network or API failures
    return { sub: 0, dub: 0 };
  }
}
