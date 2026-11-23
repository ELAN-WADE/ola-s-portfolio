import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Film,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import type { VideoProject, VideoGridItem } from '../types';

type ResolvedMedia =
  | { kind: 'direct'; src: string }
  | { kind: 'iframe'; src: string }
  | { kind: 'external'; src: string }
  | { kind: 'none' };

function resolveVideoSource(url?: string): ResolvedMedia {
  if (!url || !url.trim()) return { kind: 'none' };
  const trimmed = url.trim();

  // Direct local upload or direct video file
  if (
    trimmed.startsWith('/uploads/') ||
    /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(trimmed)
  ) {
    return { kind: 'direct', src: trimmed };
  }

  // YouTube (watch, shorts, youtu.be, embed)
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      kind: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Google Drive file preview
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      kind: 'iframe',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  return { kind: 'external', src: trimmed };
}

function getSectionVideos(section: VideoProject): VideoGridItem[] {
  if (section.recentVideos && section.recentVideos.length > 0) {
    return section.recentVideos;
  }
  return [
    {
      id: `${section.id}-fallback`,
      title: section.title,
      client: section.client,
      duration: section.duration || '01:00',
      thumbnail: section.coverImage || section.image || '/images/video-showcase-1.jpg',
      videoUrl: section.videoUrl || '',
      aspectRatio: section.aspectRatio?.includes('9:16') ? '9:16' : '16:9',
    },
  ];
}

