
'use client';

import React, { useState } from 'react';
import { Anime, RecommendedAnime } from '@/app/types/anime';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { recommendAnime } from '@/ai/flows/anime-recommendation-flow';

interface DiscoveryToolProps {
  watchlist: Anime[];
}

export function DiscoveryTool({ watchlist }: DiscoveryToolProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedAnime[]>([]);

  const handleDiscovery = async () => {
    if (watchlist.length === 0) return;
    
    setLoading(true);
    try {
      const watchedData = watchlist.map(a => ({
        title: a.title,
        genres: a.genres,
        themes: a.themes,
        emotionalImpact: a.emotionalImpact || 'General entertainment',
        userRating: a.rating
      }));

      const result = await recommendAnime({ watchedAnime: watchedData });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Discovery failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5 overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="font-headline">Zenith AI Discovery</CardTitle>
        </div>
        <CardDescription>
          Intelligent reasoning powered by Zenith AI. We analyze your history to find your next obsession.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Click below to generate personalized recommendations based on your {watchlist.length} titles.
            </p>
            <Button onClick={handleDiscovery} disabled={loading || watchlist.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Reason & Recommend
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-lg bg-card border border-white/5 space-y-3 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline font-semibold text-primary">{rec.title}</h4>
                  <div className="flex gap-1">
                    {rec.genres.slice(0, 2).map(g => (
                      <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{g}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">"{rec.reason}"</p>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-medium text-accent uppercase tracking-wider">Vibe Check</span>
                  <p className="text-[11px] text-muted-foreground">{rec.expectedEmotionalImpact}</p>
                </div>
              </div>
            ))}
            <div className="md:col-span-2 flex justify-center pt-4">
              <Button variant="outline" onClick={handleDiscovery} disabled={loading} size="sm">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
