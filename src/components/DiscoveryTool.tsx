'use client';

import React, { useState } from 'react';
import { Anime, RecommendedAnime } from '@/app/types/anime';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw, BrainCircuit, Target } from 'lucide-react';
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
    <div className="w-full space-y-8">
      <div className="bg-card/30 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20">
            <BrainCircuit className="w-12 h-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-glow">Zenith Core Analysis</h3>
            <p className="text-muted-foreground text-xs md:text-[13px] max-w-lg mx-auto leading-relaxed italic font-medium">
              Processing consumption history through neural networks to predict high-resonance series for your profile.
            </p>
          </div>

          {recommendations.length === 0 ? (
            <Button 
              onClick={handleDiscovery} 
              disabled={loading || watchlist.length === 0} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-full h-14 px-10 gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              INITIALIZE NEURAL PROBE
            </Button>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 text-left">
              {recommendations.map((rec, i) => (
                <div key={i} className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black uppercase text-primary text-lg leading-tight group-hover:text-glow">{rec.title}</h4>
                    <Target className="w-5 h-5 text-accent opacity-50" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.genres.slice(0, 3).map(g => (
                      <span key={g} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white font-black uppercase tracking-widest">{g}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">
                    {rec.reason}
                  </p>
                  <div className="pt-3 border-t border-white/5 space-y-1">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">Resonance Profile</span>
                    <p className="text-[9px] text-muted-foreground line-clamp-2 italic font-medium">{rec.expectedEmotionalImpact}</p>
                  </div>
                </div>
              ))}
              <div className="col-span-full flex justify-center pt-6">
                <Button variant="outline" onClick={handleDiscovery} disabled={loading} className="rounded-full border-white/10 h-12 px-8 font-black text-xs uppercase tracking-widest hover:bg-white/5">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  REGENERATE ANALYTICS
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
