import React from 'react';
import { Award, Zap, Shield, Compass } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { INITIAL_SITE_CONTENT } from '../data/initialCmsData';

const PILLAR_ICONS = {
  Zap,
  Award,
  Compass,
  Shield,
};

export const AboutSection: React.FC = () => {
  const { database, isAdmin, setSelectedComponentId } = useCMS();
  const about = database.siteContent?.about || INITIAL_SITE_CONTENT.about;

  return (
    <section
      id="about"
      onClick={() => {
        if (isAdmin) setSelectedComponentId('site-about');
      }}
      className="relative w-full py-16 md:py-20 bg-[#09090c] border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Studio Identity Card (CMS Editable Image & Badges) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.09] bg-[#0c0c10] shadow-2xl">
              <div className="aspect-[4/3] w-full flex items-center justify-center p-10 bg-[#070708]">
                <img
                  src={about.image || '/images/ods-logo.png'}
                  alt={about.imageAlt || 'Olar Design Studio Emblem'}
                  loading="lazy"
                  className="max-w-full max-h-full w-40 h-40 md:w-48 md:h-48 object-contain"
                />
              </div>

              <div className="p-5 border-t border-white/[0.08] bg-[#0d0d11] flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    {about.studioBaseLabel}
                  </span>
                  <span className="font-display font-bold text-zinc-100 text-sm">
                    {about.studioBaseValue}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-zinc-200" />
                  <span className="text-xs font-mono text-zinc-300 font-semibold">
                    {about.availabilityBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Manifesto & Creative Thesis */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              {about.eyebrow}
            </span>

            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-100 tracking-tight leading-[1.12]">
              {about.heading}
            </h2>

            {about.paragraph1 && (
              <p className="mt-5 text-sm sm:text-base text-zinc-300 font-sans leading-relaxed">
                {about.paragraph1}
              </p>
            )}

            {(about.paragraph2 || about.highlightPhrase) && (
              <p className="mt-3 text-sm text-zinc-400 font-sans leading-relaxed">
                {about.paragraph2}{' '}
                {about.highlightPhrase && (
                  <strong className="text-zinc-100">{about.highlightPhrase}</strong>
                )}
                {about.highlightPhrase ? '.' : ''}
              </p>
            )}

            {/* Core Pillars */}
            {about.pillars && about.pillars.length > 0 && (
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {about.pillars.map((pillar, idx) => {
                  const Icon = PILLAR_ICONS[pillar.icon] || Zap;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]"
                    >
                      <Icon className="w-4 h-4 text-zinc-300 mb-2" />
                      <h4 className="font-display font-bold text-sm text-zinc-100 mb-1">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Production Environment */}
            {about.tools && about.tools.length > 0 && (
              <div className="mt-7 pt-5 border-t border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2.5">
                  {about.environmentLabel}
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-300">
                  {about.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] text-zinc-400"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
