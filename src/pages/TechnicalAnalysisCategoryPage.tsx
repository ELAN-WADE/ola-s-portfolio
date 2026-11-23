import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { TradeGallery } from '../components/TradeGallery';

export const TechnicalAnalysisCategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { database, isLoading } = useCMS();

  const category = database.tradingCategories.find(
    (c) => c.slug === slug || c.id === slug
  );

  // Display only published trades assigned to this technical analysis page, ordered via CMS
  const trades = useMemo(() => {
    if (!category) return [];
    return database.tradeRecords
      .filter((t) => t.categorySlug === category.slug && t.status === 'published')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [database.tradeRecords, category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-display font-bold mb-4">Instrument Category Not Found</h1>
        <p className="text-zinc-400 text-sm mb-6">
          The requested technical analysis category could not be found.
        </p>
        <Link
          to="/"
          className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-mono font-semibold"
        >
          &larr; Return to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950">
      <div className="film-grain" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#070708]/90 backdrop-blur-md border-b border-white/[0.08] px-6 md:px-12 py-4 flex items-center justify-between gap-4">
        <Link
          to="/#technical-analysis"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Switch Between Available Technical Analysis Pages */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {database.tradingCategories.map((inst) => {
            const isCurrent = inst.slug === category.slug;
            return (
              <Link
                key={inst.id}
                to={`/portfolio/technical-analysis/${inst.slug}`}
                className={`px-3.5 py-1 rounded-full text-xs font-mono transition-colors shrink-0 ${
                  isCurrent
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {inst.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Preserved Category Header, Market Info, Liquidity / Strategy & Metrics */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono text-zinc-400">
          <span className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10 text-white font-semibold">
            {category.name}
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {category.market} Market
          </span>
          <span>•</span>
          <span>Focus Asset: {category.focusAsset}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-zinc-100 tracking-tight leading-[1.08]">
              {category.name} ORDER FLOW &amp; TRADE EXECUTION
            </h1>
            <p className="mt-3 text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Preserved Trading Metrics: Weekly High, Typical Spread, Strategy */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 sm:gap-6 p-4 rounded-xl bg-[#0c0c10] border border-white/[0.08] shrink-0 text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Weekly High</span>
              <span className="text-zinc-100 font-semibold text-sm">{category.weeklyHigh}</span>
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Typical Spread</span>
              <span className="text-zinc-100 font-semibold text-sm">{category.spread}</span>
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Strategy</span>
              <span className="text-zinc-100 font-semibold text-sm">
                {category.strategy.split('//')[0]?.trim()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Four-Column Trade Gallery */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-white/[0.08]">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            {category.name} Trade Gallery ({trades.length})
          </span>
          <span className="text-xs font-mono text-zinc-500">
            Click any chart to expand
          </span>
        </div>

        <TradeGallery
          categoryName={category.name}
          trades={trades}
          isLoading={isLoading}
          fallbackChart={category.coverImage}
        />
      </main>
    </div>
  );
};
