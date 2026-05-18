
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
      'Completed': watchlist.filter(a => a.status === 'COMPLETED').length,
      'Watching': watchlist.filter(a => a.status === 'WATCHING').length,
      'Planning': watchlist.filter(a => a.status === 'PLAN_TO_WATCH').length,
    };
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [watchlist]);

  const COLORS = ['#A89BFF', '#5E89F0', '#FF8CC6', '#7CF3A0', '#F3D27C'];

  if (watchlist.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="glass-panel border-none">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Genre Affinity</CardTitle>
          <CardDescription>Your favorite anime categories</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genreCounts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px' }}
                cursor={{ fill: 'hsl(var(--secondary))' }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Library Overview</CardTitle>
          <CardDescription>Distribution of your watchlist</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
