import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  CMSDatabase,
  HeroConfig,
  BrandProject,
  VideoProject,
  TradingCategory,
  TradeRecord,
  SiteSectionConfig,
} from '../types';
import {
  INITIAL_HERO_CONFIG,
  INITIAL_BRAND_PROJECTS,
  INITIAL_VIDEO_PROJECTS,
  INITIAL_TRADING_CATEGORIES,
  INITIAL_TRADE_RECORDS,
  INITIAL_SITE_SECTIONS,
  INITIAL_SITE_CONTENT,
  mergeSiteContent,
} from '../data/initialCmsData';

const DEFAULT_DATABASE: CMSDatabase = {
  heroConfig: INITIAL_HERO_CONFIG,
  brandProjects: INITIAL_BRAND_PROJECTS,
  videoProjects: INITIAL_VIDEO_PROJECTS,
  tradingCategories: INITIAL_TRADING_CATEGORIES,
  tradeRecords: INITIAL_TRADE_RECORDS,
  siteSections: INITIAL_SITE_SECTIONS,
  siteContent: INITIAL_SITE_CONTENT,
};

interface CMSContextType {
  database: CMSDatabase;
  isLoading: boolean;
  isSaving: boolean;
  isAdmin: boolean;
  adminToken: string | null;
  previewMode: 'published' | 'draft';
  setPreviewMode: (mode: 'published' | 'draft') => void;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  saveDraft: (patch: Partial<CMSDatabase>) => Promise<boolean>;
  publishAll: () => Promise<boolean>;
  setItemStatus: (
    collection: 'brandProjects' | 'videoProjects' | 'tradingCategories' | 'tradeRecords',
    id: string,
    status: 'draft' | 'published'
  ) => Promise<boolean>;
  reorder: (
    collection: 'brandProjects' | 'videoProjects' | 'tradingCategories' | 'tradeRecords' | 'siteSections',
    orderedIds: string[]
  ) => Promise<boolean>;
  uploadMedia: (
    fileOrName: File | string,
    dataUrl?: string
  ) => Promise<{ url: string; filename: string; size?: number; mimeType?: string } | null>;
  fetchMediaList: () => Promise<Array<{ url: string; name: string; size: number; mtime: string }>>;
  refreshContent: () => Promise<void>;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
}

const CMSContext = createContext<CMSContextType | null>(null);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [database, setDatabase] = useState<CMSDatabase>(DEFAULT_DATABASE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('ods_admin_token');
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewMode, setPreviewMode] = useState<'published' | 'draft'>('draft');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('hero');

  // Verify stored token on boot
  useEffect(() => {
    if (!adminToken) {
      setIsAdmin(false);
      return;
    }
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => {
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAdminToken(null);
          localStorage.removeItem('ods_admin_token');
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [adminToken]);

  const refreshContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      const url =
        adminToken && previewMode === 'draft'
          ? '/api/cms/content?all=true'
          : '/api/cms/content';

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = (await res.json()) as CMSDatabase;
        setDatabase({ ...data, siteContent: mergeSiteContent(data.siteContent) });
      }
    } catch (err) {
      console.error('[CMS Context] Failed to fetch content:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminToken, previewMode]);

  useEffect(() => {
    void refreshContent();
  }, [refreshContent]);

  const login = async (password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        localStorage.setItem('ods_admin_token', data.token);
        setIsAdmin(true);
        return { success: true };
      }
      return { success: false, error: data.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const logout = () => {
    setAdminToken(null);
    setIsAdmin(false);
    localStorage.removeItem('ods_admin_token');
    void refreshContent();
  };

  const saveDraft = async (patch: Partial<CMSDatabase>): Promise<boolean> => {
    if (!adminToken) return false;
    setIsSaving(true);
    try {
      // Optimistic update
      setDatabase((prev) => ({ ...prev, ...patch, lastSavedAt: new Date().toISOString() }));

      const res = await fetch('/api/cms/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.database) {
          setDatabase({
            ...data.database,
            siteContent: mergeSiteContent(data.database.siteContent),
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[CMS] Save failed:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const publishAll = async (): Promise<boolean> => {
    if (!adminToken) return false;
    setIsSaving(true);
    try {
      const res = await fetch('/api/cms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.database) {
          setDatabase({
            ...data.database,
            siteContent: mergeSiteContent(data.database.siteContent),
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[CMS] Publish all failed:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const setItemStatus = async (
    collection: 'brandProjects' | 'videoProjects' | 'tradingCategories' | 'tradeRecords',
    id: string,
    status: 'draft' | 'published'
  ): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/cms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ collection, id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.database) {
          setDatabase({
            ...data.database,
            siteContent: mergeSiteContent(data.database.siteContent),
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[CMS] Set status failed:', err);
      return false;
    }
  };

  const reorder = async (
    collection: 'brandProjects' | 'videoProjects' | 'tradingCategories' | 'tradeRecords' | 'siteSections',
    orderedIds: string[]
  ): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      // Optimistic local reorder
      setDatabase((prev) => {
        const items = prev[collection] as any[];
        const map = new Map(items.map((i) => [i.id, i]));
        const reordered: any[] = [];
        orderedIds.forEach((id, idx) => {
          const item = map.get(id);
          if (item) {
            reordered.push({ ...item, order: idx });
            map.delete(id);
          }
        });
        map.forEach((item) => reordered.push({ ...item, order: reordered.length }));
        return { ...prev, [collection]: reordered };
      });

      const res = await fetch('/api/cms/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ collection, orderedIds }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.database) {
          setDatabase({
            ...data.database,
            siteContent: mergeSiteContent(data.database.siteContent),
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[CMS] Reorder failed:', err);
      return false;
    }
  };

  const uploadMedia = async (
    fileOrName: File | string,
    dataUrl?: string
  ): Promise<{ url: string; filename: string; size?: number; mimeType?: string } | null> => {
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      let res: Response;
      if (fileOrName instanceof File) {
        const formData = new FormData();
        formData.append('file', fileOrName, fileOrName.name);
        res = await fetch('/api/cms/media/upload', {
          method: 'POST',
          headers,
          body: formData,
        });
      } else {
        headers['Content-Type'] = 'application/json';
        res = await fetch('/api/cms/media/upload', {
          method: 'POST',
          headers,
          body: JSON.stringify({ filename: fileOrName, dataUrl }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        return {
          url: data.url,
          filename: data.filename,
          size: data.size,
          mimeType: data.mimeType,
        };
      }
      return null;
    } catch (err) {
      console.error('[CMS] Media upload error:', err);
      return null;
    }
  };

  const fetchMediaList = useCallback(async (): Promise<
    Array<{ url: string; name: string; size: number; mtime: string }>
  > => {
    try {
      const res = await fetch('/api/cms/media');
      if (res.ok) {
        const data = await res.json();
        return data.media || [];
      }
    } catch (err) {
      console.error('[CMS] Failed to fetch media list:', err);
    }
    return [];
  }, []);

  return (
    <CMSContext.Provider
      value={{
        database,
        isLoading,
        isSaving,
        isAdmin,
        adminToken,
        previewMode,
        setPreviewMode,
        login,
        logout,
        saveDraft,
        publishAll,
        setItemStatus,
        reorder,
        uploadMedia,
        fetchMediaList,
        refreshContent,
        selectedComponentId,
        setSelectedComponentId,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export function useCMS() {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return ctx;
}
