'use client';

import React from 'react';
import { Anime } from '@/app/types/anime';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface GenreVisualizerProps {
  watchlist: Anime[];
}

export function GenreVisualizer({ watchlist }: GenreVisualizerProps) {
  const genreCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    watchlist.forEach(anime => {
      anime.genres.forEach(genre => {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [watchlist]);

  const statusData = React.useMemo(() => {
    const stats = {
      'Mastered': watchlist.filter(a => a.status === 'COMPLETED').length,
      'Active': watchlist.filter(a => a.status === 'WATCHING').length,
      'Queued': watchlist.filter(a => a.status === 'PLAN_TO_WATCH').length,
    };
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [watchlist]);

  const COLORS = ['#A89BFF', '#5E89F0', '#FF8CC6', '#7CF3A0', '#F3D27C'];

  if (watchlist.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black italic uppercase tracking-widest text-white">Genre Spectrum</h3>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Density of narrative archetypes</p>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genreCounts.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[10, 10, 10, 10]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black italic uppercase tracking-widest text-white">Archive Status</h3>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Global library distribution</p>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
