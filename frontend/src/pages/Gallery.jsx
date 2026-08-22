import { useState, useEffect } from 'react';
import { Camera, X, Maximize2, Calendar } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const API_URL = import.meta.env.VITE_API_URL || 'https://aws-swae.onrender.com';

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

const Gallery = () => {
  usePageTitle('Photo Gallery', 'Community moments, hackathons, and bootcamp photos of AWS SBG RIT.');

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/gallery/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.statusText}`);
        }
        const data = await response.json();
        setPhotos(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error('Error fetching gallery photos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent pt-28 pb-20 px-6 overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sbg-green/5 rounded-full blur-[120px] -z-10 pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Eyebrow Glassmorphism Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm md:text-base font-mono tracking-widest text-gray-300 uppercase mb-6 shadow-md">
          <span className="w-2 h-2 rounded-full bg-sbg-green"></span>
          <span>COMMUNITY MOMENTS</span>
        </div>

        {/* Upscaled Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Photo{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sbg-green to-teal-400">
            Gallery
          </span>
        </h1>

        {/* Upscaled Subheading */}
        <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto mb-12 leading-relaxed">
          Highlights from hackathons, cloud bootcamps, project showcases, and team meetups at RIT.
        </p>

        {/* Gallery Grid / State Handlers */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-sbg-green/30 border-t-sbg-green rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-red-500/20 rounded-3xl max-w-md mx-auto text-red-400">
            <p className="font-medium text-lg">Unable to load gallery photos.</p>
            <p className="text-xs text-gray-400 mt-2">{error}</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#10151c]/60 border border-white/10 rounded-3xl max-w-md mx-auto">
            <p className="text-gray-300 font-medium text-lg">
              Gallery is empty right now. Check back after our next event!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                {/* Photo Container */}
                <div className="aspect-video rounded-xl bg-[#10151c] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-sbg-green/50 transition-all duration-300 shadow-lg">
                  {photo.image ? (
                    <img
                      src={photo.image}
                      alt={photo.title || 'AWS SBG Gallery Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-aws-navy flex flex-col items-center justify-center p-4">
                      <Camera className="w-8 h-8 text-sbg-green/70 mb-2" />
                      <span className="text-gray-400 font-mono text-xs">AWS SBG Photo</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Photo Metadata */}
                <div className="px-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sbg-green">
                      AWS SBG RIT
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {formatDate(photo.uploaded_at)}
                    </span>
                  </div>
                  {photo.title && (
                    <h3 className="text-base font-bold text-white group-hover:text-sbg-green transition-colors line-clamp-1">
                      {photo.title}
                    </h3>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full p-6 md:p-8 rounded-2xl bg-[#0d1625] border border-white/15 space-y-4 shadow-2xl text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedPhoto.image && (
              <div className="max-h-[60vh] rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.image}
                  alt={selectedPhoto.title || 'AWS SBG Photo'}
                  className="w-full h-full object-contain max-h-[60vh]"
                />
              </div>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sbg-green font-semibold">
                  AWS Student Builder Group
                </span>
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(selectedPhoto.uploaded_at)}
                </span>
              </div>
              {selectedPhoto.title && (
                <h2 className="text-xl font-bold text-white">{selectedPhoto.title}</h2>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
