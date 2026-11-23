import React from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import type { SiteContentConfig, WorkflowStep, AboutPillar, SocialLinkItem } from '../../types';

interface SiteContentEditorProps {
  sectionType:
    | 'site-branding'
    | 'site-workflow'
    | 'site-about'
    | 'site-contact'
    | 'site-footer';
  siteContent: SiteContentConfig;
  onUpdateSection: <K extends keyof SiteContentConfig>(
    key: K,
    patch: Partial<SiteContentConfig[K]>
  ) => void;
  onTriggerUpload: (targetField: string) => void;
  onToast: (msg: string) => void;
}

export const SiteContentEditor: React.FC<SiteContentEditorProps> = ({
  sectionType,
  siteContent,
  onUpdateSection,
  onTriggerUpload,
  onToast,
}) => {
  /* 1. SITE BRANDING & SECTION HEADERS */
  if (sectionType === 'site-branding') {
    const { branding, sectionHeaders } = siteContent;
    return (
      <>
        {/* Global Site Logo Image */}
        <div>
          <label className="text-zinc-400 block mb-1.5">Site Logo Image (Navbar &amp; Footer)</label>
          <div className="flex items-center gap-3 mb-2 p-2 rounded-xl bg-black/50 border border-white/10">
            <img
              src={branding.logoImage || '/images/ods-logo.png'}
              alt={branding.logoAlt}
              className="w-12 h-12 rounded-full object-contain bg-[#070708] border border-white/15 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-zinc-400 truncate">{branding.logoImage}</p>
              <button
                type="button"
                onClick={() => onTriggerUpload('siteBranding:logoImage')}
                className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[10px]"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Logo</span>
              </button>
            </div>
          </div>
          <input
            type="text"
            value={branding.logoImage}
            onChange={(e) => onUpdateSection('branding', { logoImage: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">Logo Alt Text</label>
            <input
              type="text"
              value={branding.logoAlt}
              onChange={(e) => onUpdateSection('branding', { logoAlt: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Navbar CTA Button</label>
            <input
              type="text"
              value={branding.navCtaLabel}
              onChange={(e) => onUpdateSection('branding', { navCtaLabel: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">Mobile Menu Left</label>
            <input
              type="text"
              value={branding.mobileFooterLeft}
              onChange={(e) => onUpdateSection('branding', { mobileFooterLeft: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Mobile Menu Right</label>
            <input
              type="text"
              value={branding.mobileFooterRight}
              onChange={(e) => onUpdateSection('branding', { mobileFooterRight: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
        </div>

        {/* Section Headings & Labels */}
        <div className="pt-3 border-t border-white/[0.08] space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
            Portfolio Section Headers
          </span>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.07] space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase">Brand Design Section</span>
            <input
              type="text"
              placeholder="Eyebrow"
              value={sectionHeaders.brandEyebrow}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { brandEyebrow: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
            <input
              type="text"
              placeholder="Heading"
              value={sectionHeaders.brandTitle}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { brandTitle: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="text"
                placeholder="Tab 1"
                value={sectionHeaders.brandTabLogos}
                onChange={(e) =>
                  onUpdateSection('sectionHeaders', { brandTabLogos: e.target.value })
                }
                className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
              />
              <input
                type="text"
                placeholder="Tab 2"
                value={sectionHeaders.brandTabSocial}
                onChange={(e) =>
                  onUpdateSection('sectionHeaders', { brandTabSocial: e.target.value })
                }
                className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
              />
              <input
                type="text"
                placeholder="Tab 3"
                value={sectionHeaders.brandTabFlyers}
                onChange={(e) =>
                  onUpdateSection('sectionHeaders', { brandTabFlyers: e.target.value })
                }
                className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.07] space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase">Video Editing Section</span>
            <input
              type="text"
              placeholder="Eyebrow"
              value={sectionHeaders.videoEyebrow}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { videoEyebrow: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
            <input
              type="text"
              placeholder="Heading"
              value={sectionHeaders.videoTitle}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { videoTitle: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.07] space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase">Technical Analysis Section</span>
            <input
              type="text"
              placeholder="Eyebrow"
              value={sectionHeaders.analysisEyebrow}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { analysisEyebrow: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
            <input
              type="text"
              placeholder="Heading"
              value={sectionHeaders.analysisTitle}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { analysisTitle: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
            <input
              type="text"
              placeholder="Right Subtitle"
              value={sectionHeaders.analysisSubtitle}
              onChange={(e) =>
                onUpdateSection('sectionHeaders', { analysisSubtitle: e.target.value })
              }
              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
        </div>
      </>
    );
  }

  /* 2. WORKFLOW SECTION */
  if (sectionType === 'site-workflow') {
    const { workflow } = siteContent;
    const steps = workflow.steps || [];

    const updateStep = (idx: number, patch: Partial<WorkflowStep>) => {
      const next = steps.map((s, i) => (i === idx ? { ...s, ...patch } : s));
      onUpdateSection('workflow', { steps: next });
    };

    const addStep = () => {
      const num = String(steps.length + 1).padStart(2, '0');
      const next: WorkflowStep[] = [
        ...steps,
        {
          number: num,
          title: 'New Workflow Phase',
          subtitle: 'Phase subtitle',
          description: 'Describe this creative phase.',
          deliverables: ['Core Deliverable'],
          tools: ['Figma'],
          icon: 'Layers',
        },
      ];
      onUpdateSection('workflow', { steps: next });
      onToast('Added workflow step');
    };

    const removeStep = (idx: number) => {
      onUpdateSection('workflow', { steps: steps.filter((_, i) => i !== idx) });
      onToast('Removed workflow step');
    };

    return (
      <>
        <div>
          <label className="text-zinc-400 block mb-1">Eyebrow Label</label>
          <input
            type="text"
            value={workflow.eyebrow}
            onChange={(e) => onUpdateSection('workflow', { eyebrow: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Section Heading</label>
          <input
            type="text"
            value={workflow.heading}
            onChange={(e) => onUpdateSection('workflow', { heading: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Intro Description</label>
          <textarea
            rows={3}
            value={workflow.description}
            onChange={(e) => onUpdateSection('workflow', { description: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>

        <div className="pt-3 border-t border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-semibold">Workflow Steps ({steps.length})</span>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[10px]"
            >
              <Plus className="w-3 h-3" />
              <span>Add Step</span>
            </button>
          </div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                  Step {step.number}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                  title="Remove step"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  placeholder="01"
                  value={step.number}
                  onChange={(e) => updateStep(idx, { number: e.target.value })}
                  className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                />
                <select
                  value={step.icon}
                  onChange={(e) => updateStep(idx, { icon: e.target.value })}
                  className="col-span-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                >
                  <option value="Search">Search Icon</option>
                  <option value="Layers">Layers Icon</option>
                  <option value="Sliders">Sliders Icon</option>
                  <option value="Rocket">Rocket Icon</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Step Title"
                value={step.title}
                onChange={(e) => updateStep(idx, { title: e.target.value })}
                className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={step.subtitle}
                onChange={(e) => updateStep(idx, { subtitle: e.target.value })}
                className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-zinc-300 text-[10px]"
              />
              <textarea
                rows={2}
                placeholder="Description"
                value={step.description}
                onChange={(e) => updateStep(idx, { description: e.target.value })}
                className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
              />
              <div>
                <label className="text-[10px] text-zinc-500 block mb-0.5">
                  Deliverables (comma separated)
                </label>
                <input
                  type="text"
                  value={(step.deliverables || []).join(', ')}
                  onChange={(e) =>
                    updateStep(idx, {
                      deliverables: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-0.5">
                  Tools (comma separated)
                </label>
                <input
                  type="text"
                  value={(step.tools || []).join(', ')}
                  onChange={(e) =>
                    updateStep(idx, {
                      tools: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  /* 3. ABOUT SECTION */
  if (sectionType === 'site-about') {
    const { about } = siteContent;
    const pillars = about.pillars || [];

    const updatePillar = (idx: number, patch: Partial<AboutPillar>) => {
      const next = pillars.map((p, i) => (i === idx ? { ...p, ...patch } : p));
      onUpdateSection('about', { pillars: next });
    };

    const addPillar = () => {
      onUpdateSection('about', {
        pillars: [
          ...pillars,
          { title: 'New Pillar', description: 'Short pillar summary.', icon: 'Zap' },
        ],
      });
      onToast('Added studio pillar');
    };

    const removePillar = (idx: number) => {
      onUpdateSection('about', { pillars: pillars.filter((_, i) => i !== idx) });
      onToast('Removed studio pillar');
    };

    return (
      <>
        {/* About Image Preview + Upload */}
        <div>
          <label className="text-zinc-400 block mb-1.5">About Studio Image / Emblem</label>
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#070708] border border-white/10 flex items-center justify-center p-4 mb-2">
            <img
              src={about.image || '/images/ods-logo.png'}
              alt={about.imageAlt}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={about.image}
              onChange={(e) => onUpdateSection('about', { image: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
            <button
              type="button"
              onClick={() => onTriggerUpload('siteAbout:image')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[11px] shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">Studio Base Label</label>
            <input
              type="text"
              value={about.studioBaseLabel}
              onChange={(e) => onUpdateSection('about', { studioBaseLabel: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Availability Badge</label>
            <input
              type="text"
              value={about.availabilityBadge}
              onChange={(e) => onUpdateSection('about', { availabilityBadge: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
        </div>

        <div>
          <label className="text-zinc-400 block mb-1">Studio Base Location</label>
          <input
            type="text"
            value={about.studioBaseValue}
            onChange={(e) => onUpdateSection('about', { studioBaseValue: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-zinc-400 block mb-1">Eyebrow Label</label>
          <input
            type="text"
            value={about.eyebrow}
            onChange={(e) => onUpdateSection('about', { eyebrow: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Heading</label>
          <textarea
            rows={2}
            value={about.heading}
            onChange={(e) => onUpdateSection('about', { heading: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Lead Paragraph</label>
          <textarea
            rows={3}
            value={about.paragraph1}
            onChange={(e) => onUpdateSection('about', { paragraph1: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Second Paragraph</label>
          <textarea
            rows={3}
            value={about.paragraph2}
            onChange={(e) => onUpdateSection('about', { paragraph2: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Highlighted Closing Phrase</label>
          <input
            type="text"
            value={about.highlightPhrase}
            onChange={(e) => onUpdateSection('about', { highlightPhrase: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>

        {/* Core Pillars */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-semibold">Core Pillars ({pillars.length})</span>
            <button
              type="button"
              onClick={addPillar}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[10px]"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-black/50 border border-white/10 space-y-1.5"
            >
              <div className="flex items-center gap-1.5">
                <select
                  value={pillar.icon}
                  onChange={(e) =>
                    updatePillar(idx, { icon: e.target.value as AboutPillar['icon'] })
                  }
                  className="px-1.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                >
                  <option value="Zap">Zap</option>
                  <option value="Award">Award</option>
                  <option value="Compass">Compass</option>
                  <option value="Shield">Shield</option>
                </select>
                <input
                  type="text"
                  value={pillar.title}
                  onChange={(e) => updatePillar(idx, { title: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => removePillar(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <textarea
                rows={2}
                value={pillar.description}
                onChange={(e) => updatePillar(idx, { description: e.target.value })}
                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-zinc-300 text-[10px]"
              />
            </div>
          ))}
        </div>

        {/* Production Environment Tools */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2">
          <div>
            <label className="text-zinc-400 block mb-1">Environment Label</label>
            <input
              type="text"
              value={about.environmentLabel}
              onChange={(e) => onUpdateSection('about', { environmentLabel: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Tools (comma separated)</label>
            <textarea
              rows={2}
              value={(about.tools || []).join(', ')}
              onChange={(e) =>
                onUpdateSection('about', {
                  tools: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
        </div>
      </>
    );
  }

  /* 4. CONTACT SECTION */
  if (sectionType === 'site-contact') {
    const { contact } = siteContent;
    const socials = contact.socials || [];

    const updateSocial = (idx: number, patch: Partial<SocialLinkItem>) => {
      const next = socials.map((s, i) => (i === idx ? { ...s, ...patch } : s));
      onUpdateSection('contact', { socials: next });
    };

    const addSocial = () => {
      onUpdateSection('contact', {
        socials: [...socials, { name: 'LinkedIn', url: 'https://' }],
      });
      onToast('Added social link');
    };

    const removeSocial = (idx: number) => {
      onUpdateSection('contact', { socials: socials.filter((_, i) => i !== idx) });
      onToast('Removed social link');
    };

    return (
      <>
        <div>
          <label className="text-zinc-400 block mb-1">Eyebrow Label</label>
          <input
            type="text"
            value={contact.eyebrow}
            onChange={(e) => onUpdateSection('contact', { eyebrow: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Heading</label>
          <textarea
            rows={2}
            value={contact.heading}
            onChange={(e) => onUpdateSection('contact', { heading: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Description</label>
          <textarea
            rows={3}
            value={contact.description}
            onChange={(e) => onUpdateSection('contact', { description: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-400 block mb-1">Inquiries Label</label>
            <input
              type="text"
              value={contact.inquiriesLabel}
              onChange={(e) => onUpdateSection('contact', { inquiriesLabel: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Contact Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => onUpdateSection('contact', { email: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-semibold">Social Links ({socials.length})</span>
            <button
              type="button"
              onClick={addSocial}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[10px]"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
          {socials.map((soc, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Label"
                value={soc.name}
                onChange={(e) => updateSocial(idx, { name: e.target.value })}
                className="w-24 px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
              />
              <input
                type="text"
                placeholder="https://..."
                value={soc.url}
                onChange={(e) => updateSocial(idx, { url: e.target.value })}
                className="flex-1 min-w-0 px-2 py-1 rounded bg-black/60 border border-white/10 text-zinc-300 text-[10px]"
              />
              <button
                type="button"
                onClick={() => removeSocial(idx)}
                className="p-1 text-zinc-500 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="text-zinc-400 block mb-1">Discipline Options (comma separated)</label>
          <textarea
            rows={2}
            value={(contact.disciplines || []).join(', ')}
            onChange={(e) =>
              onUpdateSection('contact', {
                disciplines: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Budget Tiers (one per line)</label>
          <textarea
            rows={4}
            value={(contact.budgetOptions || []).join('\n')}
            onChange={(e) =>
              onUpdateSection('contact', {
                budgetOptions: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[10px]"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Submit Button Text</label>
          <input
            type="text"
            value={contact.submitLabel}
            onChange={(e) => onUpdateSection('contact', { submitLabel: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Confirmation Heading</label>
          <input
            type="text"
            value={contact.successTitle}
            onChange={(e) => onUpdateSection('contact', { successTitle: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Confirmation Message</label>
          <textarea
            rows={2}
            value={contact.successMessage}
            onChange={(e) => onUpdateSection('contact', { successMessage: e.target.value })}
            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
          />
        </div>
      </>
    );
  }

  /* 5. FOOTER SECTION */
  const { footer } = siteContent;
  return (
    <>
      <div>
        <label className="text-zinc-400 block mb-1">Studio Name</label>
        <input
          type="text"
          value={footer.studioName}
          onChange={(e) => onUpdateSection('footer', { studioName: e.target.value })}
          className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
        />
      </div>
      <div>
        <label className="text-zinc-400 block mb-1">Disciplines Subtitle</label>
        <textarea
          rows={2}
          value={footer.disciplinesLine}
          onChange={(e) => onUpdateSection('footer', { disciplinesLine: e.target.value })}
          className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-zinc-400 block mb-1">Status Label</label>
          <input
            type="text"
            value={footer.statusLabel}
            onChange={(e) => onUpdateSection('footer', { statusLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Status Value</label>
          <input
            type="text"
            value={footer.statusValue}
            onChange={(e) => onUpdateSection('footer', { statusValue: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-zinc-400 block mb-1">Recognition Label</label>
          <input
            type="text"
            value={footer.recognitionLabel}
            onChange={(e) => onUpdateSection('footer', { recognitionLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Recognition Value</label>
          <input
            type="text"
            value={footer.recognitionValue}
            onChange={(e) => onUpdateSection('footer', { recognitionValue: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-zinc-400 block mb-1">Architecture Label</label>
          <input
            type="text"
            value={footer.architectureLabel}
            onChange={(e) => onUpdateSection('footer', { architectureLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
        <div>
          <label className="text-zinc-400 block mb-1">Architecture Value</label>
          <input
            type="text"
            value={footer.architectureValue}
            onChange={(e) => onUpdateSection('footer', { architectureValue: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
          />
        </div>
      </div>
      <div>
        <label className="text-zinc-400 block mb-1">Copyright Line</label>
        <input
          type="text"
          value={footer.copyright}
          onChange={(e) => onUpdateSection('footer', { copyright: e.target.value })}
          className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
        />
      </div>
      <div>
        <label className="text-zinc-400 block mb-1">Bottom Tagline</label>
        <input
          type="text"
          value={footer.tagline}
          onChange={(e) => onUpdateSection('footer', { tagline: e.target.value })}
          className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
        />
      </div>
    </>
  );
};
