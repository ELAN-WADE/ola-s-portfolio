import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import type { TradeRecord } from '../types';

interface TradeGalleryProps {
  categoryName: string;
  trades: TradeRecord[];
  isLoading?: boolean;
  fallbackChart?: string;
}

export const TradeGallery: React.FC<TradeGalleryProps> = ({
  categoryName,
  trades,
  isLoading = false,
  fallbackChart = '/images/tech-analysis-showcase-1.jpg',
}) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Reset lightbox if the instrument changes or trades shrink
  useEffect(() => {
    setViewerIndex(null);
  }, [categoryName]);

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const stepViewer = useCallback(
    (delta: number) => {
      setViewerIndex((prev) => {
        if (prev === null || trades.length <= 1) return prev;
        return (prev + delta + trades.length) % trades.length;
      });
    },
    [trades.length]
  );

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      else if (e.key === 'ArrowRight') stepViewer(1);
      else if (e.key === 'ArrowLeft') stepViewer(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewerIndex, closeViewer, stepViewer]);

  // Loading State (4-Column Responsive Skeleton)
  if (isLoading && trades.length === 0) {
    return (
      <div
        aria-busy="true"
        aria-label={`Loading ${categoryName} trades`}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[0, 1, 2, 3].map((slot) => (
          <div key={slot} className="animate-pulse space-y-3">
            <div className="aspect-[16/10] w-full rounded-xl bg-white/[0.04] border border-white/[0.06]" />
            <div className="h-3 w-20 rounded bg-white/[0.05]" />
            <div className="h-4 w-4/5 rounded bg-white/[0.06]" />
            <div className="h-3 w-full rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (trades.length === 0) {
    return (
      <div className="py-20 px-6 text-center rounded-2xl border border-white/[0.06] bg-[#0a0a0d]/60">
        <Activity className="w-7 h-7 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-sm font-display font-semibold text-zinc-300">
          No Published Trades for {categoryName}
        </h3>
        <p className="text-xs font-mono text-zinc-500 mt-1.5 max-w-sm mx-auto">
          Trade screenshots and notes assigned to {categoryName} in the CMS will appear here automatically.
        </p>
      </div>
    );
  }

  const activeTrade = viewerIndex !== null ? trades[viewerIndex] : null;
  const activeChart = activeTrade
    ? activeTrade.chartImage || fallbackChart
    : fallbackChart;

  return (
    <>
      {/* Responsive Four-Column Trade Gallery: Desktop 4 cols • Tablet 2 cols • Mobile 1 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-9">
        {trades.map((trade, idx) => {
          const chartSrc = trade.chartImage || fallbackChart;
          const displayTitle = trade.title?.trim() || trade.ticker || categoryName;
          const note = trade.description?.trim();

          return (
            <article key={trade.id} className="group flex flex-col">
              {/* Minimalist Image-Focused Screenshot Frame (No Unwanted Cropping) */}
              <button
                type="button"
                onClick={() => setViewerIndex(idx)}
                aria-label={`View full trade screenshot: ${displayTitle}`}
                className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0a0a0d] border border-white/[0.08] group-hover:border-white/[0.22] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-zoom-in"
              >
                <img
                  src={chartSrc}
                  alt={displayTitle}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain object-center bg-[#09090c] group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                />

                {/* Subtle Hover Expand Cue */}
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Clean Minimal Typography Directly Below Image */}
              <div className="mt-3 flex flex-col">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-500">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Calendar className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span>{trade.date || '—'}</span>
                  </span>
                  {trade.ticker && (
                    <span className="text-zinc-500 shrink-0">{trade.ticker}</span>
                  )}
                </div>

                {displayTitle && (
                  <h3 className="mt-1.5 font-display font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors leading-snug line-clamp-2">
                    <button
                      type="button"
                      onClick={() => setViewerIndex(idx)}
                      className="text-left focus:outline-none hover:underline underline-offset-4 decoration-white/30"
                    >
                      {displayTitle}
                    </button>
                  </h3>
                )}

                {note && (
                  <p className="mt-1.5 text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2">
                    {note}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Full-Resolution Screenshot Image Viewer (Lightbox) */}
      {viewerIndex !== null && activeTrade && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeTrade.title || activeTrade.ticker || 'Trade screenshot viewer'}
          onClick={closeViewer}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl flex flex-col max-h-[94vh]"
          >
            {/* Viewer Header */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="min-w-0 flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-200 font-semibold">
                  {activeTrade.ticker || categoryName}
                </span>
                {activeTrade.date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{activeTrade.date}</span>
                  </span>
                )}
                <span className="text-zinc-600">•</span>
                <span>
                  {String(viewerIndex + 1).padStart(2, '0')} /{' '}
                  {String(trades.length).padStart(2, '0')}
                </span>
              </div>

              <button
                type="button"
                onClick={closeViewer}
                aria-label="Close image viewer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Full Uncropped Chart Image Stage */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center rounded-2xl overflow-hidden bg-[#09090c] border border-white/[0.12] shadow-2xl">
              <img
                key={activeTrade.id}
                src={activeChart}
                alt={activeTrade.title || activeTrade.ticker}
                className="max-h-[72vh] w-full object-contain select-none"
              />

              {/* Prev / Next Navigation Overlay Arrows */}
              {trades.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => stepViewer(-1)}
                    aria-label="Previous trade screenshot"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-zinc-100 hover:text-zinc-950 text-zinc-200 border border-white/15 backdrop-blur-md flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepViewer(1)}
                    aria-label="Next trade screenshot"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-zinc-100 hover:text-zinc-950 text-zinc-200 border border-white/15 backdrop-blur-md flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Viewer Footer Caption */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                {activeTrade.title && (
                  <h3 className="font-display font-bold text-base sm:text-lg text-zinc-100">
                    {activeTrade.title}
                  </h3>
                )}
                {activeTrade.description && (
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed max-w-3xl">
                    {activeTrade.description}
                  </p>
                )}
              </div>

              {trades.length > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => stepViewer(-1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-200 text-xs font-mono border border-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => stepViewer(1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-200 text-xs font-mono border border-white/10 transition-colors"
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
    </>
  );
};
