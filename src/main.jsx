import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Search, Library, Plus, Heart, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat2, ChevronLeft, ChevronRight, MoreHorizontal, LogIn, LogOut, UserPlus, X } from 'lucide-react';
import { backendEnabled, supabase } from './supabaseClient';
import './styles.css';

const demoTracks = [
  { id: 'demo-1', title: 'Midnight Drive', artist: 'Nova Lane', album: 'Midnight Drive', duration_seconds: 222, tone: 'violet', icon: '✦' },
  { id: 'demo-2', title: 'Neon Skies', artist: 'The Satellites', album: 'Neon Skies', duration_seconds: 248, tone: 'blue', icon: '☾' },
  { id: 'demo-3', title: 'Golden Hour', artist: 'Mira Sol', album: 'Golden Hour', duration_seconds: 206, tone: 'gold', icon: '◐' },
  { id: 'demo-4', title: 'Afterglow', artist: 'Kairo', album: 'Afterglow', duration_seconds: 231, tone: 'pink', icon: '✧' },
  { id: 'demo-5', title: 'City Lights', artist: 'Atlas Youth', album: 'City Lights', duration_seconds: 255, tone: 'cyan', icon: '⌁' },
];

const toneFor = i => ['violet', 'blue', 'gold', 'pink', 'cyan'][i % 5];
const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function Cover({ tone = 'violet', icon = '✦', small = false, url }) {
  return url ? <img className={`cover ${small ? 'small' : ''}`} src={url} alt="" /> : <div className={`cover ${tone} ${small ? 'small' : ''}`}><span>{icon}</span></div>;
}

function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setMessage('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else { setMessage(mode === 'login' ? 'Welcome back!' : 'Account created. Check your email if confirmation is enabled.'); if (mode === 'login') onClose(); }
  };
  return <div className="modal-backdrop" onClick={onClose}><div className="auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><div className="brand centered"><div className="brand-mark">P</div><span>pulse</span></div><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="muted">{mode === 'login' ? 'Sign in to keep your music and playlists synced.' : 'Start building your personal music library.'}</p><form onSubmit={submit}>{mode === 'signup' && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Display name"/>}<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/><input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ characters)"/><button className="primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form>{message && <p className="auth-message">{message}</p>}<button className="text-button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? <><UserPlus size={16}/> Create an account</> : <><LogIn size={16}/> I already have an account</>}</button></div></div>;
}

