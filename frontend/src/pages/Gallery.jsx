import { useState, useEffect, useCallback } from 'react';
import { Camera, X, Maximize2, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const API_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// ── Category filter pill ──────────────────────────────────────────────────────
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
      active
        ? 'bg-sbg-green text-black border-sbg-green shadow-[0_0_12px_rgba(0,229,130,0.35)]'
        : 'bg-white/5 text-gray-400 border-white/10 hover:border-sbg-green/40 hover:text-white'
    }`}
  >
    {label}
  </button>
);

// ── Single album card ─────────────────────────────────────────────────────────
const AlbumCard = ({ album, onOpenLightbox }) => {
  const [hoverIdx, setHoverIdx] = useState(0);
  const images = album.images || [];
  const displayImage = images[hoverIdx]?.image || album.cover_image;

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'rgba(14, 19, 27, 0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
      onClick={() => onOpenLightbox(album, 0)}
    >
      {/* ── Image area ── */}
      <div className="relative aspect-video overflow-hidden bg-[#0a0e14]">
        {displayImage ? (
          <img
            src={displayImage}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,0,0,0))' }}
          >
            <Camera className="w-8 h-8 text-sbg-green/50 mb-2" />
            <span className="text-gray-500 text-xs font-mono">No photos yet</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Expand icon */}
        <div className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>

        {/* Photo count badge */}
        {images.length > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          >
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Mini thumbnail strip — hover to preview */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2.5 left-2.5 flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {images.slice(0, 5).map((img, i) => (
              <button
                key={img.id}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(0)}
                onClick={(e) => { e.stopPropagation(); onOpenLightbox(album, i); }}
                className={`w-6 h-6 rounded overflow-hidden border transition-all duration-150 ${
                  i === hoverIdx ? 'border-sbg-green scale-110' : 'border-white/20'
                }`}
              >
                <img src={img.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Card footer ── */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,229,130,0.12)', color: '#00e582', border: '1px solid rgba(0,229,130,0.25)' }}
          >
            {album.category}
          </span>
          <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formatDate(album.event_date)}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white group-hover:text-sbg-green transition-colors line-clamp-1">
          {album.title}
        </h3>
        {album.description && (
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{album.description}</p>
        )}
      </div>
    </div>
  );
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ album, startIndex, onClose }) => {
  const images = album?.images || [];
  const [idx, setIdx] = useState(startIndex ?? 0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  if (!album || images.length === 0) return null;
  const current = images[idx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'rgba(12,17,24,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main image */}
        <div className="relative bg-black flex items-center justify-center" style={{ maxHeight: '65vh', minHeight: '300px' }}>
          {current?.image && (
            <img
              src={current.image}
              alt={current.caption || album.title}
              className="max-h-[65vh] max-w-full object-contain"
            />
          )}

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Meta */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,229,130,0.12)', color: '#00e582', border: '1px solid rgba(0,229,130,0.25)' }}
            >
              {album.category}
            </span>
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(album.event_date)}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">{album.title}</h2>
          {current?.caption && <p className="text-gray-400 text-sm">{current.caption}</p>}
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-1.5 pt-1 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setIdx(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    i === idx ? 'border-sbg-green' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="text-gray-600 text-xs text-right">{idx + 1} / {images.length}</p>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Gallery = () => {
  usePageTitle('Photo Gallery', 'Community moments, hackathons, and bootcamp photos of AWS SBG RIT.');

  const [albums,   setAlbums]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null); // { album, startIndex }

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/gallery/`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data = await res.json();
        setAlbums(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  // Derive unique categories from loaded albums
  const categories = ['All', ...new Set(albums.map((a) => a.category).filter(Boolean))];

  const filtered = activeFilter === 'All'
    ? albums
    : albums.filter((a) => a.category === activeFilter);

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,229,130,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sbg-green" />
            <span>COMMUNITY MOMENTS</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-4">
            Photo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
              Gallery
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            Highlights from hackathons, cloud bootcamps, project showcases, and team meetups at RIT.
          </p>
        </div>

        {/* ── Category filters ── */}
        {!loading && albums.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={activeFilter === cat}
                onClick={() => setActiveFilter(cat)}
              />
            ))}
          </div>
        )}

        {/* ── States ── */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 px-6 rounded-3xl max-w-md mx-auto"
            style={{ background: 'rgba(16,21,28,0.6)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <p className="text-red-400 font-medium text-lg">Unable to load gallery.</p>
            <p className="text-gray-500 text-xs mt-2">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 px-6 rounded-3xl max-w-md mx-auto"
            style={{ background: 'rgba(16,21,28,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-gray-300 font-medium text-lg">
              {activeFilter === 'All'
                ? 'Gallery is empty right now. Check back after our next event!'
                : `No ${activeFilter} albums yet.`}
            </p>
          </div>
        )}

        {/* ── Album grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onOpenLightbox={(a, i) => setLightbox({ album: a, startIndex: i })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <Lightbox
          album={lightbox.album}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};

export default Gallery;
