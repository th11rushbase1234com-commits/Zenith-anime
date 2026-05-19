/**
 * Service to interact with the Anify API
 * Used for real-time sub/dub episode counts and deep metadata.
 */

export interface AnifyEpisodeCounts {
  sub: number;
  dub: number;
}

export async function getEpisodeCounts(anilistId: string): Promise<AnifyEpisodeCounts> {
  try {
    // Anify Info Endpoint: provides deep provider-specific episode data
    const response = await fetch(`https://api.anify.tv/info/${anilistId}`);
    
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
    console.error(`Anify Telemetry Error [${anilistId}]:`, error);
    return { sub: 0, dub: 0 };
  }
}
