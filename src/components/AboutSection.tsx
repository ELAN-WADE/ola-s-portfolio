import React from 'react';
import { Award, Zap, Shield, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative w-full py-16 md:py-20 bg-[#09090c] border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Studio Identity Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.09] bg-[#0c0c10] shadow-2xl">
              <div className="aspect-[4/3] w-full flex items-center justify-center p-10 bg-[#070708]">
                <img
                  src="/images/ods-logo.png"
                  alt="Olar Design Studio Emblem"
                  loading="lazy"
                  className="w-40 h-40 md:w-48 md:h-48 object-contain"
                />
              </div>

              <div className="p-5 border-t border-white/[0.08] bg-[#0d0d11] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    Studio Base
                  </span>
                  <span className="font-display font-bold text-zinc-100 text-sm">
                    Lagos &amp; London (GMT+1)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-200" />
                  <span className="text-xs font-mono text-zinc-300 font-semibold">
                    AVAILABLE FOR Q4
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Manifesto & Creative Thesis */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              About The Studio
            </span>

            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-100 tracking-tight leading-[1.12]">
              AT THE INTERSECTION OF AESTHETICS &amp; ACCURACY
            </h2>

            <p className="mt-5 text-sm sm:text-base text-zinc-300 font-sans leading-relaxed">
              Most designers lack commercial rhythm; most video editors ignore design hierarchy;
              and most financial analysts can&apos;t visualize a single line of data cleanly.
            </p>

            <p className="mt-3 text-sm text-zinc-400 font-sans leading-relaxed">
              Olar Design Studio operates across all three. Whether building high-conviction brand
              architecture from scratch, cutting commercial reels, or deconstructing institutional
              market structure with quantitative precision, the principle remains constant:{' '}
              <strong className="text-zinc-100">clarity is authority</strong>.
            </p>

            {/* Core Pillars */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                <Zap className="w-4 h-4 text-zinc-300 mb-2" />
                <h4 className="font-display font-bold text-sm text-zinc-100 mb-1">
                  Logo Branding
                </h4>
                <p className="text-xs text-zinc-400 font-sans">
                  Monolithic vector emblems &amp; brand guidelines that command authority.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                <Award className="w-4 h-4 text-zinc-300 mb-2" />
                <h4 className="font-display font-bold text-sm text-zinc-100 mb-1">
                  Social &amp; Flyers
                </h4>
                <p className="text-xs text-zinc-400 font-sans">
                  High-retention social carousels and print/digital event flyers built to convert.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                <Compass className="w-4 h-4 text-zinc-300 mb-2" />
                <h4 className="font-display font-bold text-sm text-zinc-100 mb-1">
                  Cinematic Video
                </h4>
                <p className="text-xs text-zinc-400 font-sans">
                  Surgical pacing and DaVinci Resolve color science with narrative precision.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                <Shield className="w-4 h-4 text-zinc-300 mb-2" />
                <h4 className="font-display font-bold text-sm text-zinc-100 mb-1">
                  Dec Edge Alpha
                </h4>
                <p className="text-xs text-zinc-400 font-sans">
                  GBP/USD order flow, predatory liquidity sweeps, and protected OBs with 1:5 RR.
                </p>
              </div>
            </div>

            {/* Production Environment */}
            <div className="mt-7 pt-5 border-t border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2.5">
                Production Environment
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-300">
                {[
                  'DaVinci Resolve Studio',
                  'Figma',
                  'Adobe Creative Cloud',
                  'TradingView Pro',
                  'Python / Quant',
                  'Blender 3D',
                  'Ableton Live',
                  'React / TypeScript',
                ].map((tool, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] text-zinc-400"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
