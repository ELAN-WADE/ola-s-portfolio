import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useCMS } from '../context/CMSContext';

// Animated Count-Up Number for Simplified Metrics (No Card Backgrounds/Borders)
const AnimatedMetric: React.FC<{
  targetValue: string;
  numericValue?: number;
  suffix?: string;
  isActive: boolean;
  reducedMotion: boolean;
}> = ({ targetValue, numericValue, suffix = '', isActive, reducedMotion }) => {
  const [displayValue, setDisplayValue] = useState<string>(targetValue);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Extract numeric portion if not explicitly passed
    const parsedNum =
      numericValue !== undefined
        ? numericValue
        : parseFloat(targetValue.replace(/[^0-9.]/g, ''));

    if (isNaN(parsedNum) || reducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    const duration = 1200; // ms
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(parsedNum * eased);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(targetValue);
      } else {
        setDisplayValue(`${currentVal}${suffix}`);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isActive, targetValue, numericValue, suffix, reducedMotion]);

  return <span className="tabular-nums font-mono">{displayValue}</span>;
};

// Restrained Typewriter / Progressive Reveal Supporting Phrase
const TypewriterText: React.FC<{
  text: string;
  isActive: boolean;
  reducedMotion: boolean;
}> = ({ text, isActive, reducedMotion }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!isActive) {
      setDisplayed('');
      return;
    }

    if (reducedMotion) {
      setDisplayed(text);
      return;
    }

    setDisplayed('');
    let idx = 0;
    const speed = 25; // ms per char
    const timer = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, isActive, reducedMotion]);

  return (
    <span className="inline-block">
      {displayed}
      {!reducedMotion && displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 bg-zinc-400 ml-1 animate-pulse align-middle" />
      )}
    </span>
  );
};

