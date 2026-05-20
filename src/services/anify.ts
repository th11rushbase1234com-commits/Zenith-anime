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
    // Use an AbortController to prevent long-hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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

    // Deep Scan of the episodes object
    if (data.episodes) {
      // 1. Scan providers array (the most common structure)
      if (Array.isArray(data.episodes.data)) {
        data.episodes.data.forEach((provider: any) => {
          const episodeCount = provider.episodes?.length || 0;
          const type = String(provider.type || '').toLowerCase();
          
          if (type === 'sub') {
            subMax = Math.max(subMax, episodeCount);
          } else if (type === 'dub') {
            dubMax = Math.max(dubMax, episodeCount);
          }
        });
      }

      // 2. Check for direct counts (some API versions provide these as summary fields)
      if (typeof data.episodes.sub === 'number') subMax = Math.max(subMax, data.episodes.sub);
      if (typeof data.episodes.dub === 'number') dubMax = Math.max(dubMax, data.episodes.dub);
    }

    // 3. Fallback to top-level fields if present
    if (typeof data.sub === 'number') subMax = Math.max(subMax, data.sub);
    if (typeof data.dub === 'number') dubMax = Math.max(dubMax, data.dub);

    return { sub: subMax, dub: dubMax };
  } catch (error) {
    // Silently catch fetch errors (timeouts, CORS, network drops)
    // to prevent triggering the global Next.js error overlay.
    return { sub: 0, dub: 0 };
  }
}
