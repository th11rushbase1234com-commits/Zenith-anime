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

    if (data.episodes && data.episodes.data) {
      data.episodes.data.forEach((provider: any) => {
        const episodeCount = provider.episodes?.length || 0;
        if (provider.type === 'sub') {
          subMax = Math.max(subMax, episodeCount);
        } else if (provider.type === 'dub') {
          dubMax = Math.max(dubMax, episodeCount);
        }
      });
    }

    return { sub: subMax, dub: dubMax };
  } catch (error) {
    // Silently catch fetch errors (timeouts, CORS, network drops)
    // to prevent triggering the global Next.js error overlay.
    return { sub: 0, dub: 0 };
  }
}
