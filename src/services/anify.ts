/**
 * Service to interact with the Anify API
 * Used for real-time sub/dub episode counts and deep metadata.
 */

export interface AnifyEpisodeCounts {
  sub: number;
  dub: number;
}

export async function getEpisodeCounts(anilistId: string): Promise<AnifyEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    // Anify Info Endpoint: provides deep provider-specific episode data
    // Use an AbortController with a slightly longer timeout for reliable metadata recovery
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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

    // GREEDY SCAN V3.0: Exhaustively search all data branches for sub/dub markers
    if (data && data.episodes) {
      const episodesObj = data.episodes;

      // 1. Direct summary fields (numbers)
      if (typeof episodesObj.sub === 'number') subMax = Math.max(subMax, episodesObj.sub);
      if (typeof episodesObj.dub === 'number') dubMax = Math.max(dubMax, episodesObj.dub);

      // 2. Scan providers array (the most robust source)
      if (Array.isArray(episodesObj.data)) {
        episodesObj.data.forEach((provider: any) => {
          const episodes = provider.episodes || [];
          const count = Array.isArray(episodes) ? episodes.length : (typeof episodes === 'number' ? episodes : 0);
          
          if (count === 0) return;

          const type = String(provider.type || '').toLowerCase();
          const pId = String(provider.providerId || '').toLowerCase();
          
          // Pattern: Explicit DUB type OR provider ID containing "dub"
          if (type === 'dub' || pId.includes('dub')) {
            dubMax = Math.max(dubMax, count);
          } else {
            // Default everything else to SUB (sub, softsub, etc)
            subMax = Math.max(subMax, count);
          }
        });
      }

      // 3. Last resort: check sub/dub as arrays directly
      if (Array.isArray(episodesObj.sub)) subMax = Math.max(subMax, episodesObj.sub.length);
      if (Array.isArray(episodesObj.dub)) dubMax = Math.max(dubMax, episodesObj.dub.length);
    }

    // Top-level fallbacks (sometimes Anify puts these outside the episodes object)
    if (typeof data.sub === 'number') subMax = Math.max(subMax, data.sub);
    if (typeof data.dub === 'number') dubMax = Math.max(dubMax, data.dub);

    return { sub: subMax, dub: dubMax };
  } catch (error) {
    // Silently catch fetch errors (timeouts, CORS, network drops)
    return { sub: 0, dub: 0 };
  }
}
