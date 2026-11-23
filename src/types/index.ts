export type Discipline = 'brand' | 'video' | 'analysis';

export type BrandCategory = 'Logo Branding' | 'Social Media Design' | 'Flyers';

export type PortfolioFolderCategory =
  | 'Logo Branding'
  | 'Social Media Design'
  | 'Flyers'
  | 'Cinematic Video Editing';

export interface HeroMetric {
  label: string;
  value: string;
  numericValue?: number;
  suffix?: string;
}

export interface HeroSlideConfig {
  discipline: 'Brand Design' | 'Video Editing' | 'Technical Analysis';
  disciplineLabel: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  supportingPhrase: string;
  imageSrc: string;
  metrics: HeroMetric[];
}

export interface HeroConfig {
  intervalMs: number;
  slides: HeroSlideConfig[];
}

export interface SceneConfig {
  id: number;
  progressRange: [number, number];
  angleLabel: string;
  angleDegrees: number;
  imageSrc: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  activeServiceIndex: number;
  palette: {
    bgFrom: string;
    bgTo: string;
    ambientGlow: string;
    accentColor: string;
    rimLight: string;
  };
  metrics: {
    label: string;
    value: string;
  }[];
}

export interface BrandProject {
  id: string;
  slug?: string;
  title: string;
  client: string;
  category: BrandCategory;
  year: string;
  shortCaption?: string;
  description: string;
  strategy?: string;
  campaignExplanation?: string;
  designObjectives?: string[];
  deliverables?: string[];
  colors?: string[];
  typography?: string[];
  coverImage?: string;
  image?: string;
  galleryImages?: string[];
  metrics?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  order?: number;
  source?: 'curated' | 'google-drive';
  driveFileId?: string;
  updatedAt?: string;
}

export interface VideoGridItem {
  id: string;
  title: string;
  client?: string;
  duration?: string;
  thumbnail: string;
  videoUrl?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
  date?: string;
}

export interface VideoProject {
  id: string;
  slug?: string;
  title: string;
  client: string;
  duration: string;
  format: string;
  role: string;
  views: string;
  shortCaption?: string;
  description: string;
  coverImage?: string;
  image?: string;
  videoUrl?: string;
  aspectRatio: string;
  tags: string[];
  recentVideos?: VideoGridItem[];
  logBeforeImage?: string;
  gradeAfterImage?: string;
  status?: 'draft' | 'published';
  order?: number;
  source?: 'curated' | 'google-drive';
  driveFileId?: string;
  updatedAt?: string;
}

export interface TradingCategory {
  id: string;
  slug: string;
  name: string;
  market: 'Forex' | 'Crypto' | 'Indices' | 'Commodities';
  focusAsset: string;
  weeklyHigh: string;
  spread: string;
  strategy: string;
  description: string;
  coverImage: string;
  status: 'draft' | 'published';
  order: number;
}

export interface TradeRecord {
  id: string;
  categorySlug: string;
  ticker: string;
  title: string;
  date: string;
  timeframe: string;
  strategy: string;
  setupType: string;
  riskReward: string;
  outcome?: string;
  pnlPercentage?: string;
  entryPrice?: string;
  exitPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  chartImage: string;
  description: string;
  analysisNotes?: string[];
  status: 'draft' | 'published';
  order: number;
}

export interface SiteSectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface AboutPillar {
  title: string;
  description: string;
  icon: 'Zap' | 'Award' | 'Compass' | 'Shield';
}

export interface SocialLinkItem {
  name: string;
  url: string;
}

export interface SiteContentConfig {
  branding: {
    logoImage: string;
    logoAlt: string;
    navCtaLabel: string;
    mobileFooterLeft: string;
    mobileFooterRight: string;
  };
  sectionHeaders: {
    brandEyebrow: string;
    brandTitle: string;
    brandTabLogos: string;
    brandTabSocial: string;
    brandTabFlyers: string;
    videoEyebrow: string;
    videoTitle: string;
    analysisEyebrow: string;
    analysisTitle: string;
    analysisSubtitle: string;
  };
  workflow: {
    eyebrow: string;
    heading: string;
    description: string;
    steps: WorkflowStep[];
  };
  about: {
    image: string;
    imageAlt: string;
    studioBaseLabel: string;
    studioBaseValue: string;
    availabilityBadge: string;
    eyebrow: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    highlightPhrase: string;
    pillars: AboutPillar[];
    environmentLabel: string;
    tools: string[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    description: string;
    inquiriesLabel: string;
    email: string;
    socialsLabel: string;
    socials: SocialLinkItem[];
    disciplines: string[];
    budgetOptions: string[];
    submitLabel: string;
    successTitle: string;
    successMessage: string;
  };
  footer: {
    studioName: string;
    disciplinesLine: string;
    statusLabel: string;
    statusValue: string;
    recognitionLabel: string;
    recognitionValue: string;
    architectureLabel: string;
    architectureValue: string;
    copyright: string;
    tagline: string;
  };
}

export interface CMSDatabase {
  heroConfig: HeroConfig;
  brandProjects: BrandProject[];
  videoProjects: VideoProject[];
  tradingCategories: TradingCategory[];
  tradeRecords: TradeRecord[];
  siteSections: SiteSectionConfig[];
  siteContent?: SiteContentConfig;
  lastPublishedAt?: string;
  lastSavedAt?: string;
}

export interface DriveMediaItem {
  id: string;
  driveFileId: string;
  name: string;
  title: string;
  description: string;
  category: PortfolioFolderCategory;
  mimeType: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationMillis?: number;
  createdTime?: string;
  modifiedTime?: string;
}

export interface PortfolioSyncPayload {
  configured: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'ok' | 'degraded' | 'unconfigured';
  message?: string;
  folders: Record<PortfolioFolderCategory, { configured: boolean; itemCount: number }>;
  driveItems: DriveMediaItem[];
}

export interface AnalysisCase {
  id: string;
  ticker: string;
  market: 'Crypto' | 'Forex' | 'Indices' | 'Commodities';
  timeframe: string;
  thesis: string;
  setupType: 'Liquidity Sweep' | 'Order Block (OB)' | 'Fair Value Gap (FVG)' | 'Wyckoff Spring';
  riskReward: string;
  outcome: string;
  pnlPercentage: string;
  confidence: number;
  indicators: string[];
  description: string;
  candleData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface WorkflowStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  tools: string[];
  icon: string;
}
