import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Calendar, Tag, Layers, Palette, Plus, Trash2, Pencil } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const normalizeHexForPicker = (val: string): string => {
  const clean = (val || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return clean;
  if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return '#18181B';
};

export const BrandProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { database, isAdmin, saveDraft } = useCMS();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isEditingPalette, setIsEditingPalette] = useState(false);
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');

  const project = database.brandProjects.find(
    (p) => p.slug === slug || p.id === slug
  );

  const relatedProjects = database.brandProjects
    .filter((p) => p.id !== project?.id && p.category === project?.category)
    .slice(0, 3);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const updateProjectColors = (nextColors: string[]) => {
    if (!project) return;
    const updatedProjects = database.brandProjects.map((p) =>
      p.id === project.id ? { ...p, colors: nextColors } : p
    );
    void saveDraft({ brandProjects: updatedProjects });
  };

  const handleAddColor = () => {
    if (!project) return;
    const formatted = newColorHex.trim().startsWith('#')
      ? newColorHex.trim().toUpperCase()
      : `#${newColorHex.trim().toUpperCase()}`;
    if (!formatted || formatted === '#') return;
    const current = project.colors || [];
    updateProjectColors([...current, formatted]);
    setNewColorHex('#FFFFFF');
  };

  const handleEditColor = (index: number, value: string) => {
    if (!project) return;
    const next = [...(project.colors || [])];
    next[index] = value.toUpperCase();
    updateProjectColors(next);
  };

  const handleDeleteColor = (index: number) => {
    if (!project) return;
    const next = (project.colors || []).filter((_, idx) => idx !== index);
    updateProjectColors(next);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-display font-bold mb-4">Project Not Found</h1>
        <p className="text-zinc-400 text-sm mb-6">
          The requested brand project could not be found or has not been published yet.
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

  const cover = project.coverImage || project.image || '/images/brand-showcase-1.jpg';
  const gallery = project.galleryImages && project.galleryImages.length > 0
    ? project.galleryImages
    : [cover];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950">
      <div className="film-grain" />

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#070708]/90 backdrop-blur-md border-b border-white/[0.08] px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          to="/#brand-design"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>

        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Brand Design // {project.category}
        </span>
      </nav>

      {/* Hero Editorial Header */}
      <header className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono text-zinc-400">
          <span className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10">
            {project.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {project.year}
          </span>
          <span>•</span>
          <span>Client: {project.client}</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-zinc-100 tracking-tight leading-[1.08] max-w-4xl">
          {project.title}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-300 font-sans leading-relaxed max-w-3xl">
          {project.description}
        </p>
      </header>

      {/* Dedicated 3-Column Picture Grid System for Designs Created Under this Brand */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-8 border-b border-white/[0.08] gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
              Brand Works &amp; Design Assets
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-100 mt-1">
              Designs Produced For {project.client || project.title}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {gallery.length} {gallery.length === 1 ? 'Design Asset' : 'Design Assets'} • 3-Column Grid System
          </span>
        </div>

        {/* 3-Column Picture Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gallery.map((imgUrl, i) => (
            <div
              key={i}
              className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.08] hover:border-white/[0.22] transition-all duration-300 shadow-xl"
            >
              <img
                src={imgUrl}
                alt={`${project.title} design ${i + 1}`}
                className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/90 via-[#070708]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center justify-between w-full text-xs font-mono text-zinc-200">
                  <span>{project.client} // Asset 0{i + 1}</span>
                  <span className="text-[10px] text-zinc-400 uppercase">{project.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Content Breakdown */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Case Study Columns */}
          <div
            className={`${
              (project.colors && project.colors.length > 0) || isAdmin
                ? 'lg:col-span-8'
                : 'lg:col-span-12'
            } space-y-12`}
          >
            
            {/* Brand Strategy */}
            {project.strategy && (
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <span>Strategic Positioning</span>
                </h2>
                <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07] text-zinc-300 font-sans leading-relaxed text-sm sm:text-base">
                  {project.strategy}
                </div>
              </div>
            )}

            {/* Campaign Explanation (For Social Media & Campaigns) */}
            {project.campaignExplanation && (
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-zinc-400" />
                  <span>Campaign Architecture</span>
                </h2>
                <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07] text-zinc-300 font-sans leading-relaxed text-sm sm:text-base">
                  {project.campaignExplanation}
                </div>
              </div>
            )}

            {/* Design Objectives */}
            {project.designObjectives && project.designObjectives.length > 0 && (
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                  Design Objectives &amp; Execution
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.designObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#0b0b0e] border border-white/[0.06] flex items-start gap-3"
                    >
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-zinc-300 font-sans">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar: CMS-Editorial Color Architecture Only */}
          {((project.colors && project.colors.length > 0) || isAdmin) && (
            <div className="lg:col-span-4 space-y-8">
              <div className="p-6 rounded-2xl bg-[#0b0b0e] border border-white/[0.07]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-zinc-400" />
                    <span>Color Architecture</span>
                  </h3>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingPalette((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/[0.06] hover:bg-zinc-100 hover:text-zinc-950 text-zinc-300 border border-white/10 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>{isEditingPalette ? 'Done' : 'Edit CMS'}</span>
                    </button>
                  )}
                </div>

                {/* Palette Rows */}
                <div className="space-y-3">
                  {(project.colors || []).map((color, i) =>
                    isAdmin && isEditingPalette ? (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-white/10"
                      >
                        <input
                          type="color"
                          value={normalizeHexForPicker(color)}
                          onChange={(e) => handleEditColor(i, e.target.value)}
                          aria-label={`Pick color ${i + 1}`}
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => handleEditColor(i, e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 rounded bg-black/60 border border-white/10 text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(i)}
                          aria-label={`Remove color ${color}`}
                          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleCopyColor(color)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-7 h-7 rounded-md border border-white/15 shrink-0 shadow"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono text-zinc-200">{color}</span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                          {copiedColor === color ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-zinc-200" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </span>
                      </button>
                    )
                  )}

                  {(!project.colors || project.colors.length === 0) && isAdmin && (
                    <p className="text-xs font-mono text-zinc-500 py-2">
                      No colors posted yet. Add your brand palette below.
                    </p>
                  )}
                </div>

                {/* Inline CMS Post New Color Bar (Admin Only) */}
                {isAdmin && isEditingPalette && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      Post New Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={normalizeHexForPicker(newColorHex)}
                        onChange={(e) => setNewColorHex(e.target.value.toUpperCase())}
                        aria-label="New color picker"
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-semibold transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
              More in {project.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/portfolio/brand-design/${rel.slug || rel.id}`}
                  className="group p-4 rounded-xl bg-[#0b0b0e] border border-white/[0.07] hover:border-white/[0.18] transition-colors"
                >
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-zinc-900 mb-3">
                    <img
                      src={rel.coverImage || rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-zinc-100 truncate">
                    {rel.title}
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 mt-1">{rel.year} • {rel.client}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

