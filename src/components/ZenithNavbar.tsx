'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Home, 
  X, 
  Bookmark, 
  Settings, 
  LogOut,
  Database,
  SlidersHorizontal,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { NotificationCenter } from './NotificationCenter';
import { searchAnime } from '@/services/anilist';
import { Anime } from '@/app/types/anime';
import { cn } from '@/lib/utils';

export function ZenithNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isSearchArea = 
        searchInputRef.current?.contains(event.target as Node) || 
        suggestionsRef.current?.contains(event.target as Node);
      
      if (!isSearchArea) {
        setShowSuggestions(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        try {
          const { anime } = await searchAnime({ query: searchQuery, page: 1 });
          setSuggestions(anime.slice(0, 6));
          setShowSuggestions(true);
        } catch (error) {
          console.error("Predictive search failure", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      setSearchQuery('');
      setShowSuggestions(false);
      searchInputRef.current?.blur();
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (title: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(title)}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    router.push('/');
    searchInputRef.current?.blur();
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Zenith User';

  if (!mounted) return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-background/95 border-b border-white/5 px-4 md:px-8 flex items-center justify-between" />
  );

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-background/95 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="p-1.5 md:p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <Home className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h1 className="text-lg md:text-2xl font-black tracking-tighter text-glow hidden sm:block">
            <span className="text-primary">ZENITH</span>
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-2xl">
        <div className="relative flex-1 max-w-[400px]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <button 
                type="submit" 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10"
              >
                <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              <Input 
                ref={searchInputRef}
                placeholder="Discovery engine..." 
                className="pl-9 pr-9 h-9 w-full bg-white/5 border-none rounded-full text-[10px] md:text-[11px] focus:ring-1 focus:ring-primary transition-all font-medium placeholder:font-medium placeholder:text-white/30 tracking-tight"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              />
              {isLoading && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                </div>
              )}
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button 
              type="button"
              onClick={() => router.push('/search')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shrink-0"
              title="Discovery Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-300 z-[100] w-[calc(100vw-2rem)] sm:w-full sm:left-0 sm:right-0 fixed sm:absolute left-4"
            >
              <div className="p-2 space-y-1">
                <div className="px-3 py-1.5 flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Predictive Matches</span>
                </div>
                {suggestions.map((anime) => (
                  <button
                    key={anime.id}
                    onClick={() => handleSuggestionClick(anime.title)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <Image 
                        src={anime.imageUrl} 
                        alt={anime.title} 
                        fill 
                        className="object-cover transition-transform md:group-hover:scale-110"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[10px] font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                        {anime.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-muted-foreground font-medium italic">
                          {anime.year || 'TBA'} • {anime.genres[0] || 'Anime'}
                        </span>
                        {anime.rating > 0 && (
                          <div className="flex items-center gap-0.5 text-[8px] text-accent font-black">
                            <Star className="w-2 h-2 fill-current" />
                            {Math.round(anime.rating * 10)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
                <button 
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 flex items-center justify-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors border-t border-white/5 mt-1"
                >
                  <Search className="w-3 h-3" /> View all for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 border-l border-white/10 pl-2 md:pl-4">
          <NotificationCenter />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] overflow-hidden shrink-0 outline-none">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={userName} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-panel border-white/10 mt-2 p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight text-white">{userName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={() => router.push('/library')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                  <Bookmark className="w-4 h-4" /> Personal Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push('/import-export')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                  <Database className="w-4 h-4" /> Import / Export
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                  <Settings className="w-4 h-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-destructive/10 text-xs font-bold uppercase tracking-widest text-destructive"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
