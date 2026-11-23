import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { INITIAL_SITE_CONTENT } from '../data/initialCmsData';

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'brand-design', label: 'Brand Design' },
  { id: 'video-editing', label: 'Video Editing' },
  { id: 'technical-analysis', label: 'Technical Analysis' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'about', label: 'About' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { database } = useCMS();
  const branding = database.siteContent?.branding || INITIAL_SITE_CONTENT.branding;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          isScrolled
            ? 'bg-[#070708]/90 backdrop-blur-md border-b border-white/[0.07] py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Graphical Logo */}
          <Link
            to="/"
            onClick={() => scrollToSection('hero')}
            aria-label="ODS Home"
            className="group relative inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-[0.97] transition-transform duration-150"
          >
            <img
              src={branding.logoImage || '/images/ods-logo.png'}
              alt={branding.logoAlt || 'ODS Logo'}
              className="w-9 h-9 md:w-10 md:h-10 object-contain rounded-full border border-white/15 group-hover:border-zinc-400 transition-colors duration-200"
            />
          </Link>

          {/* Centered Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 lg:gap-8 text-[13px] font-medium text-zinc-400"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="hover:text-white transition-colors duration-200 tracking-wide relative group py-1 focus:outline-none focus-visible:text-white"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-zinc-300 transition-all duration-200 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection('contact')}
              className="group relative inline-flex items-center gap-2.5 pl-4 pr-2 py-1.5 rounded-full bg-zinc-100 text-zinc-950 text-xs md:text-[13px] font-semibold tracking-tight hover:bg-white active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <span>{branding.navCtaLabel || 'Get in touch'}</span>
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-zinc-100 flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#070708]/98 backdrop-blur-xl pt-24 px-6 flex flex-col justify-between pb-10 md:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-5">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest border-b border-white/[0.08] pb-3">
              Navigation
            </span>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-xl font-display font-bold text-left text-zinc-200 hover:text-white transition-colors py-1"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="text-xl font-display font-bold text-left text-white pt-2 border-t border-white/[0.08] flex items-center justify-between"
            >
              <span>{branding.navCtaLabel || 'Get in touch'}</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-400" />
            </button>
          </nav>

          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>{branding.mobileFooterLeft}</span>
            <span>{branding.mobileFooterRight}</span>
          </div>
        </div>
      )}
    </>
  );
};