export const CinematicHero: React.FC<{ onSelectSection?: () => void }> = ({ onSelectSection }) => {
  const { database, setSelectedComponentId, isAdmin } = useCMS();
  const heroConfig = database.heroConfig;
  const slides = heroConfig.slides && heroConfig.slides.length === 3 ? heroConfig.slides : [
    {
      discipline: 'Brand Design',
      disciplineLabel: '01 // Brand Design',
      title: 'Brand Systems &\nVisual Identity',
      subtitle: 'Logo Architecture • Social Media Systems • Event Collateral',
      tagline: 'Great design should feel invisible.',
      description: 'Engineering monolithic vector emblems, viral educational carousels, and tactile event posters engineered for visual authority.',
      supportingPhrase: 'We create distinctive visual identities and engaging designs that make brands stand out and connect with their audience.',
      imageSrc: '/images/portrait-front.png',
      metrics: [
        { label: 'Brand Systems', value: '45+', numericValue: 45, suffix: '+' },
        { label: 'Social Reach', value: '180M+', numericValue: 180, suffix: 'M+' },
        { label: 'Flyer Runs', value: '120+', numericValue: 120, suffix: '+' },
      ],
    },
    {
      discipline: 'Video Editing',
      disciplineLabel: '02 // Video Editing',
      title: 'Cinematic Editing &\nMotion Direction',
      subtitle: 'Commercial Trailers • DaVinci Color Science • Sound Architecture',
      tagline: 'Pacing that pulses. Imagery that endures.',
      description: 'Cutting commercial trailers, high-velocity automotive spots, and narrative reels with surgical sound design and DaVinci Resolve color mastering.',
      supportingPhrase: 'Frame-accurate precision matching audio frequencies with kinetic cuts.',
      imageSrc: '/images/video-showcase-1.jpg',
      metrics: [
        { label: 'Timeline Edits', value: '650+', numericValue: 650, suffix: '+' },
        { label: 'Retention Lift', value: '42%', numericValue: 42, suffix: '%' },
        { label: '4K Deliveries', value: '100%', numericValue: 100, suffix: '%' },
      ],
    },
    {
      discipline: 'Technical Analysis',
      disciplineLabel: '03 // Technical Analysis',
      title: 'Quantitative Flow &\nInstitutional Structure',
      subtitle: 'GBP/USD Specialization • Dec Edge Execution • 1:5 RR Target',
      tagline: 'Dec Edge Strategy. Systematic 1:5 RR execution.',
      description: 'Deconstructing GBP/USD across Weekly, Daily, and 4H timeframes. Identifying predatory liquidity sweeps and protected order blocks with Volume Profile POC.',
      supportingPhrase: 'Systematic execution targeting institutional order flow imbalances.',
      imageSrc: '/images/tech-analysis-showcase-1.jpg',
      metrics: [
        { label: 'Target RR', value: '1:5.0', numericValue: 5, suffix: '.0 RR' },
        { label: 'Focus Asset', value: 'GBP/USD', numericValue: 1, suffix: ' Asset' },
        { label: 'Win Focus', value: '94%', numericValue: 94, suffix: '%' },
      ],
    },
  ];

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to pause autoplay when hero leaves view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Automatic 3-Slide Rotation (Brand Design -> Video Editing -> Technical Analysis -> Repeat)
  // Configurable interval (5000-6000ms)
  const intervalMs = heroConfig.intervalMs || 5500;
  useEffect(() => {
    if (!isVisible || isPaused) return;

    const timer = setInterval(() => {
      if (document.visibilityState === 'hidden') return;

      if (reducedMotion) {
        setActiveSlideIndex((prev) => (prev + 1) % 3);
      } else {
        setIsTransitioning(true);
        window.setTimeout(() => {
          setActiveSlideIndex((prev) => (prev + 1) % 3);
          setIsTransitioning(false);
        }, 220);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isVisible, isPaused, reducedMotion, intervalMs]);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleSelectSection = () => {
    if (isAdmin) {
      setSelectedComponentId('hero');
    }
    if (onSelectSection) {
      onSelectSection();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onClick={handleSelectSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full bg-[#070708] pt-28 pb-16 md:pt-32 md:pb-20 lg:min-h-[92vh] flex flex-col justify-center overflow-hidden border-b border-white/[0.06]"
    >
      {/* Subtle Restrained Ambient Lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 70%), radial-gradient(circle at 20% 80%, #0d0d10 0%, #070708 80%)',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* TEXT COLUMN: Discipline Label, Primary Headline, Concise Statement */}
          {/* On mobile: order-2 (renders after the hero image section). On desktop: order-1 (left column) */}
          <div className="order-2 lg:order-1 lg:col-span-6 flex flex-col justify-center">
            {/* Stable Height Container to Prevent Layout Shifts */}
            <div
              aria-live="polite"
              className={`min-h-[200px] sm:min-h-[220px] flex flex-col justify-center transition-all duration-300 ease-out ${
                isTransitioning && !reducedMotion
                  ? 'opacity-0 translate-y-1 filter blur-[1px]'
                  : 'opacity-100 translate-y-0 filter blur-0'
              }`}
            >
              {/* Discipline Label */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                  {currentSlide.disciplineLabel || currentSlide.discipline}
                </span>
                <span className="text-[10px] font-mono text-zinc-600">
                  [{activeSlideIndex + 1} / 3]
                </span>
              </div>

              {/* Clear Primary Heading */}
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[58px] leading-[0.98] tracking-tight text-zinc-100">
                {currentSlide.title.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              {/* One Concise Supporting Statement */}
              <p className="mt-4 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed max-w-lg">
                {currentSlide.description}
              </p>
            </div>
          </div>

          {/* MEDIA + METRICS COLUMN: Hero Picture, Metrics, and Supporting Phrase Just Below It */}
          {/* On mobile: order-1 (renders first at the top of the hero). On desktop: order-2 (right column) */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center justify-center">
            {/* Hero Image Presentation */}
            <div className="relative w-full max-w-lg lg:max-w-none aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#0a0a0d] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex items-center justify-center">
              {/* Subtle Ambient Glow Behind Subject */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

              {/* Main Image with Restrained Crossfade */}
              <img
                key={currentSlide.imageSrc}
                src={currentSlide.imageSrc || '/images/portrait-front.png'}
                alt={`${currentSlide.discipline} Showcase`}
                width={1024}
                height={576}
                fetchPriority="high"
                decoding="async"
                className={`w-full h-full object-contain object-center select-none transition-opacity duration-300 ${
                  isTransitioning && !reducedMotion ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
                }`}
              />

              {/* Natural Edge Vignette */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070708]/80 via-transparent to-[#070708]/30" />

              {/* Minimalist Bottom-Right Tag */}
              <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
                {currentSlide.discipline}
              </div>
            </div>

            {/* Metrics & Supporting Phrase Positioned Just Below the Hero Section Picture */}
            <div className="w-full max-w-lg lg:max-w-none mt-6 pt-5 border-t border-white/[0.08]">
              {/* Numerical Metrics: No card backgrounds, borders, or shadows */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {currentSlide.metrics.map((metric, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider truncate">
                      {metric.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-zinc-100 mt-1">
                      <AnimatedMetric
                        targetValue={metric.value}
                        numericValue={metric.numericValue}
                        suffix={metric.suffix}
                        isActive={!isTransitioning}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Supporting Phrase Typewriter: Just Below the Metrics */}
              <div className="mt-4 flex items-start sm:items-center gap-2 text-xs font-mono text-zinc-400 min-h-[24px]">
                <span className="text-zinc-600 shrink-0 mt-0.5 sm:mt-0">//</span>
                <TypewriterText
                  key={`${activeSlideIndex}-${currentSlide.supportingPhrase}`}
                  text={currentSlide.supportingPhrase || currentSlide.tagline}
                  isActive={!isTransitioning}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
