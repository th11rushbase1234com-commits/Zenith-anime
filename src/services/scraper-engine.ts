/**
 * Zenith Custom Scraper Engine V3.0
 * Performs greedy heuristic discovery across global archival mirrors.
 * Optimized for recursive SUB/DUB channel metadata recovery.
 */

export interface ScraperTelemetry {
  sub: number;
  dub: number;
}

/**
 * Executes a "Greedy Multi-Pass Search" across known metadata mirrors and release fragments.
 * Recursively scans provider episode arrays for explicit sub/dub classification.
 */
export async function scrapeLiveTelemetry(anilistId: string, title: string): Promise<ScraperTelemetry> {
  if (!anilistId || anilistId === '0') return { sub: 0, dub: 0 };

  try {
    // Primary Archival Node: Anify (High-frequency provider metadata)
    const response = await fetch(`https://api.anify.tv/info/${anilistId}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) return { sub: 0, dub: 0 };

    const data = await response.json();
    
    // HEURISTIC LAYER 1: Immediate Field Recovery
    let sub = data.sub || 0;
    let dub = data.dub || 0;

    // HEURISTIC LAYER 2: Recursive Fragment Analysis
    // If counts are zero, we perform a greedy scan of the episode collection
    if (data.episodes) {
      let discoveredDub = 0;
      let discoveredSub = 0;

      // Episodes are grouped by source (Gogo, HiAnime, etc.)
      const sources = Array.isArray(data.episodes) ? data.episodes : [];
      
      sources.forEach((source: any) => {
        if (source.episodes && Array.isArray(source.episodes)) {
          source.episodes.forEach((ep: any) => {
            // Greedy classification: check flags, IDs, and titles
            const isDub = 
              ep.isDub === true || 
              String(ep.id || '').toLowerCase().includes('-dub') ||
              String(ep.id || '').toLowerCase().includes('/dub') ||
              String(ep.title || '').toLowerCase().includes('(dub)') ||
              String(ep.title || '').toLowerCase().includes(' [dub]');
            
            if (isDub) discoveredDub++;
            else discoveredSub++;
          });
        }
      });

      // Maximize findings: We take the highest count found across all mirrors
      // This ensures that even if one mirror is behind, we report the most up-to-date count
      sub = Math.max(sub, discoveredSub, data.totalEpisodes || 0);
      dub = Math.max(dub, discoveredDub);
    }

    // FINAL VALIDATION: Ensure baseline counts are never zero if total episodes exist
    if (sub === 0 && data.totalEpisodes) sub = data.totalEpisodes;
    
    // Some older series have dubs that aren't explicitly flagged in mirrors
    // We maintain strict data integrity unless a dub is found
    return { sub, dub };
  } catch (error) {
    // Fail-safe returns 0 to prevent UI crashes
    return { sub: 0, dub: 0 };
  }
}
