import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  CMSDatabase,
  HeroConfig,
  BrandProject,
  VideoProject,
  TradingCategory,
  TradeRecord,
  SiteSectionConfig,
} from '../src/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'olar2026';
const AUTH_SECRET = process.env.CMS_AUTH_SECRET || 'olar-cms-jwt-secret-2026';

import {
  INITIAL_HERO_CONFIG,
  INITIAL_BRAND_PROJECTS,
  INITIAL_VIDEO_PROJECTS,
  INITIAL_TRADING_CATEGORIES,
  INITIAL_TRADE_RECORDS,
  INITIAL_SITE_SECTIONS,
  INITIAL_SITE_CONTENT,
  mergeSiteContent,
} from '../src/data/initialCmsData';

export {
  INITIAL_HERO_CONFIG,
  INITIAL_BRAND_PROJECTS,
  INITIAL_VIDEO_PROJECTS,
  INITIAL_TRADING_CATEGORIES,
  INITIAL_TRADE_RECORDS,
  INITIAL_SITE_SECTIONS,
  INITIAL_SITE_CONTENT,
};

export class CMSManager {
  private dbPath: string;
  private uploadsDir: string;
  private database: CMSDatabase;

  constructor(private projectRoot: string) {
    this.dbPath = path.join(projectRoot, 'server', 'data', 'cms-database.json');
    this.uploadsDir = path.join(projectRoot, 'public', 'uploads');
    this.ensureDirectories();
    this.database = this.loadDatabase();
  }

