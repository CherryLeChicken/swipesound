import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Music, Heart, Disc, Loader2, ListMusic, Play, Trash2, LogIn, User as UserIcon, LogOut, Mail, Lock } from 'lucide-react';
import { SwipeCard } from './components/SwipeCard';
import { useStore } from './store';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Song, SwipeType, AuthResponse } from '@swipesound/shared-types';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// Get the API base URL from environment variables or default to /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function AuthView({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const setAuth = useStore((state) => state.setAuth);

  const mutation = useMutation({
    mutationFn: async () => {
      let endpoint = '';
      let body: any = { email };

      if (view === 'login') {
        endpoint = `${API_BASE_URL}/auth/login`;
        body.password = password;
      } else if (view === 'signup') {
        endpoint = `${API_BASE_URL}/auth/register`;
        body.password = password;
      } else if (view === 'forgot') {
        endpoint = `${API_BASE_URL}/auth/forgot-password`;
      } else if (view === 'reset') {
        endpoint = `${API_BASE_URL}/auth/reset-password`;
        body = { token: resetToken, password };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Action failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (view === 'login' || view === 'signup') {
        setAuth(data.user, data.accessToken);
        onBack();
      } else if (view === 'forgot') {
        setMessage('Reset instructions sent! Check your email (or use the debug token below).');
        if (data.debugToken) {
          setMessage(prev => prev + ` DEBUG TOKEN: ${data.debugToken}`);
        }
        setView('reset');
      } else if (view === 'reset') {
        setMessage('Password reset successful! You can now sign in.');
        setView('login');
      }
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'New Password';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return 'Sign in to sync your liked songs';
      case 'signup': return 'Start your music discovery journey';
      case 'forgot': return 'Enter your email to receive a reset token';
      case 'reset': return 'Enter your reset token and new password';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-sm space-y-8 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
          <p className="text-slate-400 text-sm mt-2">{getSubtitle()}</p>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="space-y-4"
        >
          {error && <div className="p-3 text-sm bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl">{error}</div>}
          {message && <div className="p-3 text-sm bg-green-500/10 border border-green-500/50 text-green-500 rounded-xl break-all">{message}</div>}
          
          {(view === 'login' || view === 'signup' || view === 'forgot') && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          )}

          {view === 'reset' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Reset Token</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="Paste your token here"
                />
              </div>
            </div>
          )}

          {(view === 'login' || view === 'signup' || view === 'reset') && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                {view === 'reset' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-pink-500/20"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
              (view === 'login' ? 'Sign In' : 
               view === 'signup' ? 'Sign Up' : 
               view === 'forgot' ? 'Send Reset Link' : 'Update Password')}
          </button>
        </form>

        <div className="text-center space-y-2">
          {view === 'login' && (
            <>
              <button 
                onClick={() => { setView('signup'); setError(''); setMessage(''); }}
                className="block w-full text-sm text-slate-400 hover:text-pink-500 transition-colors"
              >
                Don't have an account? Sign Up
              </button>
              <button 
                onClick={() => { setView('forgot'); setError(''); setMessage(''); }}
                className="block w-full text-sm text-slate-500 hover:text-pink-500 transition-colors"
              >
                Forgot your password?
              </button>
            </>
          )}
          {view !== 'login' && (
            <button 
              onClick={() => { setView('login'); setError(''); setMessage(''); }}
              className="text-sm text-slate-400 hover:text-pink-500 transition-colors"
            >
              Back to Sign In
            </button>
          )}
        </div>
        
        <button 
          onClick={onBack}
          className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors pt-2 border-t border-slate-800/50"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

function DiscoveryView({ onAuth }: { onBack?: () => void, onAuth?: () => void }) {
  const { sessionId, setSessionId, currentIndex, setCurrentIndex, setCurrentPreviewUrl, token } = useStore();
  const queryClient = useQueryClient();
  const [hasStarted, setHasStarted] = useState(false);

  // Ensure session ID exists
  useEffect(() => {
    if (!sessionId) {
      const newId = `session-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newId);
    }
  }, [sessionId, setSessionId]);

  const { data: songs, isLoading, isError, refetch } = useQuery<Song[]>({
    queryKey: ['songs', 'discover', sessionId, !!token],
    queryFn: async () => {
      const headers: Record<string, string> = {
        'x-session-id': sessionId
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/music/discover`, { headers });
      if (!res.ok) throw new Error('Failed to fetch songs');
      const data = await res.json();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!sessionId,
  });

  // Handle Audio Playback - sync to store
  useEffect(() => {
    const currentSong = songs?.[currentIndex];
    if (hasStarted && currentSong?.preview) {
      setCurrentPreviewUrl(currentSong.preview);
    } else if (!hasStarted) {
      setCurrentPreviewUrl(undefined);
    }
  }, [hasStarted, songs, currentIndex, setCurrentPreviewUrl]);

  const swipeMutation = useMutation({
    mutationFn: async ({ 
      songId, 
      type, 
      title, 
      artistName, 
      albumArt, 
      previewUrl 
    }: { 
      songId: number, 
      type: SwipeType,
      title?: string,
      artistName?: string,
      albumArt?: string,
      previewUrl?: string
    }) => {
      if (!sessionId && !token) {
        throw new Error('Session not initialized');
      }
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-session-id'] = sessionId;
      }

      const res = await fetch(`${API_BASE_URL}/music/swipe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          songId, 
          type,
          title,
          artistName,
          albumArt,
          previewUrl
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', 'liked'] });
    }
  });

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!songs || !songs[currentIndex]) return;
    
    const song = songs[currentIndex];

    swipeMutation.mutate({ 
      songId: song.id, 
      type: direction === 'right' ? SwipeType.LIKE : SwipeType.SKIP,
      title: song.title,
      artistName: song.artist?.name,
      albumArt: song.album?.cover_big,
      previewUrl: song.preview
    });
    
    setCurrentIndex(currentIndex + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    refetch();
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;
  if (isError) return <div className="text-red-500 p-8 text-center">Error loading music.</div>;

  if (!hasStarted) {
    return (
      <div className="text-center p-8 h-full flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Music className="w-12 h-12 text-pink-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Ready to discover?</h2>
        <p className="text-slate-400 mb-8 max-w-[280px] mx-auto">
          Swipe through song previews and find your next favorite artist.
        </p>
        <button 
          onClick={() => setHasStarted(true)}
          className="flex items-center gap-2 px-8 py-4 bg-pink-500 hover:bg-pink-600 rounded-full font-bold text-lg transition-transform active:scale-95 shadow-lg shadow-pink-500/20 mx-auto"
        >
          <Play className="w-5 h-5 fill-current" />
          {currentIndex > 0 ? 'Resume Swiping' : 'Start Swiping'}
        </button>

        {!token && (
          <button 
            onClick={onAuth}
            className="mt-8 text-sm text-slate-500 hover:text-pink-500 transition-colors flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in to save your progress
          </button>
        )}
      </div>
    );
  }

  if (!songs || currentIndex >= songs.length) {
    return (
      <div className="text-center p-8">
        <Disc className="w-16 h-16 text-slate-700 mx-auto mb-4 animate-spin-slow" />
        <p className="text-slate-400">All caught up! Check back later.</p>
        <button 
          onClick={handleRestart}
          className="mt-4 px-4 py-2 bg-pink-500 rounded-lg font-bold mx-auto"
        >
          Restart Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background (Next Song) */}
      {songs[currentIndex + 1] && (
        <div className="absolute w-[280px] aspect-[3/4] rounded-3xl opacity-20 scale-90 blur-sm pointer-events-none">
          <img src={songs[currentIndex + 1].album.cover_big} className="w-full h-full object-cover rounded-3xl" alt="next" />
        </div>
      )}

      {/* Current Active Card */}
      <SwipeCard 
        key={songs[currentIndex].id}
        song={songs[currentIndex]} 
        onSwipe={handleSwipe}
        isActive={true}
      />

      {!token && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest z-20 flex items-center gap-2">
          <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse" />
          Incognito Mode: Sign in to sync
        </div>
      )}
      
      {/* Desktop Controls Fallback */}
      <div className="absolute bottom-10 flex gap-12 sm:hidden lg:flex pointer-events-none">
         <button onClick={() => handleSwipe('left')} className="pointer-events-auto bg-slate-900/80 p-4 rounded-full border border-slate-700 hover:scale-110 transition-transform shadow-xl">
           <X className="w-8 h-8 text-red-500" />
         </button>
         <button onClick={() => handleSwipe('right')} className="pointer-events-auto bg-slate-900/80 p-4 rounded-full border border-slate-700 hover:scale-110 transition-transform shadow-xl">
           <Heart className="w-8 h-8 text-green-500 fill-green-500" />
         </button>
      </div>
    </div>
  );
}

function LikedSongsView() {
  const { sessionId, token } = useStore();
  const queryClient = useQueryClient();

  const { data: songs, isLoading } = useQuery<Song[]>({
    queryKey: ['songs', 'liked', sessionId, !!token],
    queryFn: async () => {
      if (!sessionId && !token) return [];
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-session-id'] = sessionId;
      }
      const res = await fetch(`${API_BASE_URL}/music/liked`, { headers });
      return res.json();
    },
    enabled: !!sessionId || !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (songId: number) => {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-session-id'] = sessionId;
      }
      const res = await fetch(`${API_BASE_URL}/music/liked/${songId}`, {
        method: 'DELETE',
        headers
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', 'liked'] });
    }
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center text-slate-500 p-12 h-full flex flex-col items-center justify-center">
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>No liked songs yet. Start swiping!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ListMusic className="text-pink-500" />
        Liked Songs
      </h2>
      <div className="grid gap-3 pb-24">
        {songs.map(song => (
          <div key={song.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition-colors group">
            <img src={song.album.cover_small} className="w-14 h-14 rounded-lg shadow-md" alt={song.title} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate text-slate-100 group-hover:text-pink-500 transition-colors">{song.title}</h3>
              <p className="text-sm text-slate-400 truncate">{song.artist.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={song.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-pink-500 transition-colors"
                title="Open in Deezer"
              >
                <Music className="w-5 h-5" />
              </a>
              <button
                onClick={() => deleteMutation.mutate(song.id)}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                title="Remove from liked"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'liked' | 'auth'>('discover');
  const { currentPreviewUrl, user, logout } = useStore();
  
  // Audio player stays mounted at the app level
  useAudioPlayer(currentPreviewUrl);

  const handleLogout = () => {
    logout();
    setActiveTab('discover');
    queryClient.invalidateQueries();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-50 font-sans overflow-hidden select-none">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg z-50 shrink-0">
          <div className="flex items-center gap-2">
            <Music className="text-pink-500 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">SwipeSound</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('auth')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-full text-sm font-bold border border-slate-800 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            <button className="p-2 rounded-full hover:bg-slate-800 transition-colors relative">
              <Disc className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
          <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'discover' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full z-0 pointer-events-none'}`}>
            <DiscoveryView onAuth={() => setActiveTab('auth')} />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'liked' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-full z-0 pointer-events-none'}`}>
            <LikedSongsView />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'auth' ? 'opacity-100 scale-100 z-20 bg-slate-950' : 'opacity-0 scale-95 z-0 pointer-events-none'}`}>
            <AuthView onBack={() => setActiveTab('discover')} />
          </div>
        </main>

        {/* Navigation Bar */}
        <nav className="flex items-center justify-around py-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl z-50 shrink-0">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'discover' ? 'text-pink-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Music className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Discover</span>
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'liked' ? 'text-pink-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Liked</span>
          </button>
        </nav>
      </div>
    </QueryClientProvider>
  );
}

export default App;
