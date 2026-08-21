import { useState } from 'react';
import { Camera, X, Maximize2, Calendar, Tag } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'AWS Cloud Bootcamp 2026',
    category: 'Workshops',
    tag: 'WORKSHOP',
    date: 'Aug 30, 2026',
    caption: 'Students learning EC2 provisioning, security groups, and S3 bucket policies in hands-on lab.',
  },
  {
    id: 2,
    title: 'Smart India Hackathon Sprint',
    category: 'Hackathons',
    tag: 'HACKATHON',
    date: 'Jul 15, 2026',
    caption: 'Overnight coding session deploying serverless microservices APIs on AWS Lambda.',
  },
  {
    id: 3,
    title: 'AUTONIX Test Drive & Demo',
    category: 'Robotics',
    tag: 'ROBOTICS',
    date: 'Jun 22, 2026',
    caption: 'Field testing autonomous vehicle telemetry stream to AWS IoT Core MQTT broker.',
  },
  {
    id: 4,
    title: 'AWS Community Tech Summit',
    category: 'Workshops',
    tag: 'CONFERENCE',
    date: 'May 10, 2026',
    caption: 'Keynote presentation on cloud architecture patterns and DevOps career roadmaps.',
  },
  {
    id: 5,
    title: 'IoT Sensor Lab Demonstration',
    category: 'Robotics',
    tag: 'HARDWARE',
    date: 'Apr 18, 2026',
    caption: 'Interfacing ESP32 microcontrollers with real-time cloud data visualization dashboards.',
  },
  {
    id: 6,
    title: 'Core Team Orientation & Meetup',
    category: 'Meetups',
    tag: 'MEETUP',
    date: 'Mar 05, 2026',
    caption: 'Founding cohort meetup aligning annual goals and hackathon participation schedule.',
  },
];

const CATEGORIES = ['All', 'Workshops', 'Hackathons', 'Robotics', 'Meetups'];

const Gallery = () => {
  usePageTitle('Photo Gallery', 'Community moments, hackathons, and bootcamp photos of AWS SBG RIT.');

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto]   = useState(null);

  const filteredItems = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

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
        <p className="text-gray-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto mb-10 leading-relaxed">
          Highlights from hackathons, cloud bootcamps, project showcases, and team meetups at RIT.
        </p>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-sbg-green text-aws-navy shadow-lg shadow-sbg-green/20'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              {/* Premium Photo Container Placeholder */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-900/40 via-purple-dim/20 to-aws-navy border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-sbg-green/50 transition-all duration-300 shadow-lg">
                <Camera className="w-8 h-8 text-sbg-green/70 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 font-mono text-xs font-medium">
                  Photo Coming Soon
                </span>
                <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Photo Metadata */}
              <div className="px-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sbg-green">
                    {item.tag}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {item.date}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sbg-green transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full p-6 md:p-8 rounded-2xl bg-[#0d1625] border border-white/15 space-y-4 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-900/60 to-aws-navy border border-white/10 flex flex-col items-center justify-center text-center p-6">
              <Camera className="w-12 h-12 text-sbg-green mb-3" />
              <span className="text-white font-mono text-sm font-bold">
                {selectedPhoto.title}
              </span>
              <span className="text-gray-400 text-xs mt-1">
                Photo Asset Placeholder
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-sbg-green px-2.5 py-0.5 rounded-full bg-sbg-green/10 border border-sbg-green/30">
                  <Tag className="w-3 h-3" /> {selectedPhoto.tag}
                </span>
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {selectedPhoto.date}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedPhoto.title}</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