  private ensureDirectories() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private loadDatabase(): CMSDatabase {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<CMSDatabase>;
        return {
          heroConfig: parsed.heroConfig || INITIAL_HERO_CONFIG,
          brandProjects: parsed.brandProjects || INITIAL_BRAND_PROJECTS,
          videoProjects: parsed.videoProjects || INITIAL_VIDEO_PROJECTS,
          tradingCategories: parsed.tradingCategories || INITIAL_TRADING_CATEGORIES,
          tradeRecords: parsed.tradeRecords || INITIAL_TRADE_RECORDS,
          siteSections: parsed.siteSections || INITIAL_SITE_SECTIONS,
          siteContent: mergeSiteContent(parsed.siteContent),
          lastPublishedAt: parsed.lastPublishedAt || new Date().toISOString(),
          lastSavedAt: parsed.lastSavedAt || new Date().toISOString(),
        };
      } catch (err) {
        console.error('[CMS] Failed to read database JSON, initializing defaults:', err);
      }
    }

    const initial: CMSDatabase = {
      heroConfig: INITIAL_HERO_CONFIG,
      brandProjects: INITIAL_BRAND_PROJECTS,
      videoProjects: INITIAL_VIDEO_PROJECTS,
      tradingCategories: INITIAL_TRADING_CATEGORIES,
      tradeRecords: INITIAL_TRADE_RECORDS,
      siteSections: INITIAL_SITE_SECTIONS,
      siteContent: INITIAL_SITE_CONTENT,
      lastPublishedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    };
    this.persist(initial);
    return initial;
  }

  private persist(db: CMSDatabase) {
    this.database = db;
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[CMS] Failed to save database JSON:', err);
    }
  }

  public verifyToken(token?: string): boolean {
    if (!token) return false;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    // Simple deterministic signed session token
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update('admin-session').digest('hex');
    return cleanToken === expected;
  }

  public authenticate(password: string): { success: boolean; token?: string; error?: string } {
    if (password === ADMIN_PASSWORD) {
      const token = crypto.createHmac('sha256', AUTH_SECRET).update('admin-session').digest('hex');
      return { success: true, token };
    }
    return { success: false, error: 'Invalid administrator credentials.' };
  }

  public getPublishedContent(): CMSDatabase {
    const db = this.database;
    return {
      heroConfig: db.heroConfig,
      brandProjects: db.brandProjects
        .filter((p) => p.status === 'published')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      videoProjects: db.videoProjects
        .filter((p) => p.status === 'published')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      tradingCategories: db.tradingCategories
        .filter((c) => c.status === 'published')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      tradeRecords: db.tradeRecords
        .filter((t) => t.status === 'published')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      siteSections: db.siteSections
        .filter((s) => s.visible)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      siteContent: mergeSiteContent(db.siteContent),
      lastPublishedAt: db.lastPublishedAt,
      lastSavedAt: db.lastSavedAt,
    };
  }

  public getAllContent(): CMSDatabase {
    return {
      heroConfig: this.database.heroConfig,
      brandProjects: [...this.database.brandProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      videoProjects: [...this.database.videoProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      tradingCategories: [...this.database.tradingCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      tradeRecords: [...this.database.tradeRecords].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      siteSections: [...this.database.siteSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      siteContent: mergeSiteContent(this.database.siteContent),
      lastPublishedAt: this.database.lastPublishedAt,
      lastSavedAt: this.database.lastSavedAt,
    };
  }

  public saveContent(patch: Partial<CMSDatabase>): CMSDatabase {
    const now = new Date().toISOString();
    const updated: CMSDatabase = {
      ...this.database,
      ...patch,
      siteContent: patch.siteContent
        ? mergeSiteContent(patch.siteContent)
        : mergeSiteContent(this.database.siteContent),
      lastSavedAt: now,
    };
    this.persist(updated);
    return updated;
  }

  public publishAll(): CMSDatabase {
    const now = new Date().toISOString();
    const db = this.database;
    const published: CMSDatabase = {
      ...db,
      brandProjects: db.brandProjects.map((p) => ({ ...p, status: 'published' })),
      videoProjects: db.videoProjects.map((p) => ({ ...p, status: 'published' })),
      tradingCategories: db.tradingCategories.map((c) => ({ ...c, status: 'published' })),
      tradeRecords: db.tradeRecords.map((t) => ({ ...t, status: 'published' })),
      lastPublishedAt: now,
      lastSavedAt: now,
    };
    this.persist(published);
    return published;
  }

  public setItemStatus(
    collection: 'brandProjects' | 'videoProjects' | 'tradingCategories' | 'tradeRecords',
    id: string,
    status: 'draft' | 'published'
  ): CMSDatabase {
    const db = { ...this.database };
    const items = (db[collection] as Array<{ id: string; status: 'draft' | 'published' }>).map(
      (item) => (item.id === id ? { ...item, status } : item)
    );
    (db as any)[collection] = items;
    if (status === 'published') {
      db.lastPublishedAt = new Date().toISOString();
    }
    db.lastSavedAt = new Date().toISOString();
    this.persist(db);
    return db;
  }

  public reorderCollection(
    collection: 'brandProjects' | 'videoProjects' | 'tradingCategories' | 'tradeRecords' | 'siteSections',
    orderedIds: string[]
  ): CMSDatabase {
    const db = { ...this.database };
    const items = db[collection] as Array<{ id: string; order: number }>;
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const reordered: any[] = [];

    orderedIds.forEach((id, index) => {
      const found = itemMap.get(id);
      if (found) {
        reordered.push({ ...found, order: index });
        itemMap.delete(id);
      }
    });

    // Append any items that were not explicitly in orderedIds
    itemMap.forEach((item) => {
      reordered.push({ ...item, order: reordered.length });
    });

    (db as any)[collection] = reordered;
    db.lastSavedAt = new Date().toISOString();
    this.persist(db);
    return db;
  }

  public saveUploadedFile(
    filename: string,
    buffer: Buffer,
    providedMime?: string
  ): { url: string; filename: string; size: number; mimeType: string } {
    let ext = path.extname(filename).toLowerCase();
    
    // Auto-detect extension from magic bytes if missing or generic
    if (!ext || ext === '.' || ext === '.bin') {
      if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        ext = '.png';
      } else if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        ext = '.jpg';
      } else if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        ext = '.gif';
      } else if (buffer.length >= 12 && buffer.toString('utf-8', 0, 4) === 'RIFF' && buffer.toString('utf-8', 8, 12) === 'WEBP') {
        ext = '.webp';
      } else if (buffer.length >= 4 && (buffer.toString('utf-8', 0, 5) === '<?xml' || buffer.toString('utf-8', 0, 4) === '<svg')) {
        ext = '.svg';
      } else if (providedMime) {
        if (providedMime.includes('png')) ext = '.png';
        else if (providedMime.includes('jpeg') || providedMime.includes('jpg')) ext = '.jpg';
        else if (providedMime.includes('webp')) ext = '.webp';
        else if (providedMime.includes('gif')) ext = '.gif';
        else if (providedMime.includes('svg')) ext = '.svg';
        else if (providedMime.includes('mp4')) ext = '.mp4';
        else if (providedMime.includes('webm')) ext = '.webm';
        else if (providedMime.includes('quicktime')) ext = '.mov';
        else ext = '.png';
      } else {
        ext = '.png';
      }
    }

    const cleanBase = path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_') || 'asset';
    const uniqueName = `${cleanBase}_${Date.now()}${ext}`;
    const targetPath = path.join(this.uploadsDir, uniqueName);
    fs.writeFileSync(targetPath, buffer);

    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
    };

    return {
      url: `/uploads/${uniqueName}`,
      filename: uniqueName,
      size: buffer.length,
      mimeType: mimeMap[ext] || providedMime || 'application/octet-stream',
    };
  }

  public listMedia(): Array<{ url: string; name: string; size: number; mtime: string }> {
    const files: Array<{ url: string; name: string; size: number; mtime: string }> = [];

    // Check public/uploads
    if (fs.existsSync(this.uploadsDir)) {
      const names = fs.readdirSync(this.uploadsDir);
      for (const name of names) {
        const full = path.join(this.uploadsDir, name);
        const st = fs.statSync(full);
        if (st.isFile()) {
          files.push({
            url: `/uploads/${name}`,
            name,
            size: st.size,
            mtime: st.mtime.toISOString(),
          });
        }
      }
    }

    // Check public/images
    const imagesDir = path.join(this.projectRoot, 'public', 'images');
    if (fs.existsSync(imagesDir)) {
      const names = fs.readdirSync(imagesDir);
      for (const name of names) {
        const full = path.join(imagesDir, name);
        const st = fs.statSync(full);
        if (st.isFile()) {
          files.push({
            url: `/images/${name}`,
            name,
            size: st.size,
            mtime: st.mtime.toISOString(),
          });
        }
      }
    }

    return files.sort((a, b) => (a.mtime > b.mtime ? -1 : 1));
  }
}