export const VideoEditingSection: React.FC = () => {
  const { database, setSelectedComponentId, isAdmin } = useCMS();
  const videoSections = database.videoProjects;

  // Expanded section ID: tapping a section opens the 4-column grid right underneath it
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    videoSections[0]?.id || null
  );

  // Active clickable video lightbox state (no separate video detail pages)
  const [activePlayer, setActivePlayer] = useState<{
    section: VideoProject;
    videos: VideoGridItem[];
    index: number;
  } | null>(null);

  // Keep expandedSectionId valid if sections change via CMS
  useEffect(() => {
    if (
      expandedSectionId &&
      !videoSections.some((s) => s.id === expandedSectionId)
    ) {
      setExpandedSectionId(videoSections[0]?.id || null);
    }
  }, [videoSections, expandedSectionId]);

  const handleToggleSection = (section: VideoProject) => {
    setExpandedSectionId((prev) => (prev === section.id ? null : section.id));
    if (isAdmin) {
      setSelectedComponentId(`video-${section.id}`);
    }
  };

  const openVideo = (section: VideoProject, index: number) => {
    const videos = getSectionVideos(section);
    setActivePlayer({ section, videos, index });
    if (isAdmin) {
      setSelectedComponentId(`video-${section.id}`);
    }
  };

  const closePlayer = useCallback(() => {
    setActivePlayer(null);
  }, []);

  const stepPlayer = useCallback((delta: number) => {
    setActivePlayer((prev) => {
      if (!prev || prev.videos.length <= 1) return prev;
      const nextIndex = (prev.index + delta + prev.videos.length) % prev.videos.length;
      return { ...prev, index: nextIndex };
    });
  }, []);

  // Keyboard navigation for the video player overlay
  useEffect(() => {
    if (!activePlayer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePlayer();
      else if (e.key === 'ArrowRight') stepPlayer(1);
      else if (e.key === 'ArrowLeft') stepPlayer(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePlayer, closePlayer, stepPlayer]);

  const totalRecentVideos = videoSections.reduce(
    (sum, s) => sum + getSectionVideos(s).length,
    0
  );

  const activeClip = activePlayer ? activePlayer.videos[activePlayer.index] : null;
  const activeResolved = activeClip ? resolveVideoSource(activeClip.videoUrl) : { kind: 'none' as const };
  const isActiveVertical = activeClip?.aspectRatio === '9:16';

  return (
    <section
      id="video-editing"
      className="relative w-full py-20 md:py-24 bg-[#09090c] border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Discipline 02
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-100 tracking-tight leading-[1.12]">
              VIDEO EDITING &amp; MOTION
            </h2>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            {videoSections.length} Categories • {totalRecentVideos} Clickable Videos
          </div>
        </div>

        {/* Interactive Content Sections: Tap any section to open its 4-column grid of recent projects */}
        <div className="space-y-4">
          {videoSections.map((section, sectionIdx) => {
            const isOpen = expandedSectionId === section.id;
            const videos = getSectionVideos(section);
            const cover = section.coverImage || section.image || '/images/video-showcase-1.jpg';
            const isVerticalSection =
              videos.length > 0 && videos.every((v) => v.aspectRatio === '9:16');

            return (
              <div
                key={section.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0d0d12] border-white/[0.16] shadow-2xl'
                    : 'bg-[#0b0b0f] border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                {/* Tappable Section Bar */}
                <button
                  type="button"
                  onClick={() => handleToggleSection(section)}
                  aria-expanded={isOpen}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left group focus:outline-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Index Number */}
                    <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-400 shrink-0">
                      0{sectionIdx + 1}
                    </span>

                    {/* Section Thumbnail Pill */}
                    <div className="relative w-16 h-11 sm:w-20 sm:h-12 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                      <img
                        src={cover}
                        alt={section.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white/90 fill-current" />
                      </div>
                    </div>

                    {/* Section Title & Concise Caption */}
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-lg md:text-xl text-zinc-100 group-hover:text-white tracking-tight truncate">
                        {section.title}
                      </h3>
                      {section.shortCaption && (
                        <p className="text-xs text-zinc-400 font-sans truncate mt-0.5 max-w-xl">
                          {section.shortCaption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Project Count & Expand Indicator */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
                      <Film className="w-3 h-3" />
                      <span>
                        {videos.length} {videos.length === 1 ? 'Project' : 'Recent Projects'}
                      </span>
                    </span>

                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isOpen
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-100 rotate-180'
                          : 'bg-white/[0.04] text-zinc-400 border-white/10 group-hover:text-white group-hover:border-white/25'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                </button>

                {/* Opened 4-Column Clickable Video Grid System Directly Under This Section */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/[0.07]">
                    <div className="flex items-center justify-between mb-4 pt-2">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                        Recent Projects — {section.title}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        Click any video to play
                      </span>
                    </div>

                    {/* 4-Column Clickable Video Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                      {videos.map((clip, clipIdx) => {
                        const thumb = clip.thumbnail || cover;
                        const isVerticalCard = isVerticalSection || clip.aspectRatio === '9:16';

                        return (
                          <button
                            key={clip.id || clipIdx}
                            type="button"
                            onClick={() => openVideo(section, clipIdx)}
                            aria-label={`Play ${clip.title}`}
                            className="group relative flex flex-col text-left bg-[#09090d] rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/[0.24] transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                          >
                            {/* Clickable Video Thumbnail Frame */}
                            <div
                              className={`relative w-full overflow-hidden bg-black ${
                                isVerticalCard ? 'aspect-[4/5]' : 'aspect-video'
                              }`}
                            >
                              <img
                                src={thumb}
                                alt={clip.title}
                                loading="lazy"
                                className="w-full h-full object-cover object-center group-hover:scale-[1.05] transition-transform duration-300"
                              />

                              {/* Subtle Scrim */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 group-hover:via-black/10 transition-colors" />

                              {/* Index Pill */}
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/65 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
                                0{clipIdx + 1}
                              </span>

                              {/* Duration Pill */}
                              {clip.duration && (
                                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/65 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-200 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-zinc-400" />
                                  {clip.duration}
                                </span>
                              )}

                              {/* Centered Clickable Play Button */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="w-11 h-11 rounded-full bg-black/65 group-hover:bg-zinc-100 text-white group-hover:text-zinc-950 border border-white/25 group-hover:border-white flex items-center justify-center backdrop-blur-md transition-all duration-200 group-hover:scale-110 shadow-xl">
                                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                                </span>
                              </div>
                            </div>

                            {/* Minimalist Video Info Below Frame */}
                            <div className="p-3.5 flex flex-col justify-between flex-grow w-full">
                              <h4 className="font-display font-semibold text-xs sm:text-sm text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                                {clip.title}
                              </h4>
                              {(clip.client || clip.date) && (
                                <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
                                  <span className="truncate">{clip.client || section.client}</span>
                                  {clip.date && <span className="shrink-0">{clip.date}</span>}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {videoSections.length === 0 && (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs">
            No video editing categories published yet.
          </div>
        )}
      </div>

      {/* Clickable Video Theater Lightbox Player (Replaces Separate Video Detail Pages) */}
      {activePlayer && activeClip && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeClip.title}
          onClick={closePlayer}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full flex flex-col ${
              isActiveVertical ? 'max-w-md' : 'max-w-5xl'
            }`}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-3 gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                  {activePlayer.section.title} // {activePlayer.index + 1} of{' '}
                  {activePlayer.videos.length}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-white truncate">
                  {activeClip.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closePlayer}
                aria-label="Close video player"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Stage */}
            <div
              className={`relative w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl ${
                isActiveVertical ? 'aspect-[9/16] max-h-[75vh] mx-auto' : 'aspect-video'
              }`}
            >
              {activeResolved.kind === 'direct' && (
                <video
                  key={activeClip.id}
                  src={activeResolved.src}
                  poster={activeClip.thumbnail}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {activeResolved.kind === 'iframe' && (
                <iframe
                  key={activeClip.id}
                  src={activeResolved.src}
                  title={activeClip.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}

              {activeResolved.kind === 'external' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={activeClip.thumbnail}
                    alt={activeClip.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-45"
                  />
                  <div className="relative z-10 text-center p-6">
                    <a
                      href={activeResolved.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-xs font-semibold shadow-xl transition-transform hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Open Video Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {activeResolved.kind === 'none' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={activeClip.thumbnail}
                    alt={activeClip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col items-center justify-end p-6 text-center">
                    <span className="px-3 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-zinc-300 backdrop-blur-md">
                      Preview Frame • Upload MP4 or paste YouTube / Vimeo link in CMS to enable playback
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls: Metadata + Prev/Next */}
            <div className="mt-3 flex items-center justify-between gap-4 text-xs font-mono text-zinc-400">
              <div className="truncate">
                <span>{activeClip.client || activePlayer.section.client}</span>
                {activeClip.duration && (
                  <>
                    <span className="mx-2 text-zinc-600">•</span>
                    <span>{activeClip.duration}</span>
                  </>
                )}
              </div>

              {activePlayer.videos.length > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => stepPlayer(-1)}
                    aria-label="Previous video"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-200 border border-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => stepPlayer(1)}
                    aria-label="Next video"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-200 border border-white/10 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
