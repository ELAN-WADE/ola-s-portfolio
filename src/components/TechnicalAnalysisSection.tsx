import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, TrendingUp, BarChart2 } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { INITIAL_SITE_CONTENT } from '../data/initialCmsData';
import { TradingCategory } from '../types';

export const TechnicalAnalysisSection: React.FC = () => {
  const { database, setSelectedComponentId, isAdmin } = useCMS();
  const headers = database.siteContent?.sectionHeaders || INITIAL_SITE_CONTENT.sectionHeaders;
  const tradingCategories = database.tradingCategories;
  const tradeRecords = database.tradeRecords;

  const [selectedSlug, setSelectedSlug] = useState<string>(
    tradingCategories[0]?.slug || 'gbp-usd'
  );

  const activeCategory =
    tradingCategories.find((c) => c.slug === selectedSlug) || tradingCategories[0];

  const categoryTrades = tradeRecords.filter(
    (t) => t.categorySlug === (activeCategory?.slug || 'gbp-usd') && t.status === 'published'
  );

  return (
    <section
      id="technical-analysis"
      className="relative w-full py-20 md:py-24 bg-[#070708] border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Simplified Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                {headers.analysisEyebrow}
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-100 tracking-tight leading-[1.12]">
              {headers.analysisTitle}
            </h2>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            {headers.analysisSubtitle}
          </div>
        </div>

        {/* 3 Supported Instrument Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tradingCategories.map((cat) => {
            const isSelected = cat.slug === activeCategory?.slug;
            const tradesCount = tradeRecords.filter(
              (t) => t.categorySlug === cat.slug && t.status === 'published'
            ).length;
            const catRoute = `/portfolio/technical-analysis/${cat.slug}`;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedSlug(cat.slug);
                  if (isAdmin) {
                    setSelectedComponentId(`trade-cat-${cat.id}`);
                  }
                }}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#121217] border-zinc-500 shadow-xl'
                    : 'bg-[#0a0a0d] border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-zinc-100' : 'bg-zinc-600'
                        }`}
                      />
                      <h3 className="font-display font-bold text-lg text-zinc-100 tracking-tight">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      {cat.market}
                    </span>
                  </div>

                  {/* Simplified Clean Metrics (Preserving Weekly High, Spread, Strategy) */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/[0.06] text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Weekly High</span>
                      <span className="text-zinc-200 font-semibold">{cat.weeklyHigh || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Spread</span>
                      <span className="text-zinc-200 font-semibold">{cat.spread || '—'}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                    {cat.strategy}
                  </p>
                </div>

                {/* Minimalist Floating 'See More' Action */}
                <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {tradesCount} {tradesCount === 1 ? 'Trade Record' : 'Trade Records'}
                  </span>
                  <Link
                    to={catRoute}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`View trade records for ${cat.name}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-zinc-100 hover:text-zinc-950 text-zinc-300 text-xs font-mono border border-white/10 transition-colors"
                  >
                    <span>See More</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Instrument Interactive Chart Terminal Preview */}
        {activeCategory && (
          <div className="rounded-2xl bg-[#0c0c10] border border-white/[0.09] shadow-2xl overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="px-6 py-4 bg-[#101015] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-zinc-400" />
                <span className="font-display font-bold text-sm text-zinc-100 tracking-tight">
                  {activeCategory.name} Analysis Terminal
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  Focus: {activeCategory.focusAsset}
                </span>
              </div>

              <Link
                to={`/portfolio/technical-analysis/${activeCategory.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-mono font-semibold transition-colors shadow"
              >
                <span>View Full {activeCategory.name} Trade Gallery</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Terminal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/[0.08] bg-[#070708]">
                  <img
                    src={activeCategory.coverImage || '/images/tech-analysis-showcase-1.jpg'}
                    alt={`${activeCategory.name} Chart`}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-xs font-mono text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
                    Strategy: {activeCategory.strategy}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                    Execution Methodology
                  </span>
                  <h4 className="font-display font-bold text-xl text-zinc-100 mb-3">
                    {activeCategory.name} Technical Framework
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                    {activeCategory.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Published Trades: {categoryTrades.length}</span>
                  <Link
                    to={`/portfolio/technical-analysis/${activeCategory.slug}`}
                    className="text-zinc-200 hover:text-white inline-flex items-center gap-1 font-semibold"
                  >
                    Open Category Gallery &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
