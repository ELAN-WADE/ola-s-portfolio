import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Target, Shield, Activity, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const TradeRecordDetailPage: React.FC = () => {
  const { slug, tradeId } = useParams<{ slug: string; tradeId: string }>();
  const { database } = useCMS();

  const category = database.tradingCategories.find(
    (c) => c.slug === slug || c.id === slug
  );

  const trade = database.tradeRecords.find(
    (t) => t.id === tradeId
  );

  if (!trade || !category) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-display font-bold mb-4">Trade Record Not Found</h1>
        <p className="text-zinc-400 text-sm mb-6">
          The requested trade analysis record could not be found.
        </p>
        <Link
          to={`/portfolio/technical-analysis/${slug || 'gbp-usd'}`}
          className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-mono font-semibold"
        >
          &larr; Return to {category?.name || 'Category'} Gallery
        </Link>
      </div>
    );
  }

  const chart = trade.chartImage || category.coverImage || '/images/tech-analysis-showcase-1.jpg';

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950">
      <div className="film-grain" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#070708]/90 backdrop-blur-md border-b border-white/[0.08] px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          to={`/portfolio/technical-analysis/${category.slug}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {category.name} Trades</span>
        </Link>

        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Trade Execution // {trade.ticker}
        </span>
      </nav>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono text-zinc-400">
          <span className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10 text-white font-semibold">
            {trade.ticker}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {trade.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Timeframe: {trade.timeframe}
          </span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-zinc-100 tracking-tight leading-[1.08] max-w-4xl">
          {trade.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-zinc-400">
            Strategy: <strong className="text-zinc-200">{trade.strategy}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">
            Setup: <strong className="text-zinc-200">{trade.setupType}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">
            Risk:Reward: <strong className="text-emerald-400">{trade.riskReward}</strong>
          </span>
        </div>
      </header>

      {/* Full Chart Display */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.09] shadow-2xl">
          <img
            src={chart}
            alt={trade.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* Full Editorial Record Breakdown */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Description & Analysis (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                Trade Analysis &amp; Thesis
              </h2>
              <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07] text-zinc-300 font-sans leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {trade.description}
              </div>
            </div>

            {/* Analysis Notes / Confluences */}
            {trade.analysisNotes && trade.analysisNotes.length > 0 && (
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                  Technical Confluences &amp; Invalidation Criteria
                </h2>
                <div className="space-y-3">
                  {trade.analysisNotes.map((note, idx) => (
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

          {/* Sidebar Execution Parameters (Only Populated Fields Rendered) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07]">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-zinc-400" />
                <span>Execution Coordinates</span>
              </h3>

              <dl className="space-y-3 text-xs font-mono">
                {trade.entryPrice && (
                  <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <dt className="text-zinc-500">Entry Price</dt>
                    <dd className="text-zinc-200 font-semibold">{trade.entryPrice}</dd>
                  </div>
                )}
                {trade.stopLoss && (
                  <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <dt className="text-zinc-500">Stop Loss</dt>
                    <dd className="text-red-400 font-semibold">{trade.stopLoss}</dd>
                  </div>
                )}
                {trade.takeProfit && (
                  <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <dt className="text-zinc-500">Take Profit</dt>
                    <dd className="text-emerald-400 font-semibold">{trade.takeProfit}</dd>
                  </div>
                )}
                {trade.exitPrice && (
                  <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <dt className="text-zinc-500">Exit Executed</dt>
                    <dd className="text-zinc-200">{trade.exitPrice}</dd>
                  </div>
                )}
                {trade.riskReward && (
                  <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <dt className="text-zinc-500">Risk : Reward</dt>
                    <dd className="text-emerald-400 font-bold">{trade.riskReward}</dd>
                  </div>
                )}
                {trade.pnlPercentage && (
                  <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                    <dt className="text-zinc-500">PnL Metric</dt>
                    <dd className="text-emerald-400 font-bold">{trade.pnlPercentage}</dd>
                  </div>
                )}
                {trade.outcome && (
                  <div className="flex justify-between py-1.5">
                    <dt className="text-zinc-500">Final Outcome</dt>
                    <dd className="text-zinc-100 font-semibold">{trade.outcome}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

