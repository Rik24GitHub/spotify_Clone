import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Search, Library, Plus, Heart, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import './styles.css';

const albums = [
  { title: 'Midnight Drive', artist: 'Nova Lane', tone: 'violet', icon: '✦' },
  { title: 'Neon Skies', artist: 'The Satellites', tone: 'blue', icon: '☾' },
  { title: 'Golden Hour', artist: 'Mira Sol', tone: 'gold', icon: '◐' },
  { title: 'Afterglow', artist: 'Kairo', tone: 'pink', icon: '✧' },
  { title: 'City Lights', artist: 'Atlas Youth', tone: 'cyan', icon: '⌁' },
  { title: 'Daydreams', artist: 'Luna Park', tone: 'green', icon: '☼' },
];

const songs = [
  { title: 'Midnight Drive', artist: 'Nova Lane', album: 'Midnight Drive', duration: '3:42', tone: 'violet' },
  { title: 'Neon Skies', artist: 'The Satellites', album: 'Neon Skies', duration: '4:08', tone: 'blue' },
  { title: 'Golden Hour', artist: 'Mira Sol', album: 'Golden Hour', duration: '3:26', tone: 'gold' },
  { title: 'Afterglow', artist: 'Kairo', album: 'Afterglow', duration: '3:51', tone: 'pink' },
  { title: 'City Lights', artist: 'Atlas Youth', album: 'City Lights', duration: '4:15', tone: 'cyan' },
];

function Cover({ tone, icon, small = false }) {
  return <div className={`cover ${tone} ${small ? 'small' : ''}`}><span>{icon || '✦'}</span></div>;
}

function App() {
  const [active, setActive] = useState('Home');
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(songs[0]);
  const [liked, setLiked] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? songs.filter(s => `${s.title} ${s.artist} ${s.album}`.toLowerCase().includes(q)) : songs;
  }, [query]);

  const playSong = song => { setCurrent(song); setPlaying(true); };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">P</div><span>pulse</span></div>
        <nav>
          <button className={active === 'Home' ? 'active' : ''} onClick={() => setActive('Home')}><Home size={21}/> Home</button>
          <button className={active === 'Search' ? 'active' : ''} onClick={() => setActive('Search')}><Search size={21}/> Search</button>
          <button className={active === 'Library' ? 'active' : ''} onClick={() => setActive('Library')}><Library size={21}/> Your Library</button>
        </nav>
        <div className="library-head"><span>Playlists</span><button><Plus size={19}/></button></div>
        <div className="playlist-list"><button>Liked Songs</button><button>Focus Flow</button><button>Late Night</button><button>Weekend Energy</button><button>Discover Weekly</button></div>
        <div className="sidebar-bottom">Made with ♫ for music lovers</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="history"><button><ChevronLeft/></button><button><ChevronRight/></button></div>
          <div className="search-wrap"><Search size={19}/><input value={query} onChange={e => {setQuery(e.target.value); setActive('Search')}} placeholder="What do you want to play?"/></div>
          <div className="profile">RK</div>
        </header>

        {active === 'Search' && query ? (
          <section className="content"><h1>Search results</h1><div className="song-table">{filtered.length ? filtered.map((song, i) => <SongRow key={song.title} song={song} index={i} playing={playing && current.title === song.title} onPlay={() => playSong(song)} />) : <p className="empty">No matches found.</p>}</div></section>
        ) : (
          <section className="content">
            <div className="hero">
              <div><p className="eyebrow">YOUR SOUND, YOUR WAY</p><h1>Good evening</h1><p>Jump back in with your favorite sounds.</p><button className="primary" onClick={() => playSong(songs[0])}><Play size={18} fill="currentColor"/> Play something</button></div>
              <div className="hero-art"><span>♫</span></div>
            </div>

            <div className="section-title"><h2>Made for you</h2><button>Show all</button></div>
            <div className="cards">{albums.map(album => <article className="card" key={album.title} onDoubleClick={() => playSong(songs.find(s => s.title === album.title) || songs[0])}><Cover tone={album.tone} icon={album.icon}/><h3>{album.title}</h3><p>{album.artist} · Daily mix</p><button className="card-play" onClick={() => playSong(songs.find(s => s.title === album.title) || songs[0])}><Play size={18} fill="currentColor"/></button></article>)}</div>

            <div className="section-title"><h2>Recently played</h2><button>Show all</button></div>
            <div className="song-table">{songs.slice(0,4).map((song, i) => <SongRow key={song.title} song={song} index={i} playing={playing && current.title === song.title} onPlay={() => playSong(song)} />)}</div>
          </section>
        )}
      </main>

      <footer className="player">
        <div className="now-playing"><Cover tone={current.tone} small/><div><strong>{current.title}</strong><span>{current.artist}</span></div><button className={liked ? 'liked' : ''} onClick={() => setLiked(!liked)}><Heart size={18} fill={liked ? 'currentColor' : 'none'}/></button></div>
        <div className="controls"><div className="control-buttons"><button><Shuffle size={16}/></button><button><SkipBack size={19}/></button><button className="play" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}</button><button><SkipForward size={19}/></button><button><Repeat2 size={16}/></button></div><div className="progress"><span>1:12</span><div className="track"><div className="fill"/></div><span>{current.duration}</span></div></div>
        <div className="volume"><MoreHorizontal size={19}/><Volume2 size={18}/><div className="volume-track"><div/></div></div>
      </footer>
    </div>
  );
}

function SongRow({ song, index, playing, onPlay }) {
  return <div className={`song-row ${playing ? 'row-playing' : ''}`} onDoubleClick={onPlay}><div className="track-number"><span>{index + 1}</span><button onClick={onPlay}>{playing ? <Pause size={15} fill="currentColor"/> : <Play size={15} fill="currentColor"/>}</button></div><Cover tone={song.tone} small/><div className="song-info"><strong>{song.title}</strong><span>{song.artist}</span></div><span className="album-name">{song.album}</span><span className="duration">{song.duration}</span><button className="dots"><MoreHorizontal size={18}/></button></div>;
}

createRoot(document.getElementById('root')).render(<App />);
