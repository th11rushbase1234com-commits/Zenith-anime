'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useWatchlist } from '../hooks/use-watchlist';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Download, 
  Upload, 
  CheckCircle2, 
  FileCode,
  LayoutDashboard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAnimeByMalIds } from '@/services/anilist';
import { WatchStatus } from '../types/anime';

export default function ImportExportPage() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoaded, addAnime } = useWatchlist();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [processing, setProcessing] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Synchronizing Zenith Data...</p>
      </div>
    );
  }

  const mapZenithToMalStatus = (status: WatchStatus): string => {
    switch(status) {
      case 'WATCHING': return 'Watching';
      case 'COMPLETED': return 'Completed';
      case 'ON_HOLD': return 'On-Hold';
      case 'DROPPED': return 'Dropped';
      case 'PLAN_TO_WATCH': return 'Plan to Watch';
      default: return 'Plan to Watch';
    }
  };

  const mapMalToZenithStatus = (status: string): WatchStatus => {
    const s = status.toLowerCase();
    if (s.includes('watching')) return 'WATCHING';
    if (s.includes('completed')) return 'COMPLETED';
    if (s.includes('hold')) return 'ON_HOLD';
    if (s.includes('dropped')) return 'DROPPED';
    return 'PLAN_TO_WATCH';
  };

  const handleExport = () => {
    try {
      let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n<myanimelist>\n';
      xml += '  <myinfo>\n    <user_export_type>1</user_export_type>\n  </myinfo>\n';
      
      watchlist.forEach(item => {
        xml += '  <anime>\n';
        xml += `    <series_animedb_id>${item.idMal || item.id}</series_animedb_id>\n`;
        xml += `    <my_watched_episodes>${item.currentEpisode || 0}</my_watched_episodes>\n`;
        xml += `    <my_status>${mapZenithToMalStatus(item.status)}</my_status>\n`;
        xml += `    <my_score>${item.rating ? Math.round(item.rating * 10) : 0}</my_score>\n`;
        xml += `    <update_on_import>1</update_on_import>\n`;
        xml += '  </anime>\n';
      });
      
      xml += '</myanimelist>';
      
      const dataUri = 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml);
      const exportFileDefaultName = `zenith-watchlist-mal-${new Date().toISOString().split('T')[0]}.xml`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Export Successful",
        description: `${watchlist.length} records exported in MAL XML format.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate XML archive.",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setImportCount(null);
    setCurrentProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");
        const animeNodes = Array.from(xmlDoc.getElementsByTagName("anime"));

        if (animeNodes.length === 0) {
          throw new Error("Invalid MAL XML structure.");
        }

        const malData = animeNodes.map(node => ({
          id: node.getElementsByTagName("series_animedb_id")[0]?.textContent || '0',
          status: mapMalToZenithStatus(node.getElementsByTagName("my_status")[0]?.textContent || '')
        })).filter(item => item.id !== '0');

        let successCount = 0;
        const total = malData.length;
        const BATCH_SIZE = 50;

        for (let i = 0; i < total; i += BATCH_SIZE) {
          const batch = malData.slice(i, i + BATCH_SIZE);
          const batchIds = batch.map(b => parseInt(b.id));
          
          try {
            const metadataBatch = await getAnimeByMalIds(batchIds);
            
            for (const metadata of metadataBatch) {
              const originalItem = batch.find(b => 
                String(b.id) === String(metadata.idMal) || String(b.id) === String(metadata.id)
              );
              if (originalItem) {
                await addAnime(metadata, originalItem.status);
                successCount++;
              }
            }
          } catch (innerError) {
            console.warn("Batch failed, skipping section...");
          }
          
          const progress = Math.min(Math.round(((i + BATCH_SIZE) / total) * 100), 100);
          setCurrentProgress(progress);
          
          // Small delay to avoid aggressive rate limiting and browser request abortion
          if (i + BATCH_SIZE < total) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        setImportCount(successCount);
        toast({
          title: "Import Complete",
          description: `Successfully restored ${successCount} records from the archive.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import Error",
          description: error.message || "Failed to process XML file.",
        });
      } finally {
        setProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 md:px-8">
      <div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-glow">
            DATA <span className="text-primary">MIGRATION</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-medium italic uppercase tracking-widest">
            MAL XML Archive & Synchronization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 space-y-8 flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Export XML</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate a MyAnimeList compatible XML backup. Ideal for external archival or cross-platform migration.
              </p>
              <div className="pt-2">
                <p className="text-[10px] font-mono uppercase text-primary/60">Active Records: {watchlist.length}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleExport}
              disabled={watchlist.length === 0}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-full uppercase tracking-widest transition-all hover:scale-[1.02]"
            >
              GENERATE XML
            </Button>
          </div>

          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 space-y-8 flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Restore XML</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a MAL export. Zenith Protocol V1.0 will automatically recover titles and posters for every ID found using staggered batching.
              </p>
              
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-primary font-bold uppercase tracking-wider leading-normal">
                  Sync Engine: V1.0 High-Speed Staggered Protocol Enabled. Optimized for 200+ record archives.
                </p>
              </div>
            </div>

            <input 
              type="file" 
              accept=".xml" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black rounded-full uppercase tracking-widest transition-all hover:scale-[1.02] relative overflow-hidden"
            >
              {processing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>SYNCING {currentProgress}%</span>
                  <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${currentProgress}%` }} />
                </div>
              ) : 'UPLOAD MAL XML'}
            </Button>
          </div>
        </div>

        {importCount !== null && (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="bg-accent/10 border border-accent/20 rounded-[2rem] p-6 flex items-center justify-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <div className="text-center">
                <p className="text-xs font-black italic uppercase tracking-widest text-white">Integration Successful</p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-tighter">Synchronized {importCount} records from MAL Archive</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <FileCode className="w-3.5 h-3.5" /> STAGGERED PROTOCOL V1.0 (MAL)
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={() => router.push('/')}
            className="font-black text-[11px] uppercase tracking-widest text-primary hover:text-white"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Return to Command Center
          </Button>
        </div>
      </div>
    </div>
  );
}
