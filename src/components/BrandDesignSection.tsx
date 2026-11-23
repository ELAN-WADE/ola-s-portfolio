import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { BrandCategory } from '../types';

export const BrandDesignSection: React.FC = () => {
  const { database, setSelectedComponentId, isAdmin } = useCMS();
  // Default to Logo Branding; "All" link has been removed
  const [activeCategory, setActiveCategory] = useState<BrandCategory>('Logo Branding');
  const [showAllBrands, setShowAllBrands] = useState<boolean>(false);

  const brandProjects = database.brandProjects;

  // Filter projects by current active discipline (Brand Logos, Social Media Design, Flyers)
  const filteredProjects = useMemo(() => {
    return brandProjects.filter((p) => p.category === activeCategory);
  }, [brandProjects, activeCategory]);

  // Front displays strictly the first 3 cards unless user clicks "See More Brands"
  const displayedProjects = showAllBrands ? filteredProjects : filteredProjects.slice(0, 3);
  const hasMoreBrands = filteredProjects.length > 3;

  const categories: { key: BrandCategory; label: string }[] = [
    { key: 'Logo Branding', label: 'Brand Logos' },
    { key: 'Social Media Design', label: 'Social Media' },
    { key: 'Flyers', label: 'Flyers' },
  ];

  const handleCategoryChange = (cat: BrandCategory) => {
    setActiveCategory(cat);
    setShowAllBrands(false); // Reset to front 3-card view on tab change
  };

  return (
    <section
      id="brand-design"
      className="relative w-full py-20 md:py-24 bg-[#070708] border-b border-white/[0.06] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Simplified Section Header (Homepage = Visual Preview) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-10 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Discipline 01
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-zinc-100 tracking-tight leading-[1.12]">
              BRAND DESIGN &amp; VISUAL SYSTEMS
            </h2>
          </div>

          {/* Discipline Filter Tabs (No "All" Link - Specific Disciplines Only) */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors duration-150 ${
                  activeCategory === cat.key
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.07]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Responsive Grid System for Brands Worked With */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project) => {
            const detailUrl = `/portfolio/brand-design/${project.slug || project.id}`;
            const cover = project.coverImage || project.image || '/images/brand-showcase-1.jpg';

            return (
              <div
                key={project.id}
                onClick={() => {
                  if (isAdmin) {
                    setSelectedComponentId(`brand-${project.id}`);
                  }
                }}
                className="group relative flex flex-col bg-[#0b0b0e] rounded-xl overflow-hidden border border-white/[0.07] hover:border-white/[0.18] transition-all duration-200"
              >
                {/* 1. Project Cover Image Container */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#101014]">
                  <img
                    src={cover}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* 3. Minimalist Floating 'See More' Action (Leads to 3-column picture grid of brand assets) */}
                  <Link
                    to={detailUrl}
                    aria-label={`See more details for ${project.title}`}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-zinc-100 hover:text-zinc-950 text-zinc-200 text-xs font-mono backdrop-blur-md border border-white/15 transition-all duration-150 shadow-lg group-hover:translate-y-0"
                  >
                    <span>See More</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-400 border border-white/10">
                    {project.category}
                  </span>
                </div>

                {/* 2. Brand Title & Concise Caption Below Image (Clean Typography) */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-display font-semibold text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 font-sans line-clamp-2">
                      {project.shortCaption || project.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>{project.client}</span>
                    <span>{project.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state fallback */}
        {filteredProjects.length === 0 && (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs">
            No brand projects published in this category yet.
          </div>
        )}

        {/* See More Brands / Show Less Brands Toggle (Expands 3-column grid for all brands worked with) */}
        {hasMoreBrands && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-zinc-100 hover:text-zinc-950 text-zinc-300 text-xs font-mono font-medium border border-white/10 hover:border-white/20 transition-all duration-200 shadow-md"
            >
              <span>
                {showAllBrands
                  ? 'Show Fewer Brands'
                  : `See More Brands (${filteredProjects.length - 3} more)`}
              </span>
              {showAllBrands ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
