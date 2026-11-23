import React, { useState } from 'react';
import { Search, Layers, Sliders, Rocket, CheckCircle } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { INITIAL_SITE_CONTENT } from '../data/initialCmsData';

const ICON_MAP = {
  Search,
  Layers,
  Sliders,
  Rocket,
};

export const WorkflowSection: React.FC = () => {
  const { database, isAdmin, setSelectedComponentId } = useCMS();
  const workflow = database.siteContent?.workflow || INITIAL_SITE_CONTENT.workflow;
  const steps = workflow.steps || INITIAL_SITE_CONTENT.workflow.steps;
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      id="workflow"
      onClick={() => {
        if (isAdmin) setSelectedComponentId('site-workflow');
      }}
      className="relative w-full py-16 md:py-20 bg-[#070708] border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Split Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start pb-8 mb-10 border-b border-white/[0.08]">
          <div className="lg:col-span-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              {workflow.eyebrow}
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-100 tracking-tight leading-[1.12]">
              {workflow.heading}
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              {workflow.description}
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            const IconComponent = ICON_MAP[step.icon as keyof typeof ICON_MAP] || Search;

            return (
              <div
                key={`${step.number}-${idx}`}
                onMouseEnter={() => setActiveStep(idx)}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl transition-colors duration-200 relative flex flex-col justify-between cursor-pointer border ${
                  isSelected
                    ? 'bg-[#111115] border-zinc-600'
                    : 'bg-[#0b0b0e] border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`font-display text-3xl font-extrabold transition-colors ${
                        isSelected ? 'text-zinc-100' : 'text-zinc-600'
                      }`}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-zinc-200 text-zinc-950'
                          : 'bg-white/[0.04] text-zinc-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-zinc-100 mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <span className="text-xs font-mono text-zinc-500 block mb-3">
                    {step.subtitle}
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2.5">
                    Key Deliverables
                  </span>
                  <div className="space-y-1.5">
                    {(step.deliverables || []).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-zinc-300 font-sans"
                      >
                        <CheckCircle className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(step.tools || []).map((tool, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
