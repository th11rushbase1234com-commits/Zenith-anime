'use client';

import React, { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Home, 
  X, 
  Bell, 
  Bookmark, 
  Settings, 
  LogOut,
  Monitor
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

export function ZenithNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      searchInputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    router.push('/');
    searchInputRef.current?.blur();
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Zenith User';

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-background/95 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="p-1.5 md:p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Home className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-glow">
            <span className="text-primary">ZENITH</span>
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-[280px]">
          <button 
            type="submit" 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors z-10"
          >
            <Search className="w-4 h-4" />
          </button>
          <Input 
            ref={searchInputRef}
            placeholder="Search anime" 
            className="pl-9 pr-9 h-9 w-full bg-white/5 border-none rounded-full text-xs md:text-sm focus:ring-1 focus:ring-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
        
        <div className="flex items-center gap-2 md:gap-3 border-l border-white/10 pl-2 md:pl-4">
          <button className="hidden sm:flex w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] overflow-hidden shrink-0">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={userName} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-panel border-white/10 mt-2 p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black italic uppercase tracking-tight text-white">{userName}</p>
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
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
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
