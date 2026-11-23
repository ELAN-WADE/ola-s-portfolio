import { useState, useEffect, useCallback, useMemo } from 'react';
import { BRAND_PROJECTS, VIDEO_PROJECTS } from '../data/portfolioData';
import {
  BrandProject,
  VideoProject,
  BrandCategory,
  DriveMediaItem,
  PortfolioSyncPayload,
} from '../types';

function formatDurationMillis(ms?: number): string {
  if (!ms || ms <= 0) return '01:30';
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function mapDriveItemToBrandProject(item: DriveMediaItem): BrandProject | null {
  if (
    item.category !== 'Logo Branding' &&
    item.category !== 'Social Media Design' &&
    item.category !== 'Flyers'
  ) {
    return null;
  }

  const category: BrandCategory = item.category;
  const year = item.createdTime
    ? new Date(item.createdTime).getFullYear().toString()
    : new Date().getFullYear().toString();

  return {
    id: item.id,
    title: item.title,
    client: 'ODS Studio Archive',
    category,
    year,
    description: item.description,
    tags: [category, 'ODS Archive', item.mimeType.split('/')[1]?.toUpperCase() || 'MEDIA'],
    image: item.mediaUrl,
    colors: ['#070708', '#18181B', '#71717A', '#F4F4F5'],
    deliverables: [
      `${category} Production Asset`,
      item.width && item.height ? `${item.width}×${item.height}px Master` : 'High-Resolution Master',
    ],
    metrics: 'Drive Synchronized',
    source: 'google-drive',
    driveFileId: item.driveFileId,
    updatedAt: item.modifiedTime || item.createdTime,
  };
}

function mapDriveItemToVideoProject(item: DriveMediaItem): VideoProject | null {
  if (item.category !== 'Cinematic Video Editing') {
    return null;
  }

  const isVideo = item.mediaType === 'video';
  return {
    id: item.id,
    title: item.title,
    client: 'ODS Post-Production',
    duration: formatDurationMillis(item.durationMillis),
    format: item.width && item.height ? `${item.width}×${item.height} Master` : '4K DCI Master',
    role: 'Editor & Colorist',
    views: 'Studio Reel',
    description: item.description,
    image: isVideo ? item.thumbnailUrl : item.mediaUrl,
    videoUrl: isVideo ? item.mediaUrl : undefined,
    aspectRatio: '16:9 Widescreen',
    tags: ['Cinematic Editing', 'Color Science', isVideo ? 'Video Stream' : 'Still Frame'],
    source: 'google-drive',
    driveFileId: item.driveFileId,
    updatedAt: item.modifiedTime || item.createdTime,
  };
}

export function usePortfolioMedia() {
  const [syncState, setSyncState] = useState<PortfolioSyncPayload>({
    configured: false,
    lastSyncedAt: null,
    syncStatus: 'idle',
    folders: {
      'Logo Branding': { configured: false, itemCount: 0 },
      'Social Media Design': { configured: false, itemCount: 0 },
      Flyers: { configured: false, itemCount: 0 },
      'Cinematic Video Editing': { configured: false, itemCount: 0 },
    },
    driveItems: [],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPortfolioIndex = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = (await res.json()) as PortfolioSyncPayload;
      if (data && Array.isArray(data.driveItems)) {
        setSyncState(data);
      }
    } catch {
      // Gracefully keep baseline curated portfolio when running as static build
    }
  }, []);

  const triggerSync = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/portfolio/sync', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as PortfolioSyncPayload;
        if (data && Array.isArray(data.driveItems)) {
          setSyncState(data);
        }
      }
    } catch {
      // Ignore network errors and preserve existing data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchPortfolioIndex();
  }, [fetchPortfolioIndex]);

  const brandProjects = useMemo<BrandProject[]>(() => {
    const driveBrandItems = syncState.driveItems
      .map(mapDriveItemToBrandProject)
      .filter((item): item is BrandProject => item !== null);
    return [...BRAND_PROJECTS, ...driveBrandItems];
  }, [syncState.driveItems]);

  const videoProjects = useMemo<VideoProject[]>(() => {
    const driveVideoItems = syncState.driveItems
      .map(mapDriveItemToVideoProject)
      .filter((item): item is VideoProject => item !== null);
    return [...VIDEO_PROJECTS, ...driveVideoItems];
  }, [syncState.driveItems]);

  return {
    brandProjects,
    videoProjects,
    syncState,
    isRefreshing,
    triggerSync,
  };
}