function App() {
  const [active, setActive] = useState('Home');
  const [tracks, setTracks] = useState(demoTracks);
  const [current, setCurrent] = useState(demoTracks[0]);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!backendEnabled) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    supabase.from('tracks').select('*').order('id').then(({ data }) => { if (data?.length) setTracks(data.map((t, i) => ({ ...t, tone: toneFor(i) }))); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const update = () => setPosition(audio.currentTime || 0);
    const ended = () => { setPlaying(false); setPosition(0); };
    audio.addEventListener('timeupdate', update); audio.addEventListener('ended', ended);
    return () => { audio.removeEventListener('timeupdate', update); audio.removeEventListener('ended', ended); };
  }, [current]);

  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return q ? tracks.filter(t => `${t.title} ${t.artist} ${t.album || ''}`.toLowerCase().includes(q)) : tracks; }, [query, tracks]);
  const playSong = async song => { setCurrent(song); setPosition(0); setPlaying(true); if (song.audio_url && audioRef.current) { audioRef.current.src = song.audio_url; await audioRef.current.play().catch(() => setPlaying(false)); } };
  const togglePlay = async () => { if (!current.audio_url || !audioRef.current) { setPlaying(v => !v); return; } if (playing) { audioRef.current.pause(); setPlaying(false); } else { await audioRef.current.play().catch(() => {}); setPlaying(true); } };
  const seek = e => { const value = Number(e.target.value); setPosition(value); if (audioRef.current && current.audio_url) audioRef.current.currentTime = value; };
  const next = () => { const i = tracks.findIndex(t => t.id === current.id); playSong(tracks[(i + 1) % tracks.length]); };
  const previous = () => { const i = tracks.findIndex(t => t.id === current.id); playSong(tracks[(i - 1 + tracks.length) % tracks.length]); };
  const toggleLike = async () => { const next = !liked; setLiked(next); if (backendEnabled && session && !String(current.id).startsWith('demo-')) { if (next) await supabase.from('likes').insert({ user_id: session.user.id, track_id: current.id }); else await supabase.from('likes').delete().eq('user_id', session.user.id).eq('track_id', current.id); } };
  const signOut = async () => { if (backendEnabled) await supabase.auth.signOut(); };

  return <div className="app">
    <audio ref={audioRef} preload="metadata" />
    <aside className="sidebar"><div className="brand"><div className="brand-mark">P</div><span>pulse</span></div><nav><button className={active === 'Home' ? 'active' : ''} onClick={() => setActive('Home')}><Home size={21}/> Home</button><button className={active === 'Search' ? 'active' : ''} onClick={() => setActive('Search')}><Search size={21}/> Search</button><button className={active === 'Library' ? 'active' : ''} onClick={() => setActive('Library')}><Library size={21}/> Your Library</button></nav><div className="library-head"><span>Playlists</span><button><Plus size={19}/></button></div><div className="playlist-list"><button>Liked Songs</button><button>Focus Flow</button><button>Late Night</button><button>Weekend Energy</button></div><div className="sidebar-bottom">{backendEnabled ? 'Cloud sync enabled' : 'Demo mode · add Supabase to sync'}</div></aside>
    <main className="main"><header className="topbar"><div className="history"><button><ChevronLeft/></button><button><ChevronRight/></button></div><div className="search-wrap"><Search size={19}/><input value={query} onChange={e => { setQuery(e.target.value); setActive('Search'); }} placeholder="What do you want to play?"/></div>{session ? <button className="profile" title="Sign out" onClick={signOut}>{(session.user.user_metadata?.display_name || session.user.email || 'RK').slice(0,2).toUpperCase()}</button> : <button className="profile login-profile" onClick={() => setShowAuth(true)}><LogIn size={17}/></button>}</header>
      {active === 'Search' ? <section className="content"><h1>Search results</h1><div className="song-table">{filtered.length ? filtered.map((song, i) => <SongRow key={song.id} song={song} index={i} playing={playing && current.id === song.id} onPlay={() => playSong(song)} />) : <p className="empty">No matches found.</p>}</div></section> : active === 'Library' ? <section className="content"><div className="section-title"><h1>Your Library</h1><button onClick={() => setShowAuth(true)}>{session ? 'Synced' : 'Sign in to sync'}</button></div><div className="song-table">{tracks.map((song, i) => <SongRow key={song.id} song={song} index={i} playing={playing && current.id === song.id} onPlay={() => playSong(song)} />)}</div></section> : <section className="content"><div className="hero"><div><p className="eyebrow">YOUR SOUND, YOUR WAY</p><h1>Good evening</h1><p>Play your library, create playlists, and keep everything synced.</p><button className="primary" onClick={() => playSong(tracks[0])}><Play size={18} fill="currentColor"/> Play something</button></div><div className="hero-art"><span>♫</span></div></div><div className="section-title"><h2>Made for you</h2><button onClick={() => setActive('Search')}>Show all</button></div><div className="cards">{tracks.map(album => <article className="card" key={album.id}><Cover tone={album.tone} icon={album.icon}/><h3>{album.title}</h3><p>{album.artist} · Daily mix</p><button className="card-play" onClick={() => playSong(album)}><Play size={18} fill="currentColor"/></button></article>)}</div><div className="section-title"><h2>Recently played</h2></div><div className="song-table">{tracks.slice(0, 5).map((song, i) => <SongRow key={song.id} song={song} index={i} playing={playing && current.id === song.id} onPlay={() => playSong(song)} />)}</div></section>}
    </main>
    <footer className="player"><div className="now-playing"><Cover tone={current.tone} small url={current.cover_url}/><div><strong>{current.title}</strong><span>{current.artist}</span></div><button className={liked ? 'liked' : ''} onClick={toggleLike}><Heart size={18} fill={liked ? 'currentColor' : 'none'}/></button></div><div className="controls"><div className="control-buttons"><button><Shuffle size={16}/></button><button onClick={previous}><SkipBack size={19}/></button><button className="play" onClick={togglePlay}>{playing ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}</button><button onClick={next}><SkipForward size={19}/></button><button><Repeat2 size={16}/></button></div><div className="progress"><span>{formatTime(position)}</span><input type="range" min="0" max={current.duration_seconds || 1} value={Math.min(position, current.duration_seconds || 1)} onChange={seek}/><span>{formatTime(current.duration_seconds || 0)}</span></div></div><div className="volume"><MoreHorizontal size={19}/><Volume2 size={18}/><input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))}/></div></footer>
    {showAuth && backendEnabled && <AuthModal onClose={() => setShowAuth(false)}/>} {showAuth && !backendEnabled && <div className="modal-backdrop" onClick={() => setShowAuth(false)}><div className="auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAuth(false)}><X/></button><h2>Backend setup needed</h2><p className="muted">Add your Supabase URL and publishable key to <code>.env.local</code>, then run the SQL in <code>supabase/schema.sql</code>.</p></div></div>}
  </div>;
}

function SongRow({ song, index, playing, onPlay }) { return <div className={`song-row ${playing ? 'row-playing' : ''}`} onDoubleClick={onPlay}><div className="track-number"><span>{index + 1}</span><button onClick={onPlay}>{playing ? <Pause size={15} fill="currentColor"/> : <Play size={15} fill="currentColor"/>}</button></div><Cover tone={song.tone} icon={song.icon} small url={song.cover_url}/><div className="song-info"><strong>{song.title}</strong><span>{song.artist}</span></div><span className="album-name">{song.album || 'Single'}</span><span className="duration">{formatTime(song.duration_seconds || 0)}</span><button className="dots"><MoreHorizontal size={18}/></button></div>; }

createRoot(document.getElementById('root')).render(<App />);
