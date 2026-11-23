import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Shield,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const TechnicalAnalysisCategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { database } = useCMS();
  const [selectedTradeIndex, setSelectedTradeIndex] = useState(0);

  const category = database.tradingCategories.find(
    (c) => c.slug === slug || c.id === slug
  );

  const trades = database.tradeRecords.filter(
    (t) => t.categorySlug === slug
  );

  const otherCategories = database.tradingCategories.filter(
    (c) => c.slug !== slug
  );

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

  // Active Trade Record: directly rendered on this page without requiring a secondary 'See More'
  const activeTrade = trades[selectedTradeIndex] || trades[0];
  const chart = activeTrade?.chartImage || category.coverImage || '/images/tech-analysis-showcase-1.jpg';

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950">
      <div className="film-grain" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#070708]/90 backdrop-blur-md border-b border-white/[0.08] px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          to="/#technical-analysis"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Switch Between Available Instruments */}
        <div className="flex items-center gap-2">
          {database.tradingCategories.map((inst) => {
            const isCurrent = inst.slug === category.slug;
            return (
              <Link
                key={inst.id}
                to={`/portfolio/technical-analysis/${inst.slug}`}
                onClick={() => setSelectedTradeIndex(0)}
                className={`px-3.5 py-1 rounded-full text-xs font-mono transition-colors ${
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

      {/* Category Header */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8">
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

          {/* Meaningful Trading Metrics */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-[#0c0c10] border border-white/[0.08] shrink-0 text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Weekly High</span>
              <span className="text-zinc-100 font-semibold text-sm">{category.weeklyHigh}</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Typical Spread</span>
              <span className="text-zinc-100 font-semibold text-sm">{category.spread}</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Strategy</span>
              <span className="text-zinc-100 font-semibold text-sm">
                {category.strategy.split('//')[0]?.trim()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Trade Record Execution Section (Directly Rendered - No Secondary 'See More') */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {activeTrade ? (
          <div>
            {/* Multiple Trades Switcher (if more than 1 trade exists for this instrument) */}
            {trades.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-xl bg-[#0c0c10] border border-white/[0.08] w-fit">
                {trades.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTradeIndex(idx)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                      selectedTradeIndex === idx
                        ? 'bg-zinc-100 text-zinc-950 font-semibold shadow'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>
                      Trade 0{idx + 1}: {t.setupType} ({t.riskReward})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Trade Title & Coordinates Bar */}
            <div className="pb-6 mb-8 border-b border-white/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeTrade.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {activeTrade.timeframe}
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300 font-semibold">
                    Setup: {activeTrade.setupType}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-zinc-100 tracking-tight">
                  {activeTrade.title}
                </h2>
              </div>

              {/* R:R & Outcome Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
                  {activeTrade.riskReward}
                </span>
                {activeTrade.outcome && (
                  <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-zinc-300">
                    {activeTrade.outcome}
                  </span>
                )}
              </div>
            </div>

            {/* Full High-Resolution Chart Display */}
            <section className="mb-14">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.09] shadow-2xl">
                <img
                  src={chart}
                  alt={activeTrade.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070708]/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
                  {activeTrade.ticker} • {activeTrade.timeframe} • Execution Chart
                </div>
              </div>
            </section>

            {/* Direct Trade Breakdown: Analysis Thesis + Execution Coordinates */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Thesis & Confluences (8 cols) */}
              <div className="lg:col-span-8 space-y-10">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-400" />
                    <span>Trade Analysis &amp; Order Flow Thesis</span>
                  </h3>
                  <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07] text-zinc-300 font-sans leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {activeTrade.description}
                  </div>
                </div>

                {/* Technical Confluences */}
                {activeTrade.analysisNotes && activeTrade.analysisNotes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-zinc-400" />
                      <span>Technical Confluences &amp; Invalidation Criteria</span>
                    </h3>
                    <div className="space-y-3">
                      {activeTrade.analysisNotes.map((note, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#0b0b0e] border border-white/[0.06] flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-zinc-300 font-sans">{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Execution Coordinates Table (4 cols) */}
              <div className="lg:col-span-4 space-y-8">
                <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07]">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-zinc-400" />
                    <span>Execution Coordinates</span>
                  </h3>

                  <dl className="space-y-3 text-xs font-mono">
                    <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                      <dt className="text-zinc-500">Focus Instrument</dt>
                      <dd className="text-zinc-200 font-bold">{activeTrade.ticker}</dd>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                      <dt className="text-zinc-500">Framework</dt>
                      <dd className="text-zinc-200">{activeTrade.strategy}</dd>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                      <dt className="text-zinc-500">Timeframe</dt>
                      <dd className="text-zinc-200">{activeTrade.timeframe}</dd>
                    </div>

                    {activeTrade.entryPrice && (
                      <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                        <dt className="text-zinc-500">Entry Price</dt>
                        <dd className="text-emerald-400 font-bold">{activeTrade.entryPrice}</dd>
                      </div>
                    )}

                    {activeTrade.stopLoss && (
                      <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                        <dt className="text-zinc-500">Stop Loss</dt>
                        <dd className="text-red-400 font-bold">{activeTrade.stopLoss}</dd>
                      </div>
                    )}

                    {activeTrade.takeProfit && (
                      <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                        <dt className="text-zinc-500">Take Profit</dt>
                        <dd className="text-emerald-400 font-bold">{activeTrade.takeProfit}</dd>
                      </div>
                    )}

                    <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                      <dt className="text-zinc-500">Risk : Reward</dt>
                      <dd className="text-zinc-100 font-bold">{activeTrade.riskReward}</dd>
                    </div>

                    {activeTrade.pnlPercentage && (
                      <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                        <dt className="text-zinc-500">Net Return</dt>
                        <dd className="text-emerald-400 font-bold">{activeTrade.pnlPercentage}</dd>
                      </div>
                    )}

                    {activeTrade.outcome && (
                      <div className="flex justify-between pt-2">
                        <dt className="text-zinc-500">Outcome</dt>
                        <dd className="text-emerald-400 font-semibold">{activeTrade.outcome}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="py-20 text-center rounded-2xl bg-[#0b0b0e] border border-white/[0.06]">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-display font-semibold text-zinc-300">
              No Published Trades for {category.name}
            </h3>
            <p className="text-xs font-mono text-zinc-500 mt-1 max-w-sm mx-auto">
              Trade records for this instrument are currently being prepared.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

