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
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const data = await response.json();
    
    let subMax = 0;
    let dubMax = 0;

    // EXHAUSTIVE SCAN: Anify data structures can vary by provider and anime type
    if (data.episodes) {
      const episodesObj = data.episodes;

      // 1. Check for direct sub/dub summary counts
      if (typeof episodesObj.sub === 'number') subMax = Math.max(subMax, episodesObj.sub);
      if (typeof episodesObj.dub === 'number') dubMax = Math.max(dubMax, episodesObj.dub);

      // 2. Scan providers array (the most robust source)
      if (Array.isArray(episodesObj.data)) {
        episodesObj.data.forEach((provider: any) => {
          const episodes = provider.episodes || [];
          const count = episodes.length;
          const type = String(provider.type || '').toLowerCase();
          const pId = String(provider.providerId || '').toLowerCase();
          
          // Heuristic detection: check explicit type flag OR provider naming convention
          if (type === 'dub' || pId.includes('dub')) {
            dubMax = Math.max(dubMax, count);
          } else if (type === 'sub' || pId.includes('sub') || type === 'softsub' || pId.includes('zoro') || pId.includes('gogo')) {
            subMax = Math.max(subMax, count);
          }
        });
      }

      // 3. Fallback to array length check if sub/dub are direct arrays
      if (Array.isArray(episodesObj.sub)) subMax = Math.max(subMax, episodesObj.sub.length);
      if (Array.isArray(episodesObj.dub)) dubMax = Math.max(dubMax, episodesObj.dub.length);
    }

    // Top-level fallbacks
    if (typeof data.sub === 'number') subMax = Math.max(subMax, data.sub);
    if (typeof data.dub === 'number') dubMax = Math.max(dubMax, data.dub);

    return { sub: subMax, dub: dubMax };
  } catch (error) {
    // Silently catch fetch errors (timeouts, CORS, network drops)
    return { sub: 0, dub: 0 };
  }
}
