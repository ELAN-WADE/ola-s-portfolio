import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  Send,
  Eye,
  GripVertical,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Lock,
  LogOut,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Palette,
  Film,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { CinematicHero } from '../components/CinematicHero';
import { BrandDesignSection } from '../components/BrandDesignSection';
import { VideoEditingSection } from '../components/VideoEditingSection';
import { TechnicalAnalysisSection } from '../components/TechnicalAnalysisSection';
import { WorkflowSection } from '../components/WorkflowSection';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';
import { SiteContentEditor } from '../components/cms/SiteContentEditor';
import { INITIAL_SITE_CONTENT, mergeSiteContent } from '../data/initialCmsData';
import type {
  BrandProject,
  VideoProject,
  VideoGridItem,
  TradeRecord,
  TradingCategory,
  SiteContentConfig,
  HeroMetric,
} from '../types';

const normalizePickerHex = (val: string): string => {
  const clean = (val || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return clean;
  if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return '#18181B';
};

export const AdminCMSPage: React.FC = () => {
  const {
    database,
    isAdmin,
    adminToken,
    isLoading,
    isSaving,
    login,
    logout,
    saveDraft,
    publishAll,
    setItemStatus,
    reorder,
    uploadMedia,
    selectedComponentId,
    setSelectedComponentId,
    previewMode,
    setPreviewMode,
  } = useCMS();

  // Authentication State
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Editor Viewport State (Desktop / Tablet / Mobile)
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'properties' | 'media'>('properties');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Media Upload State
  const [mediaList, setMediaList] = useState<Array<{ url: string; name: string; size?: number; mtime?: string }>>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadTargetField, setUploadTargetField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // CMS Color Architecture Post Input State
  const [newBrandColor, setNewBrandColor] = useState('#FFFFFF');

  const siteContent = mergeSiteContent(database.siteContent);

  const updateSiteContentSection = <K extends keyof SiteContentConfig>(
    sectionKey: K,
    patch: Partial<SiteContentConfig[K]>
  ) => {
    const nextSiteContent: SiteContentConfig = {
      ...siteContent,
      [sectionKey]: {
        ...siteContent[sectionKey],
        ...patch,
      },
    };
    void saveDraft({ siteContent: nextSiteContent });
  };

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{
    collection: 'brandProjects' | 'videoProjects' | 'tradeRecords';
    id: string;
    index: number;
  } | null>(null);

  const { fetchMediaList } = useCMS();

  const loadLiveMedia = async () => {
    const list = await fetchMediaList();
    if (list && list.length > 0) {
      setMediaList(list);
    }
  };

  React.useEffect(() => {
    if (isAdmin) {
      void loadLiveMedia();
    }
  }, [isAdmin, activeTab]);

  const triggerUploadFor = (field: string) => {
    setUploadTargetField(field);
    fileInputRef.current?.click();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError(null);
    const res = await login(passwordInput);
    setIsSubmittingAuth(false);
    if (!res.success) {
      setAuthError(res.error || 'Authentication failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const res = await uploadMedia(file);
      setIsUploadingMedia(false);
      e.target.value = '';

      if (res && res.url) {
        showToast(`Uploaded ${res.filename}`);
        void loadLiveMedia();
        if (uploadTargetField && uploadTargetField !== 'mediaTab' && selectedComponentId) {
          if (uploadTargetField === 'siteBranding:logoImage') {
            updateSiteContentSection('branding', { logoImage: res.url });
          } else if (uploadTargetField === 'siteAbout:image') {
            updateSiteContentSection('about', { image: res.url });
          } else if (uploadTargetField === 'brandGallery:add' && selectedComponentId.startsWith('brand-')) {
            const brandId = selectedComponentId.replace('brand-', '');
            const project = database.brandProjects.find((p) => p.id === brandId);
            if (project) {
              const nextGallery = [...(project.galleryImages || []), res.url];
              applyFieldChange('galleryImages', nextGallery);
            }
          } else if (
            uploadTargetField.startsWith('videoItem:') &&
            selectedComponentId.startsWith('video-')
          ) {
            const [, itemField, rawIndex] = uploadTargetField.split(':');
            const itemIndex = parseInt(rawIndex, 10);
            const videoId = selectedComponentId.replace('video-', '');
            const section = database.videoProjects.find((v) => v.id === videoId);
            if (section && !Number.isNaN(itemIndex)) {
              const items = [...(section.recentVideos || [])];
              if (items[itemIndex]) {
                items[itemIndex] = { ...items[itemIndex], [itemField]: res.url };
                applyFieldChange('recentVideos', items);
              }
            }
          } else {
            applyFieldChange(uploadTargetField, res.url);
          }
        }
      } else {
        showToast('Upload failed');
      }
    } catch {
      setIsUploadingMedia(false);
      showToast('Error uploading file');
    }
  };

  // Drag and drop reordering
  const handleDragStart = (
    collection: 'brandProjects' | 'videoProjects' | 'tradeRecords',
    id: string,
    index: number
  ) => {
    setDraggedItem({ collection, id, index });
  };

  const handleDrop = (
    collection: 'brandProjects' | 'videoProjects' | 'tradeRecords',
    targetIndex: number
  ) => {
    if (!draggedItem || draggedItem.collection !== collection) return;

    const items = [...database[collection]] as Array<{ id: string }>;
    const [moved] = items.splice(draggedItem.index, 1);
    items.splice(targetIndex, 0, moved);

    const orderedIds = items.map((i) => i.id);
    void reorder(collection, orderedIds);
    setDraggedItem(null);
    showToast(`Reordered ${collection}`);
  };

  // Accurate per-category (and cross-category) drag-and-drop for trade cards
  const handleDropTrade = (targetCategorySlug: string, targetTradeId: string) => {
    if (!draggedItem || draggedItem.collection !== 'tradeRecords') return;
    if (draggedItem.id === targetTradeId) {
      setDraggedItem(null);
      return;
    }

    const draggedTrade = database.tradeRecords.find((t) => t.id === draggedItem.id);
    if (!draggedTrade) {
      setDraggedItem(null);
      return;
    }

    const targetCategory = database.tradingCategories.find((c) => c.slug === targetCategorySlug);
    const updatedDragged: TradeRecord = {
      ...draggedTrade,
      categorySlug: targetCategorySlug,
      ticker: targetCategory ? targetCategory.name : draggedTrade.ticker,
    };

    // Build ordered list for target category
    const remaining = database.tradeRecords.filter((t) => t.id !== draggedItem.id);
    const targetCatTrades = remaining
      .filter((t) => t.categorySlug === targetCategorySlug)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const otherTrades = remaining.filter((t) => t.categorySlug !== targetCategorySlug);

    const targetPos = targetCatTrades.findIndex((t) => t.id === targetTradeId);
    if (targetPos === -1) {
      targetCatTrades.push(updatedDragged);
    } else {
      targetCatTrades.splice(targetPos, 0, updatedDragged);
    }

    const reindexedTarget = targetCatTrades.map((t, idx) => ({ ...t, order: idx }));
    void saveDraft({ tradeRecords: [...otherTrades, ...reindexedTarget] });
    setDraggedItem(null);
    showToast('Reordered trade gallery');
  };

  const handleMoveTradeInCategory = (
    categorySlug: string,
    tradeId: string,
    direction: -1 | 1
  ) => {
    const catTrades = database.tradeRecords
      .filter((t) => t.categorySlug === categorySlug)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = catTrades.findIndex((t) => t.id === tradeId);
    const targetIdx = idx + direction;
    if (idx === -1 || targetIdx < 0 || targetIdx >= catTrades.length) return;

    const reorderedCat = [...catTrades];
    const [moved] = reorderedCat.splice(idx, 1);
    reorderedCat.splice(targetIdx, 0, moved);
    const reindexedCat = reorderedCat.map((t, i) => ({ ...t, order: i }));

    const otherTrades = database.tradeRecords.filter((t) => t.categorySlug !== categorySlug);
    void saveDraft({ tradeRecords: [...otherTrades, ...reindexedCat] });
    showToast('Updated trade order');
  };

  const handleDeleteTradeRecord = (tradeId: string) => {
    const nextRecords = database.tradeRecords.filter((t) => t.id !== tradeId);
    void saveDraft({ tradeRecords: nextRecords });
    if (selectedComponentId === `trade-rec-${tradeId}`) {
      setSelectedComponentId(null);
    }
    showToast('Deleted trade card');
  };

  const handleAssignTradeCategory = (tradeId: string, newCategorySlug: string) => {
    const targetCat = database.tradingCategories.find((c) => c.slug === newCategorySlug);
    const existingInTarget = database.tradeRecords.filter(
      (t) => t.categorySlug === newCategorySlug && t.id !== tradeId
    );
    const nextRecords = database.tradeRecords.map((t) =>
      t.id === tradeId
        ? {
            ...t,
            categorySlug: newCategorySlug,
            ticker: targetCat ? targetCat.name : t.ticker,
            order: existingInTarget.length,
          }
        : t
    );
    void saveDraft({ tradeRecords: nextRecords });
    showToast(`Assigned trade to ${targetCat?.name || newCategorySlug}`);
  };

  const handleToggleTradeStatus = (tradeId: string) => {
    const target = database.tradeRecords.find((t) => t.id === tradeId);
    if (!target) return;
    const nextStatus: 'draft' | 'published' =
      target.status === 'published' ? 'draft' : 'published';
    const nextRecords = database.tradeRecords.map((t) =>
      t.id === tradeId ? { ...t, status: nextStatus } : t
    );
    void saveDraft({ tradeRecords: nextRecords });
    showToast(nextStatus === 'published' ? 'Published trade card' : 'Unpublished trade card');
  };

  // Helper to apply field changes into the draft database
  const applyFieldChange = (fieldPath: string, value: any) => {
    if (!selectedComponentId) return;

    // 1. Hero Slide
    if (selectedComponentId.startsWith('hero-slide-')) {
      const slideIdx = parseInt(selectedComponentId.replace('hero-slide-', ''), 10);
      const newSlides = [...database.heroConfig.slides];
      if (newSlides[slideIdx]) {
        (newSlides[slideIdx] as any)[fieldPath] = value;
        void saveDraft({
          heroConfig: { ...database.heroConfig, slides: newSlides },
        });
      }
      return;
    }

    // 2. Hero Interval
    if (selectedComponentId === 'hero') {
      if (fieldPath === 'intervalMs') {
        void saveDraft({
          heroConfig: { ...database.heroConfig, intervalMs: Number(value) },
        });
      }
      return;
    }

    // 3. Brand Project
    if (selectedComponentId.startsWith('brand-')) {
      const id = selectedComponentId.replace('brand-', '');
      const newProjects = database.brandProjects.map((p) =>
        p.id === id ? { ...p, [fieldPath]: value } : p
      );
      void saveDraft({ brandProjects: newProjects });
      return;
    }

    // 4. Video Project
    if (selectedComponentId.startsWith('video-')) {
      const id = selectedComponentId.replace('video-', '');
      const newProjects = database.videoProjects.map((v) =>
        v.id === id ? { ...v, [fieldPath]: value } : v
      );
      void saveDraft({ videoProjects: newProjects });
      return;
    }

    // 5. Trading Category
    if (selectedComponentId.startsWith('trade-cat-')) {
      const id = selectedComponentId.replace('trade-cat-', '');
      const newCategories = database.tradingCategories.map((c) =>
        c.id === id ? { ...c, [fieldPath]: value } : c
      );
      void saveDraft({ tradingCategories: newCategories });
      return;
    }

    // 6. Trade Record
    if (selectedComponentId.startsWith('trade-rec-')) {
      const id = selectedComponentId.replace('trade-rec-', '');
      const newRecords = database.tradeRecords.map((t) =>
        t.id === id ? { ...t, [fieldPath]: value } : t
      );
      void saveDraft({ tradeRecords: newRecords });
      return;
    }
  };

  // Add Project / Trade Record Helpers
  const handleAddBrandProject = () => {
    const newId = `brand-${Date.now()}`;
    const newProject: BrandProject = {
      id: newId,
      slug: `new-brand-${Date.now()}`,
      title: 'NEW BRAND IDENTITY SUITE',
      client: 'Studio Client',
      category: 'Logo Branding',
      year: '2026',
      shortCaption: 'Concise project overview for homepage preview',
      description: 'Comprehensive editorial case study and brand strategy description.',
      strategy: 'Strategic brand positioning architecture.',
      colors: ['#070708', '#18181B', '#A1A1AA', '#FFFFFF'],
      coverImage: '/images/brand-showcase-1.jpg',
      image: '/images/brand-showcase-1.jpg',
      galleryImages: ['/images/brand-showcase-1.jpg'],
      status: 'draft',
      order: database.brandProjects.length,
    };
    void saveDraft({ brandProjects: [...database.brandProjects, newProject] });
    setSelectedComponentId(`brand-${newId}`);
    showToast('Created new draft Brand project');
  };

  const handleAddVideoProject = () => {
    const newId = `video-${Date.now()}`;
    const newVideo: VideoProject = {
      id: newId,
      slug: `new-video-section-${Date.now()}`,
      title: 'NEW VIDEO SECTION',
      client: 'ODS Production',
      duration: '01:30',
      format: '4K DCI ProRes',
      role: 'Lead Editor & Colorist',
      views: '1.2M',
      shortCaption: 'Tap to explore recent video projects in a 4-column grid',
      description: 'Curated clickable video edits.',
      coverImage: '/images/video-showcase-1.jpg',
      aspectRatio: '16:9 Widescreen',
      tags: ['Video Editing', 'Motion'],
      recentVideos: [
        {
          id: `clip-${Date.now()}-1`,
          title: 'Featured Recent Edit 01',
          client: 'Studio Client',
          duration: '01:20',
          thumbnail: '/images/video-showcase-1.jpg',
          videoUrl: '',
          aspectRatio: '16:9',
          date: '2026',
        },
        {
          id: `clip-${Date.now()}-2`,
          title: 'Featured Recent Edit 02',
          client: 'Studio Client',
          duration: '00:55',
          thumbnail: '/images/brand-showcase-1.jpg',
          videoUrl: '',
          aspectRatio: '16:9',
          date: '2026',
        },
        {
          id: `clip-${Date.now()}-3`,
          title: 'Featured Recent Edit 03',
          client: 'Studio Client',
          duration: '01:40',
          thumbnail: '/images/tech-analysis-showcase-1.jpg',
          videoUrl: '',
          aspectRatio: '16:9',
          date: '2026',
        },
        {
          id: `clip-${Date.now()}-4`,
          title: 'Featured Recent Edit 04',
          client: 'Studio Client',
          duration: '01:05',
          thumbnail: '/images/reference-folioblox.png',
          videoUrl: '',
          aspectRatio: '16:9',
          date: '2026',
        },
      ],
      status: 'draft',
      order: database.videoProjects.length,
    };
    void saveDraft({ videoProjects: [...database.videoProjects, newVideo] });
    setSelectedComponentId(`video-${newId}`);
    showToast('Created new draft Video section');
  };

  const handleAddTradeRecord = (categorySlug: string) => {
    const newId = `trade-${Date.now()}`;
    const matchedCat = database.tradingCategories.find((c) => c.slug === categorySlug);
    const ticker = matchedCat?.name || categorySlug.toUpperCase();
    const existingCount = database.tradeRecords.filter((t) => t.categorySlug === categorySlug).length;
    const newTrade: TradeRecord = {
      id: newId,
      categorySlug,
      ticker,
      title: `${ticker} Trade Setup`,
      date: new Date().toISOString().split('T')[0],
      timeframe: '4H • 15m',
      strategy: matchedCat?.strategy?.split('//')[0]?.trim() || 'Order Flow',
      setupType: 'Liquidity Sweep',
      riskReward: '1 : 5.0',
      outcome: '',
      pnlPercentage: '',
      entryPrice: '',
      exitPrice: '',
      stopLoss: '',
      takeProfit: '',
      chartImage: matchedCat?.coverImage || '/images/tech-analysis-showcase-1.jpg',
      description: '',
      analysisNotes: [],
      status: 'published',
      order: existingCount,
    };
    void saveDraft({ tradeRecords: [...database.tradeRecords, newTrade] });
    setSelectedComponentId(`trade-rec-${newId}`);
    showToast(`Added new trade card to ${ticker}`);
  };

  const handleDeleteBrandProject = (id: string) => {
    void saveDraft({ brandProjects: database.brandProjects.filter((p) => p.id !== id) });
    if (selectedComponentId === `brand-${id}`) setSelectedComponentId(null);
    showToast('Deleted brand project');
  };

  const handleDeleteVideoProject = (id: string) => {
    void saveDraft({ videoProjects: database.videoProjects.filter((v) => v.id !== id) });
    if (selectedComponentId === `video-${id}`) setSelectedComponentId(null);
    showToast('Deleted video section');
  };

  const handleAddTradingCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCat: TradingCategory = {
      id: newId,
      slug: `instrument-${Date.now()}`,
      name: 'XAU/USD',
      market: 'Commodities',
      focusAsset: 'XAU/USD',
      weeklyHigh: '2,750.00',
      spread: '0.8 Pips',
      strategy: 'Liquidity Sweep & Institutional Order Block',
      description: 'Institutional liquidity structure and multi-timeframe order flow execution.',
      coverImage: '/images/tech-analysis-showcase-1.jpg',
      status: 'published',
      order: database.tradingCategories.length,
    };
    void saveDraft({ tradingCategories: [...database.tradingCategories, newCat] });
    setSelectedComponentId(`trade-cat-${newId}`);
    showToast('Added new Technical Analysis instrument page');
  };

  const handleDeleteTradingCategory = (id: string) => {
    const cat = database.tradingCategories.find((c) => c.id === id);
    void saveDraft({
      tradingCategories: database.tradingCategories.filter((c) => c.id !== id),
      tradeRecords: cat
        ? database.tradeRecords.filter((t) => t.categorySlug !== cat.slug)
        : database.tradeRecords,
    });
    if (selectedComponentId === `trade-cat-${id}`) setSelectedComponentId(null);
    showToast('Deleted instrument page');
  };

  // If not authenticated, render Login Shield
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 selection:bg-zinc-200 selection:text-zinc-950">
        <div className="film-grain" />
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#0c0c10] border border-white/[0.09] shadow-2xl relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white">ODS Editorial CMS</h1>
              <p className="text-xs font-mono text-zinc-500">Visual Page Architecture &amp; Content Management</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
                Administrator Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (default: olar2026)"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800/40">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmittingAuth || !passwordInput}
              className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authenticate & Open CMS'}
            </button>

            <div className="text-center pt-3 border-t border-white/[0.06]">
              <Link to="/" className="text-xs font-mono text-zinc-500 hover:text-zinc-300">
                &larr; Return to Public Website
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Active Selected Entity for Right Panel Properties Editor
  const currentSelectedEntity = (() => {
    if (!selectedComponentId) return null;

    if (selectedComponentId === 'site-branding') {
      return { type: 'site-branding', data: siteContent };
    }
    if (selectedComponentId === 'site-workflow') {
      return { type: 'site-workflow', data: siteContent.workflow };
    }
    if (selectedComponentId === 'site-about') {
      return { type: 'site-about', data: siteContent.about };
    }
    if (selectedComponentId === 'site-contact') {
      return { type: 'site-contact', data: siteContent.contact };
    }
    if (selectedComponentId === 'site-footer') {
      return { type: 'site-footer', data: siteContent.footer };
    }
    if (selectedComponentId.startsWith('hero-slide-')) {
      const idx = parseInt(selectedComponentId.replace('hero-slide-', ''), 10);
      return { type: 'hero-slide', data: database.heroConfig.slides[idx], index: idx };
    }
    if (selectedComponentId === 'hero') {
      return { type: 'hero-general', data: database.heroConfig };
    }
    if (selectedComponentId.startsWith('brand-')) {
      const id = selectedComponentId.replace('brand-', '');
      const p = database.brandProjects.find((x) => x.id === id);
      return p ? { type: 'brand-project', data: p } : null;
    }
    if (selectedComponentId.startsWith('video-')) {
      const id = selectedComponentId.replace('video-', '');
      const v = database.videoProjects.find((x) => x.id === id);
      return v ? { type: 'video-project', data: v } : null;
    }
    if (selectedComponentId.startsWith('trade-cat-')) {
      const id = selectedComponentId.replace('trade-cat-', '');
      const c = database.tradingCategories.find((x) => x.id === id);
      return c ? { type: 'trading-category', data: c } : null;
    }
    if (selectedComponentId.startsWith('trade-rec-')) {
      const id = selectedComponentId.replace('trade-rec-', '');
      const t = database.tradeRecords.find((x) => x.id === id);
      return t ? { type: 'trade-record', data: t } : null;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col selection:bg-zinc-200 selection:text-zinc-950">
      <div className="film-grain" />

      {/* Hidden File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* CMS Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0c0c10] border-b border-white/[0.09] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            title="Return to Public Website"
          >
            <img src={siteContent.branding.logoImage || '/images/ods-logo.png'} alt={siteContent.branding.logoAlt || 'ODS'} className="w-7 h-7 object-contain rounded-full border border-white/10" />
            <span className="font-display font-bold text-sm tracking-tight text-white group-hover:text-zinc-300">
              ODS Visual CMS
            </span>
          </Link>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-emerald-400">
            Live Session Active
          </span>
        </div>

        {/* Viewport Width Controls for Center Preview */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewportMode === 'desktop' ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
            title="Desktop 100% View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewportMode === 'tablet' ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
            title="Tablet 768px View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewportMode === 'mobile' ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
            title="Mobile 390px View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls: Draft Toggle, Publish All, Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setPreviewMode('draft')}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === 'draft' ? 'bg-zinc-200 text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              Draft Preview
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('published')}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === 'published' ? 'bg-zinc-200 text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              Public View
            </button>
          </div>

          <button
            type="button"
            onClick={() => void publishAll().then(() => showToast('All draft changes published to live website!'))}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-semibold shadow transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish All</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
            title="Logout of CMS"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-mono text-xs shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Three Functional Areas (Left: Structure & Reordering, Center: Live Preview, Right: Properties Editor) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT PANEL: Page Structure Tree & Drag-and-Drop Reordering (3 cols) */}
        <aside className="lg:col-span-3 bg-[#09090c] border-r border-white/[0.08] p-4 overflow-y-auto max-h-[calc(100vh-56px)] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                Page Structure
              </span>
              <span className="text-[10px] font-mono text-zinc-600">Drag to Reorder</span>
            </div>

            {/* 0. GLOBAL BRANDING & SECTION HEADERS */}
            <div>
              <button
                type="button"
                onClick={() => setSelectedComponentId('site-branding')}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                  selectedComponentId === 'site-branding'
                    ? 'bg-white/[0.08] text-white'
                    : 'hover:bg-white/[0.04] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-display font-semibold">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Site Branding &amp; Headers</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Global</span>
              </button>
            </div>

            {/* 1. HERO SECTION */}
            <div>
              <div
                onClick={() => setSelectedComponentId('hero')}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedComponentId === 'hero' ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.04] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-display font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Cinematic Hero (3 Disciplines)</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {database.heroConfig.intervalMs}ms
                </span>
              </div>

              {/* Hero Slides */}
              <div className="ml-4 mt-1.5 space-y-1">
                {database.heroConfig.slides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedComponentId(`hero-slide-${idx}`)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono flex items-center justify-between ${
                      selectedComponentId === `hero-slide-${idx}`
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span>{idx + 1}. {s.discipline}</span>
                    <span className="text-[10px] text-zinc-600">Slide</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. BRAND DESIGN PROJECTS (Drag-and-Drop) */}
            <div>
              <div className="flex items-center justify-between p-1.5 text-xs font-display font-semibold text-zinc-300 mb-1">
                <span>Brand Design ({database.brandProjects.length})</span>
                <button
                  type="button"
                  onClick={handleAddBrandProject}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                  title="Add Brand Project"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {database.brandProjects.map((p, idx) => {
                  const isSelected = selectedComponentId === `brand-${p.id}`;
                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={() => handleDragStart('brandProjects', p.id, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop('brandProjects', idx)}
                      onClick={() => setSelectedComponentId(`brand-${p.id}`)}
                      className={`group px-2 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-black/40 border-white/[0.05] text-zinc-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab shrink-0" />
                        <span className="truncate">{p.title}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${
                          p.status === 'published'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. VIDEO EDITING PROJECTS (Drag-and-Drop) */}
            <div>
              <div className="flex items-center justify-between p-1.5 text-xs font-display font-semibold text-zinc-300 mb-1">
                <span>Video Editing ({database.videoProjects.length})</span>
                <button
                  type="button"
                  onClick={handleAddVideoProject}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                  title="Add Video Reel"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {database.videoProjects.map((v, idx) => {
                  const isSelected = selectedComponentId === `video-${v.id}`;
                  return (
                    <div
                      key={v.id}
                      draggable
                      onDragStart={() => handleDragStart('videoProjects', v.id, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop('videoProjects', idx)}
                      onClick={() => setSelectedComponentId(`video-${v.id}`)}
                      className={`group px-2 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-black/40 border-white/[0.05] text-zinc-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab shrink-0" />
                        <span className="truncate">{v.title}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${
                          v.status === 'published'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. TECHNICAL ANALYSIS CATEGORIES & TRADES */}
            <div>
              <div className="flex items-center justify-between p-1.5 text-xs font-display font-semibold text-zinc-300 mb-1">
                <span>Technical Analysis ({database.tradingCategories.length})</span>
                <button
                  type="button"
                  onClick={handleAddTradingCategory}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                  title="Add Technical Analysis Instrument Page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {database.tradingCategories.map((c) => {
                  const isCatSelected = selectedComponentId === `trade-cat-${c.id}`;
                  const catTrades = database.tradeRecords
                    .filter((t) => t.categorySlug === c.slug)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                  return (
                    <div
                      key={c.id}
                      onDragOver={(e) => e.preventDefault()}
                      className="rounded-lg bg-black/30 border border-white/[0.06] p-2"
                    >
                      <div
                        onClick={() => setSelectedComponentId(`trade-cat-${c.id}`)}
                        className={`flex items-center justify-between cursor-pointer py-1 px-1.5 rounded ${
                          isCatSelected ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-mono truncate">
                            {c.name} ({catTrades.length})
                          </span>
                          <Link
                            to={`/portfolio/technical-analysis/${c.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={`Open ${c.name} public gallery`}
                            className="text-zinc-500 hover:text-zinc-200 p-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTradeRecord(c.slug);
                          }}
                          className="text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Trade</span>
                        </button>
                      </div>

                      {/* Trade cards in this category (drag-and-drop or arrow reorder, publish toggle, delete) */}
                      <div className="mt-1.5 space-y-1 pl-1">
                        {catTrades.map((t, tIdx) => {
                          const isTradeSelected = selectedComponentId === `trade-rec-${t.id}`;
                          return (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={() => handleDragStart('tradeRecords', t.id, tIdx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.stopPropagation();
                                handleDropTrade(c.slug, t.id);
                              }}
                              onClick={() => setSelectedComponentId(`trade-rec-${t.id}`)}
                              className={`group px-1.5 py-1.5 rounded text-[11px] font-mono flex items-center justify-between gap-1.5 cursor-pointer border transition-colors ${
                                isTradeSelected
                                  ? 'bg-zinc-800 border-zinc-500 text-white'
                                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <GripVertical className="w-3 h-3 text-zinc-600 cursor-grab shrink-0" />
                                <span className="truncate">{t.title || t.date || t.ticker}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTradeInCategory(c.slug, t.id, -1);
                                  }}
                                  disabled={tIdx === 0}
                                  title="Move up"
                                  className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTradeInCategory(c.slug, t.id, 1);
                                  }}
                                  disabled={tIdx === catTrades.length - 1}
                                  title="Move down"
                                  className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTradeStatus(t.id);
                                  }}
                                  title={t.status === 'published' ? 'Click to unpublish' : 'Click to publish'}
                                  className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                                    t.status === 'published'
                                      ? 'bg-emerald-950 text-emerald-400'
                                      : 'bg-amber-950 text-amber-400'
                                  }`}
                                >
                                  {t.status === 'published' ? 'pub' : 'draft'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTradeRecord(t.id);
                                  }}
                                  title="Delete trade card"
                                  className="p-0.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {catTrades.length === 0 && (
                          <div className="text-[10px] font-mono text-zinc-600 px-2 py-1">
                            No trades assigned yet
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. STATIC & EDITORIAL PAGE SECTIONS (100% CMS Editable) */}
            <div className="pt-2 border-t border-white/[0.08] space-y-1">
              <div className="p-1.5 text-xs font-display font-semibold text-zinc-300">
                <span>Editorial Page Sections</span>
              </div>
              {[
                { id: 'site-workflow', label: 'Workflow Section', tag: `${siteContent.workflow.steps.length} Steps` },
                { id: 'site-about', label: 'About & Studio Image', tag: 'Manifesto' },
                { id: 'site-contact', label: 'Contact & Social Links', tag: 'Inquiry' },
                { id: 'site-footer', label: 'Footer & Studio Info', tag: 'Global' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedComponentId(sec.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between border transition-colors ${
                    selectedComponentId === sec.id
                      ? 'bg-zinc-800 border-zinc-500 text-white font-semibold'
                      : 'bg-black/40 border-white/[0.05] text-zinc-400 hover:border-white/15 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{sec.label}</span>
                  <span className="text-[9px] text-zinc-500 shrink-0">{sec.tag}</span>
                </button>
              ))}
            </div>

          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[10px] font-mono text-zinc-500">
            Click any element in preview or structure to edit.
          </div>
        </aside>

        {/* CENTER PANEL: Live Interactive Preview (6 cols) */}
        <main className="lg:col-span-6 bg-[#050507] p-4 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(100vh-56px)]">
          <div
            className={`w-full transition-all duration-300 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070708] shadow-2xl ${
              viewportMode === 'tablet'
                ? 'max-w-[768px]'
                : viewportMode === 'mobile'
                ? 'max-w-[390px]'
                : 'max-w-full'
            }`}
          >
            {/* Embedded Live Preview of ALL Sections with Click-to-Select */}
            <div className="pointer-events-auto">
              <CinematicHero />
              <BrandDesignSection />
              <VideoEditingSection />
              <TechnicalAnalysisSection />
              <WorkflowSection />
              <AboutSection />
              <ContactSection />
              <Footer />
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Properties Editor & Media Manager (3 cols) */}
        <aside className="lg:col-span-3 bg-[#09090c] border-l border-white/[0.08] p-4 overflow-y-auto max-h-[calc(100vh-56px)]">
          
          {/* Tabs: Component Properties vs Media Library */}
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`text-xs font-mono uppercase tracking-wider pb-1 transition-colors ${
                activeTab === 'properties' ? 'text-zinc-100 border-b border-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Properties Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`text-xs font-mono uppercase tracking-wider pb-1 transition-colors ${
                activeTab === 'media' ? 'text-zinc-100 border-b border-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Media Assets
            </button>
          </div>

          {activeTab === 'properties' ? (
            <div>
              {currentSelectedEntity ? (
                <div className="space-y-4 text-xs font-mono">
                  
                  {/* Entity Type Label */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Editing: {currentSelectedEntity.type}
                    </span>
                    {(currentSelectedEntity.data as any)?.status && (
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = (currentSelectedEntity.data as any).status === 'published' ? 'draft' : 'published';
                          applyFieldChange('status', newStatus);
                          showToast(`Set to ${newStatus}`);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                          (currentSelectedEntity.data as any).status === 'published'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        Status: {(currentSelectedEntity.data as any).status} (Toggle)
                      </button>
                    )}
                  </div>

                  {/* 0. Global Branding, Workflow, About, Contact & Footer Editors */}
                  {(currentSelectedEntity.type === 'site-branding' ||
                    currentSelectedEntity.type === 'site-workflow' ||
                    currentSelectedEntity.type === 'site-about' ||
                    currentSelectedEntity.type === 'site-contact' ||
                    currentSelectedEntity.type === 'site-footer') && (
                    <SiteContentEditor
                      sectionType={currentSelectedEntity.type}
                      siteContent={siteContent}
                      onUpdateSection={updateSiteContentSection}
                      onTriggerUpload={triggerUploadFor}
                      onToast={showToast}
                    />
                  )}

                  {/* 1. Hero Slide Properties */}
                  {currentSelectedEntity.type === 'hero-slide' && (() => {
                    const slideData = currentSelectedEntity.data as any;
                    const slideMetrics: HeroMetric[] = slideData.metrics || [];

                    const updateMetric = (mIdx: number, patch: Partial<HeroMetric>) => {
                      const nextMetrics = slideMetrics.map((m, idx) =>
                        idx === mIdx ? { ...m, ...patch } : m
                      );
                      applyFieldChange('metrics', nextMetrics);
                    };

                    return (
                      <>
                        <div>
                          <label className="text-zinc-400 block mb-1">Discipline Label (Top Eyebrow)</label>
                          <input
                            type="text"
                            value={slideData.disciplineLabel || slideData.discipline}
                            onChange={(e) => applyFieldChange('disciplineLabel', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Primary Heading</label>
                          <textarea
                            rows={2}
                            value={slideData.title}
                            onChange={(e) => applyFieldChange('title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">One Concise Supporting Statement</label>
                          <textarea
                            rows={3}
                            value={slideData.description}
                            onChange={(e) => applyFieldChange('description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Short Animated Supporting Phrase</label>
                          <input
                            type="text"
                            value={slideData.supportingPhrase || ''}
                            onChange={(e) => applyFieldChange('supportingPhrase', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1.5">Hero Image URL / Upload</label>
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0a0a0d] border border-white/10 mb-2">
                            <img
                              src={slideData.imageSrc || '/images/portrait-front.png'}
                              alt={slideData.discipline}
                              className="w-full h-full object-contain bg-[#09090c]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slideData.imageSrc}
                              onChange={(e) => applyFieldChange('imageSrc', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-zinc-400 text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUploadFor('imageSrc')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[11px] shrink-0"
                              title="Upload replacement image"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </div>
                        </div>

                        {/* Hero Slide Metrics Editor */}
                        <div className="pt-3 border-t border-white/[0.08] space-y-2">
                          <label className="text-zinc-300 font-semibold block">
                            Slide Metrics ({slideMetrics.length})
                          </label>
                          {slideMetrics.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-2 rounded-lg bg-black/50 border border-white/10 space-y-1.5"
                            >
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Label"
                                  value={m.label}
                                  onChange={(e) => updateMetric(mIdx, { label: e.target.value })}
                                  className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                />
                                <input
                                  type="text"
                                  placeholder="Display Value (e.g. 45+)"
                                  value={m.value}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                                    const suf = raw.replace(/^[0-9.,\s]+/, '');
                                    updateMetric(mIdx, {
                                      value: raw,
                                      numericValue: Number.isNaN(num) ? undefined : num,
                                      suffix: suf,
                                    });
                                  }}
                                  className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}

                  {/* 2. Hero General Settings */}
                  {currentSelectedEntity.type === 'hero-general' && (
                    <div>
                      <label className="text-zinc-400 block mb-1">Slide Rotation Duration (ms)</label>
                      <input
                        type="number"
                        step={500}
                        min={3000}
                        max={10000}
                        value={(currentSelectedEntity.data as any).intervalMs}
                        onChange={(e) => applyFieldChange('intervalMs', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Configurable 5000-6000ms rotation.</p>
                    </div>
                  )}

                  {/* 3. Brand Project Properties */}
                  {currentSelectedEntity.type === 'brand-project' && (() => {
                    const brandData = currentSelectedEntity.data as BrandProject;
                    const brandColors = brandData.colors || [];
                    const brandGallery = brandData.galleryImages || [];

                    const handleAddBrandColor = () => {
                      const trimmed = newBrandColor.trim();
                      if (!trimmed) return;
                      const hex = trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
                      applyFieldChange('colors', [...brandColors, hex]);
                      setNewBrandColor('#FFFFFF');
                      showToast(`Posted color ${hex}`);
                    };

                    const handleUpdateBrandColor = (idx: number, val: string) => {
                      const next = [...brandColors];
                      next[idx] = val.toUpperCase();
                      applyFieldChange('colors', next);
                    };

                    const handleRemoveBrandColor = (idx: number) => {
                      const next = brandColors.filter((_, i) => i !== idx);
                      applyFieldChange('colors', next);
                      showToast('Removed color');
                    };

                    const handleRemoveGalleryImage = (idx: number) => {
                      const next = brandGallery.filter((_, i) => i !== idx);
                      applyFieldChange('galleryImages', next);
                      showToast('Removed gallery asset');
                    };

                    return (
                      <>
                        <div>
                          <label className="text-zinc-400 block mb-1">Project Title</label>
                          <input
                            type="text"
                            value={brandData.title}
                            onChange={(e) => applyFieldChange('title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Route Slug (/portfolio/brand-design/[slug])</label>
                          <input
                            type="text"
                            value={brandData.slug || ''}
                            onChange={(e) => applyFieldChange('slug', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1">Client</label>
                            <input
                              type="text"
                              value={brandData.client}
                              onChange={(e) => applyFieldChange('client', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">Year</label>
                            <input
                              type="text"
                              value={brandData.year || ''}
                              onChange={(e) => applyFieldChange('year', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Category</label>
                          <select
                            value={brandData.category}
                            onChange={(e) => applyFieldChange('category', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          >
                            <option value="Logo Branding">Logo Branding</option>
                            <option value="Social Media Design">Social Media Design</option>
                            <option value="Flyers">Flyers</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Homepage Short Caption</label>
                          <textarea
                            rows={2}
                            value={brandData.shortCaption || ''}
                            onChange={(e) => applyFieldChange('shortCaption', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Full Editorial Description</label>
                          <textarea
                            rows={3}
                            value={brandData.description}
                            onChange={(e) => applyFieldChange('description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Brand Strategy</label>
                          <textarea
                            rows={2}
                            value={brandData.strategy || ''}
                            onChange={(e) => applyFieldChange('strategy', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Campaign Architecture</label>
                          <textarea
                            rows={2}
                            value={brandData.campaignExplanation || ''}
                            onChange={(e) => applyFieldChange('campaignExplanation', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Cover Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={brandData.coverImage || brandData.image || ''}
                              onChange={(e) => applyFieldChange('coverImage', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUploadFor('coverImage')}
                              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0"
                              title="Upload project cover image"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* CMS Color Architecture Editor */}
                        <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Color Architecture ({brandColors.length})</span>
                            </label>
                          </div>

                          <div className="space-y-1.5">
                            {brandColors.map((hex, cIdx) => (
                              <div
                                key={cIdx}
                                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/50 border border-white/10"
                              >
                                <input
                                  type="color"
                                  value={normalizePickerHex(hex)}
                                  onChange={(e) => handleUpdateBrandColor(cIdx, e.target.value)}
                                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                                  title="Pick swatch color"
                                />
                                <input
                                  type="text"
                                  value={hex}
                                  onChange={(e) => handleUpdateBrandColor(cIdx, e.target.value)}
                                  className="flex-1 min-w-0 px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBrandColor(cIdx)}
                                  className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
                                  title="Remove color"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Post New Color Bar */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="color"
                              value={normalizePickerHex(newBrandColor)}
                              onChange={(e) => setNewBrandColor(e.target.value.toUpperCase())}
                              className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                              title="Choose new color"
                            />
                            <input
                              type="text"
                              value={newBrandColor}
                              onChange={(e) => setNewBrandColor(e.target.value)}
                              placeholder="#FFFFFF"
                              className="flex-1 min-w-0 px-2 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={handleAddBrandColor}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[11px] shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Post</span>
                            </button>
                          </div>
                        </div>

                        {/* Design Objectives Editor */}
                        <div className="pt-3 border-t border-white/[0.08]">
                          <label className="text-zinc-400 block mb-1">
                            Design Objectives (one per line)
                          </label>
                          <textarea
                            rows={3}
                            value={(brandData.designObjectives || []).join('\n')}
                            onChange={(e) =>
                              applyFieldChange(
                                'designObjectives',
                                e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                          />
                        </div>

                        {/* Brand Gallery Assets (3-Column Grid) Editor */}
                        <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Brand Grid Assets ({brandGallery.length})</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => triggerUploadFor('brandGallery:add')}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px]"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Add Image</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {brandGallery.map((imgUrl, gIdx) => (
                              <div
                                key={gIdx}
                                className="relative aspect-[4/3] rounded overflow-hidden bg-black border border-white/10 group"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Asset ${gIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(gIdx)}
                                  className="absolute top-1 right-1 p-1 rounded bg-black/80 text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteBrandProject(brandData.id)}
                            className="w-full py-2 rounded-lg text-xs font-semibold bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/50 inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Brand Project</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}

                  {/* 4. Video Editing Section & 4-Column Grid Projects */}
                  {currentSelectedEntity.type === 'video-project' && (() => {
                    const videoSec = currentSelectedEntity.data as VideoProject;
                    const recentVideos = videoSec.recentVideos || [];

                    const handleAddRecentVideo = () => {
                      const isReel =
                        videoSec.title.toLowerCase().includes('short') ||
                        videoSec.title.toLowerCase().includes('reel') ||
                        videoSec.aspectRatio?.includes('9:16');
                      const newClip: VideoGridItem = {
                        id: `clip-${Date.now()}`,
                        title: `New Video Project 0${recentVideos.length + 1}`,
                        client: videoSec.client || 'ODS Production',
                        duration: '01:00',
                        thumbnail: videoSec.coverImage || '/images/video-showcase-1.jpg',
                        videoUrl: '',
                        aspectRatio: isReel ? '9:16' : '16:9',
                        date: '2026',
                      };
                      applyFieldChange('recentVideos', [...recentVideos, newClip]);
                      showToast('Added video to 4-column grid');
                    };

                    const handleUpdateRecentVideo = (
                      idx: number,
                      field: keyof VideoGridItem,
                      val: string
                    ) => {
                      const next = recentVideos.map((item, i) =>
                        i === idx ? { ...item, [field]: val } : item
                      );
                      applyFieldChange('recentVideos', next);
                    };

                    const handleRemoveRecentVideo = (idx: number) => {
                      const next = recentVideos.filter((_, i) => i !== idx);
                      applyFieldChange('recentVideos', next);
                      showToast('Removed video from grid');
                    };

                    const handleMoveRecentVideo = (idx: number, dir: -1 | 1) => {
                      const target = idx + dir;
                      if (target < 0 || target >= recentVideos.length) return;
                      const next = [...recentVideos];
                      const [moved] = next.splice(idx, 1);
                      next.splice(target, 0, moved);
                      applyFieldChange('recentVideos', next);
                    };

                    return (
                      <>
                        <div>
                          <label className="text-zinc-400 block mb-1">Video Section Title</label>
                          <input
                            type="text"
                            value={videoSec.title}
                            onChange={(e) => applyFieldChange('title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Section Short Caption</label>
                          <textarea
                            rows={2}
                            value={videoSec.shortCaption || ''}
                            onChange={(e) => applyFieldChange('shortCaption', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Section Cover Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={videoSec.coverImage || videoSec.image || ''}
                              onChange={(e) => applyFieldChange('coverImage', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUploadFor('coverImage')}
                              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0"
                              title="Upload section cover image"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 4-Column Clickable Video Grid Items Manager */}
                        <div className="pt-3 border-t border-white/[0.08] space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5 text-zinc-400" />
                              <span>4-Grid Videos ({recentVideos.length})</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleAddRecentVideo}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[10px]"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Video</span>
                            </button>
                          </div>

                          <div className="space-y-3">
                            {recentVideos.map((clip, clipIdx) => (
                              <div
                                key={clip.id || clipIdx}
                                className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                                    Video 0{clipIdx + 1}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveRecentVideo(clipIdx, -1)}
                                      disabled={clipIdx === 0}
                                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                                      title="Move up"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveRecentVideo(clipIdx, 1)}
                                      disabled={clipIdx === recentVideos.length - 1}
                                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                                      title="Move down"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRecentVideo(clipIdx)}
                                      className="p-1 rounded text-zinc-500 hover:text-red-400"
                                      title="Delete video"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <input
                                  type="text"
                                  placeholder="Video Title"
                                  value={clip.title}
                                  onChange={(e) =>
                                    handleUpdateRecentVideo(clipIdx, 'title', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                                />

                                <div className="grid grid-cols-2 gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="Client"
                                    value={clip.client || ''}
                                    onChange={(e) =>
                                      handleUpdateRecentVideo(clipIdx, 'client', e.target.value)
                                    }
                                    className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Year / Date"
                                    value={clip.date || ''}
                                    onChange={(e) =>
                                      handleUpdateRecentVideo(clipIdx, 'date', e.target.value)
                                    }
                                    className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="01:30"
                                    value={clip.duration || ''}
                                    onChange={(e) =>
                                      handleUpdateRecentVideo(clipIdx, 'duration', e.target.value)
                                    }
                                    className="px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                  />
                                  <select
                                    value={clip.aspectRatio || '16:9'}
                                    onChange={(e) =>
                                      handleUpdateRecentVideo(
                                        clipIdx,
                                        'aspectRatio',
                                        e.target.value
                                      )
                                    }
                                    className="px-1.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                  >
                                    <option value="16:9">16:9</option>
                                    <option value="9:16">9:16</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-500 block mb-0.5">
                                    Thumbnail Image
                                  </label>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="/uploads/thumb.jpg"
                                      value={clip.thumbnail || ''}
                                      onChange={(e) =>
                                        handleUpdateRecentVideo(
                                          clipIdx,
                                          'thumbnail',
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 min-w-0 px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        triggerUploadFor(`videoItem:thumbnail:${clipIdx}`)
                                      }
                                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white shrink-0"
                                      title="Upload thumbnail image"
                                    >
                                      <Upload className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] text-zinc-500 block mb-0.5">
                                    Video File / URL (MP4, YouTube, Vimeo, Drive)
                                  </label>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Paste URL or upload MP4"
                                      value={clip.videoUrl || ''}
                                      onChange={(e) =>
                                        handleUpdateRecentVideo(
                                          clipIdx,
                                          'videoUrl',
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 min-w-0 px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[10px]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        triggerUploadFor(`videoItem:videoUrl:${clipIdx}`)
                                      }
                                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white shrink-0"
                                      title="Upload video file (MP4/WebM/MOV)"
                                    >
                                      <Upload className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteVideoProject(videoSec.id)}
                            className="w-full py-2 rounded-lg text-xs font-semibold bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/50 inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Video Section</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}

                  {/* 5. Trading Category Properties */}
                  {currentSelectedEntity.type === 'trading-category' && (() => {
                    const catData = currentSelectedEntity.data as TradingCategory;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1">Instrument Name</label>
                            <input
                              type="text"
                              value={catData.name}
                              onChange={(e) => applyFieldChange('name', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">Market</label>
                            <select
                              value={catData.market}
                              onChange={(e) => applyFieldChange('market', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                            >
                              <option value="Forex">Forex</option>
                              <option value="Crypto">Crypto</option>
                              <option value="Indices">Indices</option>
                              <option value="Commodities">Commodities</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1">Focus Asset</label>
                            <input
                              type="text"
                              value={catData.focusAsset}
                              onChange={(e) => applyFieldChange('focusAsset', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1">URL Slug</label>
                            <input
                              type="text"
                              value={catData.slug}
                              onChange={(e) => applyFieldChange('slug', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Weekly High &amp; Typical Spread</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={catData.weeklyHigh}
                              onChange={(e) => applyFieldChange('weeklyHigh', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                            />
                            <input
                              type="text"
                              value={catData.spread}
                              onChange={(e) => applyFieldChange('spread', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Strategy Framework</label>
                          <textarea
                            rows={2}
                            value={catData.strategy}
                            onChange={(e) => applyFieldChange('strategy', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Page Description / Liquidity Overview</label>
                          <textarea
                            rows={3}
                            value={catData.description}
                            onChange={(e) => applyFieldChange('description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Category Chart / Cover Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={catData.coverImage || ''}
                              onChange={(e) => applyFieldChange('coverImage', e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUploadFor('coverImage')}
                              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0"
                              title="Upload category cover image"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddTradeRecord(catData.slug)}
                            className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Trade to {catData.name}</span>
                          </button>
                          <Link
                            to={`/portfolio/technical-analysis/${catData.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10"
                            title={`Preview ${catData.name} page`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTradingCategory(catData.id)}
                          className="w-full py-2 rounded-lg text-xs font-semibold bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/50 inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Instrument Page</span>
                        </button>
                      </>
                    );
                  })()}

                  {/* 6. Trade Card Properties (4-Column Trade Gallery CMS) */}
                  {currentSelectedEntity.type === 'trade-record' && (() => {
                    const tradeData = currentSelectedEntity.data as TradeRecord;
                    return (
                      <>
                        {/* Live Uncropped Trade Screenshot Preview + Upload / Replace */}
                        <div>
                          <label className="text-zinc-400 block mb-1.5">Trade Chart Screenshot</label>
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0a0a0d] border border-white/10 mb-2">
                            <img
                              src={tradeData.chartImage || '/images/tech-analysis-showcase-1.jpg'}
                              alt={tradeData.title || tradeData.ticker}
                              className="w-full h-full object-contain bg-[#09090c]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={tradeData.chartImage || ''}
                              onChange={(e) => applyFieldChange('chartImage', e.target.value)}
                              placeholder="/uploads/trade-chart.png"
                              className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUploadFor('chartImage')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[11px] shrink-0"
                              title="Upload or replace trade screenshot"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </div>
                        </div>

                        {/* Assign Trade to Technical Analysis Page */}
                        <div>
                          <label className="text-zinc-400 block mb-1">
                            Assigned Technical Analysis Page
                          </label>
                          <select
                            value={tradeData.categorySlug}
                            onChange={(e) => handleAssignTradeCategory(tradeData.id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          >
                            {database.tradingCategories.map((cat) => (
                              <option key={cat.id} value={cat.slug}>
                                {cat.name} ({cat.market})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Optional Trade Title */}
                        <div>
                          <label className="text-zinc-400 block mb-1">
                            Trade Title <span className="text-zinc-600">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Weekly High Liquidity Sweep"
                            value={tradeData.title || ''}
                            onChange={(e) => applyFieldChange('title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>

                        {/* Trade Date */}
                        <div>
                          <label className="text-zinc-400 block mb-1">Trade Date</label>
                          <input
                            type="date"
                            value={/^\d{4}-\d{2}-\d{2}$/.test(tradeData.date || '') ? tradeData.date : ''}
                            onChange={(e) => applyFieldChange('date', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white [color-scheme:dark]"
                          />
                          {tradeData.date && !/^\d{4}-\d{2}-\d{2}$/.test(tradeData.date) && (
                            <input
                              type="text"
                              value={tradeData.date}
                              onChange={(e) => applyFieldChange('date', e.target.value)}
                              className="mt-1.5 w-full px-3 py-1 rounded bg-black/60 border border-white/10 text-zinc-300 text-[11px]"
                            />
                          )}
                        </div>

                        {/* Optional Short Description / Trading Note */}
                        <div>
                          <label className="text-zinc-400 block mb-1">
                            Short Description / Trading Note{' '}
                            <span className="text-zinc-600">(Optional)</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Concise setup summary or execution note..."
                            value={tradeData.description || ''}
                            onChange={(e) => applyFieldChange('description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white"
                          />
                        </div>

                        {/* Optional Extended Coordinates */}
                        <details className="rounded-lg bg-black/30 border border-white/[0.06] p-2.5">
                          <summary className="text-[11px] text-zinc-400 cursor-pointer select-none">
                            Optional Metadata (Timeframe, R:R, Levels)
                          </summary>
                          <div className="mt-3 space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Timeframe"
                                value={tradeData.timeframe || ''}
                                onChange={(e) => applyFieldChange('timeframe', e.target.value)}
                                className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                              />
                              <input
                                type="text"
                                placeholder="Risk : Reward"
                                value={tradeData.riskReward || ''}
                                onChange={(e) => applyFieldChange('riskReward', e.target.value)}
                                className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Outcome (e.g. Target Hit +100 Pips)"
                              value={tradeData.outcome || ''}
                              onChange={(e) => applyFieldChange('outcome', e.target.value)}
                              className="w-full px-2.5 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                            />
                            <div className="grid grid-cols-3 gap-1.5">
                              <input
                                type="text"
                                placeholder="Entry"
                                value={tradeData.entryPrice || ''}
                                onChange={(e) => applyFieldChange('entryPrice', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                              />
                              <input
                                type="text"
                                placeholder="Stop"
                                value={tradeData.stopLoss || ''}
                                onChange={(e) => applyFieldChange('stopLoss', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                              />
                              <input
                                type="text"
                                placeholder="Target"
                                value={tradeData.takeProfit || ''}
                                onChange={(e) => applyFieldChange('takeProfit', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-black/60 border border-white/10 text-white text-[11px]"
                              />
                            </div>
                          </div>
                        </details>

                        {/* Individual Publish / Unpublish & Delete Actions */}
                        <div className="pt-2 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTradeStatus(tradeData.id)}
                            className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                              tradeData.status === 'published'
                                ? 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border-amber-700/50'
                                : 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-700/50'
                            }`}
                          >
                            {tradeData.status === 'published' ? 'Unpublish' : 'Publish Trade'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTradeRecord(tradeData.id)}
                            className="py-2 rounded-lg text-xs font-semibold bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/50 inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}

                  <div className="pt-4 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => showToast('Changes saved to draft!')}
                      className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="py-20 text-center text-zinc-500 font-mono text-xs">
                  Select any component in the preview or left panel to edit its properties.
                </div>
              )}
            </div>
          ) : (
            /* Media Library Tab */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => triggerUploadFor('mediaTab')}
                disabled={isUploadingMedia}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-xs font-mono text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 bg-white/[0.02] hover:bg-white/[0.05]"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploadingMedia ? 'Uploading Picture...' : 'Upload New Picture / Image'}</span>
              </button>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>Available Assets ({mediaList.length})</span>
                  <button
                    type="button"
                    onClick={loadLiveMedia}
                    className="hover:text-zinc-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {mediaList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!selectedComponentId) return;
                        if (selectedComponentId === 'site-branding') {
                          updateSiteContentSection('branding', { logoImage: item.url });
                        } else if (selectedComponentId === 'site-about') {
                          updateSiteContentSection('about', { image: item.url });
                        } else if (selectedComponentId.startsWith('hero-slide-')) {
                          applyFieldChange('imageSrc', item.url);
                        } else if (selectedComponentId.startsWith('trade-rec-')) {
                          applyFieldChange('chartImage', item.url);
                        } else {
                          applyFieldChange('coverImage', item.url);
                        }
                        showToast(`Applied ${item.name}`);
                      }}
                      className="group relative flex flex-col rounded-lg overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/30 cursor-pointer transition-all"
                    >
                      <div className="relative aspect-video w-full bg-black overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-mono text-white p-1 text-center transition-opacity">
                          Click to Apply
                        </div>
                      </div>
                      <div className="p-1.5 bg-[#0e0e12]">
                        <p className="text-[10px] font-mono text-zinc-300 truncate" title={item.name}>
                          {item.name}
                        </p>
                        {item.size ? (
                          <p className="text-[9px] font-mono text-zinc-500">
                            {(item.size / 1024).toFixed(1)} KB
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </aside>

      </div>
    </div>
  );
};

