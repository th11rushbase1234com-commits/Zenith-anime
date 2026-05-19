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
  ShieldAlert, 
  CheckCircle2, 
  FileJson,
  LayoutDashboard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImportExportPage() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoaded, addAnime } = useWatchlist();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [processing, setProcessing] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);

  if (authLoading || !isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Synchronizing Zenith Data...</p>
      </div>
    );
  }

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(watchlist, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `zenith-watchlist-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Export Successful",
        description: `${watchlist.length} records have been packaged into JSON format.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate backup file.",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setImportCount(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
          throw new Error("Invalid format: Backup must be an array of records.");
        }

        let successCount = 0;
        for (const item of data) {
          // Basic validation of imported item structure
          if (item.id && item.title && item.status) {
            await addAnime(item, item.status);
            successCount++;
          }
        }

        setImportCount(successCount);
        toast({
          title: "Import Complete",
          description: `Successfully restored ${successCount} anime records to your watchlist.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import Error",
          description: error.message || "Failed to process the backup file.",
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
        
        {/* Header section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-glow">
            DATA <span className="text-primary">MIGRATION</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-medium italic uppercase tracking-widest">
            Backup & Recovery Protocols
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 space-y-8 flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Export Archive</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Download your entire Zenith watchlist as a JSON file. This can be used for local backups or migrating to another account.
              </p>
              <div className="pt-2">
                <p className="text-[10px] font-mono uppercase text-primary/60">Current Records: {watchlist.length}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleExport}
              disabled={watchlist.length === 0}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black italic rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02]"
            >
              GENERATE BACKUP
            </Button>
          </div>

          {/* Import Section */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 space-y-8 flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Restore Archive</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a Zenith JSON backup to restore your watchlist. Existing records will be updated, and new ones will be added.
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[9px] text-destructive font-bold uppercase tracking-wider leading-normal">
                  Caution: Importing will overwrite existing metadata for series already in your library.
                </p>
              </div>
            </div>

            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black italic rounded-full uppercase tracking-widest transition-all hover:scale-[1.02]"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'UPLOAD BACKUP'}
            </Button>
          </div>
        </div>

        {/* Success / Status Section */}
        {importCount !== null && (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="bg-accent/10 border border-accent/20 rounded-[2rem] p-6 flex items-center justify-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <div className="text-center">
                <p className="text-xs font-black italic uppercase tracking-widest text-white">Data Integration Complete</p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-tighter">Synchronized {importCount} records to Zenith Cloud</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <FileJson className="w-3.5 h-3.5" /> JSON Protocol V1.0
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={() => router.push('/')}
            className="font-black italic text-[11px] uppercase tracking-widest text-primary hover:text-white"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Return to Command Center
          </Button>
        </div>
      </div>
    </div>
  );
}