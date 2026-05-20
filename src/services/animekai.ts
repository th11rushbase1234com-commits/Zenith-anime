/**
 * Service to interact with the AnimeKai Archival Engine
 * Zenith Protocol V9.0: High-performance scraper integration.
 * Source: leodevil334-eng/AnimeKai-API
 */

export interface AnimeKaiEpisodeCounts {
  sub: number;
  dub: number;
}

/**
 * Fetches "Live" sub and dub episode counts for an AniList ID.
 * Uses the AnimeKai lookup endpoint for precise metadata recovery.
 */
export async function getEpisodeCounts(anilistId: string): Promise<AnimeKaiEpisodeCounts> {
  if (!anilistId || anilistId === '0' || anilistId === 'undefined') {
    return { sub: 0, dub: 0 };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Using the AnimeKai-API endpoint structure as documented in README
    const response = await fetch(`https://anikai-api.vercel.app/api/anikai/${anilistId}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { sub: 0, dub: 0 };
    }

    const json = await response.json();
    
    if (json.status !== 'success' || !json.data) {
      return { sub: 0, dub: 0 };
    }

    const data = json.data;
    let subCount = 0;
    let dubCount = 0;

    // GREEDY ARCHIVAL SCAN V9.0: Exhaustive search for sub/dub markers
    if (data.episodes && Array.isArray(data.episodes)) {
      // 1. Scan for explicit dub markers in IDs and titles
      const dubs = data.episodes.filter((ep: any) => {
        const id = String(ep.id || ep.episode_id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        const isDub = ep.isDub === true || 
                     id.includes('-dub') || 
                     id.includes('/dub') || 
                     title.includes('(dub)') || 
                     title.includes('[dub]');
        return isDub;
      });

      // 2. Scan for sub markers (baseline)
      const subs = data.episodes.filter((ep: any) => {
        const id = String(ep.id || ep.episode_id || '').toLowerCase();
        const title = String(ep.title || '').toLowerCase();
        const isDub = ep.isDub === true || 
                     id.includes('-dub') || 
                     title.includes('(dub)');
        return !isDub;
      });

      subCount = subs.length || data.total_episodes || data.episodes.length;
      dubCount = dubs.length;

      // 3. HEURISTIC RECOVERY: If API has flat structure but is known dubbed
      if (dubCount === 0 && (data.has_dub === true || data.dub_count > 0)) {
        dubCount = data.dub_count || subCount;
      }
    } else {
      // Direct summary field fallback
      subCount = data.sub_count || data.total_episodes || 0;
      dubCount = data.dub_count || 0;
    }

    return { sub: subCount, dub: dubCount };
  } catch (error) {
    // Silent recovery for archival stability
    return { sub: 0, dub: 0 };
  }
}
