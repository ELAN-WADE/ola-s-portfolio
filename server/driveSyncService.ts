import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type PortfolioFolderCategory =
  | 'Logo Branding'
  | 'Social Media Design'
  | 'Flyers'
  | 'Cinematic Video Editing';

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

export interface PortfolioIndexData {
  configured: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'ok' | 'degraded' | 'unconfigured';
  message?: string;
  folders: Record<PortfolioFolderCategory, { configured: boolean; itemCount: number }>;
  driveItems: DriveMediaItem[];
}

interface GoogleDriveFileRaw {
  id: string;
  name: string;
  description?: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
  };
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
}

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const CATEGORIES: PortfolioFolderCategory[] = [
  'Logo Branding',
  'Social Media Design',
  'Flyers',
  'Cinematic Video Editing',
];

function parseEnvFile(projectRoot: string): Record<string, string> {
  const envVars: Record<string, string> = {};
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envVars[key] = val;
      }
    } catch {
      // Ignore malformed .env
    }
  }
  return { ...envVars, ...(process.env as Record<string, string>) };
}

function formatTitleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  return withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export class DrivePortfolioSyncManager {
  private projectRoot: string;
  private indexFilePath: string;
  private cacheDir: string;
  private indexData: PortfolioIndexData;
  private cachedAccessToken: { token: string; expiresAt: number } | null = null;
  private syncInProgress = false;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    const dataDir = path.join(projectRoot, 'data');
    this.indexFilePath = path.join(dataDir, 'portfolio-index.json');
    this.cacheDir = path.join(dataDir, 'media-cache');

    this.indexData = this.loadPersistedIndex();
    this.refreshConfigurationState();
    this.startScheduledSync();
  }

  private getEnv(): Record<string, string> {
    return parseEnvFile(this.projectRoot);
  }

  private createEmptyFoldersRecord(): Record<
    PortfolioFolderCategory,
    { configured: boolean; itemCount: number }
  > {
    return {
      'Logo Branding': { configured: false, itemCount: 0 },
      'Social Media Design': { configured: false, itemCount: 0 },
      Flyers: { configured: false, itemCount: 0 },
      'Cinematic Video Editing': { configured: false, itemCount: 0 },
    };
  }

  private loadPersistedIndex(): PortfolioIndexData {
    if (fs.existsSync(this.indexFilePath)) {
      try {
        const raw = fs.readFileSync(this.indexFilePath, 'utf-8');
        const parsed = JSON.parse(raw) as PortfolioIndexData;
        if (parsed && Array.isArray(parsed.driveItems)) {
          return parsed;
        }
      } catch {
        // Fall through to default index
      }
    }
    return {
      configured: false,
      lastSyncedAt: null,
      syncStatus: 'unconfigured',
      message:
        'Google Drive credentials or folder IDs are not configured yet. Displaying curated ODS portfolio.',
      folders: this.createEmptyFoldersRecord(),
      driveItems: [],
    };
  }

  private persistIndex(): void {
    try {
      const dir = path.dirname(this.indexFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.indexFilePath, JSON.stringify(this.indexData, null, 2), 'utf-8');
    } catch {
      // Non-fatal persistence error
    }
  }

  private getFolderConfig(env: Record<string, string>): {
    rootFolderId?: string;
    categoryFolders: Partial<Record<PortfolioFolderCategory, string>>;
    hasAuth: boolean;
  } {
    let serviceEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    let privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
    const credentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS || '';

    if ((!serviceEmail || !privateKey) && credentialsPath) {
      const resolvedPath = path.isAbsolute(credentialsPath)
        ? credentialsPath
        : path.join(this.projectRoot, credentialsPath);
      if (fs.existsSync(resolvedPath)) {
        try {
          const creds = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
          serviceEmail = creds.client_email || serviceEmail;
          privateKey = creds.private_key || privateKey;
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    const apiKey = env.GOOGLE_DRIVE_API_KEY || '';
    const hasAuth = Boolean((serviceEmail && privateKey) || apiKey);

    const categoryFolders: Partial<Record<PortfolioFolderCategory, string>> = {
      'Logo Branding': env.GOOGLE_DRIVE_FOLDER_LOGO_BRANDING || undefined,
      'Social Media Design': env.GOOGLE_DRIVE_FOLDER_SOCIAL_MEDIA || undefined,
      Flyers: env.GOOGLE_DRIVE_FOLDER_FLYERS || undefined,
      'Cinematic Video Editing': env.GOOGLE_DRIVE_FOLDER_VIDEO_EDITING || undefined,
    };

    const rootFolderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID || undefined;

    return { rootFolderId, categoryFolders, hasAuth };
  }

  public refreshConfigurationState(): void {
    const env = this.getEnv();
    const { rootFolderId, categoryFolders, hasAuth } = this.getFolderConfig(env);
    const anyFolderConfigured =
      Boolean(rootFolderId) || CATEGORIES.some((c) => Boolean(categoryFolders[c]));

    this.indexData.configured = hasAuth && anyFolderConfigured;

    for (const cat of CATEGORIES) {
      const count = this.indexData.driveItems.filter((item) => item.category === cat).length;
      this.indexData.folders[cat] = {
        configured: Boolean(categoryFolders[cat] || rootFolderId),
        itemCount: count,
      };
    }

    if (!this.indexData.configured) {
      this.indexData.syncStatus = 'unconfigured';
      this.indexData.message =
        'Google Drive environment variables are not configured. Serving baseline curated portfolio.';
    } else if (this.indexData.syncStatus === 'unconfigured') {
      this.indexData.syncStatus = 'idle';
      this.indexData.message = 'Google Drive integration configured and ready to synchronize.';
    }
  }

  private startScheduledSync(): void {
    const env = this.getEnv();
    const intervalMs = Math.max(60_000, Number(env.PORTFOLIO_SYNC_INTERVAL_MS) || 300_000);

    if (this.indexData.configured) {
      void this.syncAllFolders();
    }

    this.syncTimer = setInterval(() => {
      this.refreshConfigurationState();
      if (this.indexData.configured) {
        void this.syncAllFolders();
      }
    }, intervalMs);

    if (this.syncTimer.unref) {
      this.syncTimer.unref();
    }
  }

  private async getServiceAccountToken(
    clientEmail: string,
    rawPrivateKey: string
  ): Promise<string> {
    const nowSec = Math.floor(Date.now() / 1000);
    if (this.cachedAccessToken && this.cachedAccessToken.expiresAt > nowSec + 60) {
      return this.cachedAccessToken.token;
    }

    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: nowSec + 3600,
        iat: nowSec,
      })
    ).toString('base64url');

    const signingInput = `${header}.${payload}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signingInput);
    signer.end();
    const signature = signer.sign(privateKey, 'base64url');
    const assertion = `${signingInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });

    if (!res.ok) {
      throw new Error(`Google OAuth2 token exchange failed (${res.status})`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.cachedAccessToken = {
      token: data.access_token,
      expiresAt: nowSec + (data.expires_in || 3600),
    };
    return data.access_token;
  }

  private async getAuthHeadersAndKey(): Promise<{
    headers: Record<string, string>;
    apiKey?: string;
  }> {
    const env = this.getEnv();
    let serviceEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    let privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
    const credentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS || '';

    if ((!serviceEmail || !privateKey) && credentialsPath) {
      const resolvedPath = path.isAbsolute(credentialsPath)
        ? credentialsPath
        : path.join(this.projectRoot, credentialsPath);
      if (fs.existsSync(resolvedPath)) {
        const creds = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
        serviceEmail = creds.client_email || serviceEmail;
        privateKey = creds.private_key || privateKey;
      }
    }

    if (serviceEmail && privateKey) {
      const token = await this.getServiceAccountToken(serviceEmail, privateKey);
      return { headers: { Authorization: `Bearer ${token}` } };
    }

    if (env.GOOGLE_DRIVE_API_KEY) {
      return { headers: {}, apiKey: env.GOOGLE_DRIVE_API_KEY };
    }

    throw new Error('No valid Google Drive server credentials configured.');
  }

  private async fetchDriveWithRetry(
    url: string,
    headers: Record<string, string>,
    retries = 2
  ): Promise<Response> {
    let attempt = 0;
    while (true) {
      const res = await fetch(url, { headers });
      if (res.ok) return res;
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        attempt++;
        const backoffMs = 500 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      return res;
    }
  }

  private async discoverSubfoldersFromRoot(
    rootFolderId: string,
    headers: Record<string, string>,
    apiKey?: string
  ): Promise<Partial<Record<PortfolioFolderCategory, string>>> {
    const discovered: Partial<Record<PortfolioFolderCategory, string>> = {};
    const q = `'${rootFolderId.replace(/'/g, '')}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const params = new URLSearchParams({
      q,
      fields: 'files(id, name)',
      pageSize: '50',
    });
    if (apiKey) params.set('key', apiKey);

    const res = await this.fetchDriveWithRetry(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      headers
    );
    if (!res.ok) return discovered;

    const data = (await res.json()) as { files?: { id: string; name: string }[] };
    for (const folder of data.files || []) {
      const lower = folder.name.trim().toLowerCase();
      if (lower.includes('logo')) {
        discovered['Logo Branding'] = folder.id;
      } else if (lower.includes('social')) {
        discovered['Social Media Design'] = folder.id;
      } else if (lower.includes('flyer') || lower.includes('poster')) {
        discovered['Flyers'] = folder.id;
      } else if (lower.includes('video') || lower.includes('cinematic')) {
        discovered['Cinematic Video Editing'] = folder.id;
      }
    }
    return discovered;
  }

  private async listValidFilesInFolder(
    folderId: string,
    category: PortfolioFolderCategory,
    headers: Record<string, string>,
    apiKey?: string
  ): Promise<DriveMediaItem[]> {
    const items: DriveMediaItem[] = [];
    const seenIds = new Set<string>();
    let pageToken: string | undefined;

    do {
      const q = `'${folderId.replace(/'/g, '')}' in parents and trashed = false`;
      const params = new URLSearchParams({
        q,
        fields:
          'nextPageToken, files(id, name, description, mimeType, size, createdTime, modifiedTime, thumbnailLink, imageMediaMetadata, videoMediaMetadata)',
        orderBy: 'createdTime desc',
        pageSize: '100',
      });
      if (pageToken) params.set('pageToken', pageToken);
      if (apiKey) params.set('key', apiKey);

      const res = await this.fetchDriveWithRetry(
        `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
        headers
      );

      if (!res.ok) {
        throw new Error(`Drive API returned HTTP ${res.status} for category "${category}"`);
      }

      const payload = (await res.json()) as {
        nextPageToken?: string;
        files?: GoogleDriveFileRaw[];
      };

      for (const file of payload.files || []) {
        if (!file.id || seenIds.has(file.id)) continue;

        const isImage = ALLOWED_IMAGE_MIMES.has(file.mimeType);
        const isVideo =
          category === 'Cinematic Video Editing' && ALLOWED_VIDEO_MIMES.has(file.mimeType);

        if (!isImage && !isVideo) continue;

        seenIds.add(file.id);
        const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

        items.push({
          id: `drive-${file.id}`,
          driveFileId: file.id,
          name: file.name,
          title: formatTitleFromFilename(file.name),
          description:
            file.description?.trim() ||
            `${category} piece synchronized from the official ODS studio archive.`,
          category,
          mimeType: file.mimeType,
          mediaType,
          mediaUrl: `/api/portfolio/media/${encodeURIComponent(file.id)}`,
          thumbnailUrl: `/api/portfolio/thumbnail/${encodeURIComponent(file.id)}`,
          sizeBytes: file.size ? Number(file.size) : undefined,
          width: file.imageMediaMetadata?.width || file.videoMediaMetadata?.width,
          height: file.imageMediaMetadata?.height || file.videoMediaMetadata?.height,
          durationMillis: file.videoMediaMetadata?.durationMillis
            ? Number(file.videoMediaMetadata.durationMillis)
            : undefined,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
        });
      }

      pageToken = payload.nextPageToken;
    } while (pageToken);

    return items;
  }

  public async syncAllFolders(): Promise<PortfolioIndexData> {
    this.refreshConfigurationState();
    if (!this.indexData.configured) {
      return this.indexData;
    }
    if (this.syncInProgress) {
      return this.indexData;
    }

    this.syncInProgress = true;
    this.indexData.syncStatus = 'syncing';

    try {
      const env = this.getEnv();
      const { rootFolderId, categoryFolders } = this.getFolderConfig(env);
      const { headers, apiKey } = await this.getAuthHeadersAndKey();

      const resolvedFolders: Partial<Record<PortfolioFolderCategory, string>> = {
        ...categoryFolders,
      };

      if (rootFolderId) {
        const discovered = await this.discoverSubfoldersFromRoot(rootFolderId, headers, apiKey);
        for (const cat of CATEGORIES) {
          if (!resolvedFolders[cat] && discovered[cat]) {
            resolvedFolders[cat] = discovered[cat];
          }
        }
      }

      const updatedDriveItems: DriveMediaItem[] = [];
      let hadPartialError = false;

      for (const cat of CATEGORIES) {
        const folderId = resolvedFolders[cat];
        if (!folderId) {
          this.indexData.folders[cat] = { configured: false, itemCount: 0 };
          continue;
        }

        try {
          const catItems = await this.listValidFilesInFolder(folderId, cat, headers, apiKey);
          updatedDriveItems.push(...catItems);
          this.indexData.folders[cat] = { configured: true, itemCount: catItems.length };
        } catch {
          hadPartialError = true;
          // Preserve previously synced items for this category on transient failure
          const fallbackCatItems = this.indexData.driveItems.filter((i) => i.category === cat);
          updatedDriveItems.push(...fallbackCatItems);
          this.indexData.folders[cat] = {
            configured: true,
            itemCount: fallbackCatItems.length,
          };
        }
      }

      this.indexData.driveItems = updatedDriveItems;
      this.indexData.lastSyncedAt = new Date().toISOString();
      this.indexData.syncStatus = hadPartialError ? 'degraded' : 'ok';
      this.indexData.message = hadPartialError
        ? 'Synchronized with partial fallback to cached studio index.'
        : `Synchronized ${updatedDriveItems.length} media item(s) from Google Drive.`;

      this.persistIndex();
    } catch (err) {
      // Preserve existing media if a temporary Google Drive failure occurs
      this.indexData.syncStatus = 'degraded';
      this.indexData.message =
        err instanceof Error
          ? `Google Drive sync error (${err.message}). Preserving cached portfolio media.`
          : 'Google Drive sync error. Preserving cached portfolio media.';
    } finally {
      this.syncInProgress = false;
    }

    return this.indexData;
  }

  public getPortfolioIndex(): PortfolioIndexData {
    this.refreshConfigurationState();
    return this.indexData;
  }

  public async proxyDriveMedia(
    fileId: string,
    isThumbnail: boolean,
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    // Security check: only serve files that belong to the synchronized portfolio index
    const indexedItem = this.indexData.driveItems.find((item) => item.driveFileId === fileId);
    if (!indexedItem) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Media item not found in authorized ODS portfolio index.' }));
      return;
    }

    try {
      if (isThumbnail) {
        if (!fs.existsSync(this.cacheDir)) {
          fs.mkdirSync(this.cacheDir, { recursive: true });
        }
        const cachedThumbPath = path.join(this.cacheDir, `thumb-${fileId}.bin`);
        if (fs.existsSync(cachedThumbPath)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', indexedItem.mimeType.startsWith('image/') ? indexedItem.mimeType : 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
          fs.createReadStream(cachedThumbPath).pipe(res);
          return;
        }
      }

      const { headers, apiKey } = await this.getAuthHeadersAndKey();
      const params = new URLSearchParams({ alt: 'media' });
      if (apiKey) params.set('key', apiKey);

      const upstreamHeaders: Record<string, string> = { ...headers };
      if (req.headers.range) {
        upstreamHeaders.Range = req.headers.range;
      }

      const driveRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${params.toString()}`,
        { headers: upstreamHeaders }
      );

      if (!driveRes.ok && driveRes.status !== 206) {
        res.statusCode = driveRes.status;
        res.end('Upstream media unavailable');
        return;
      }

      res.statusCode = driveRes.status;
      res.setHeader('Content-Type', driveRes.headers.get('content-type') || indexedItem.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      res.setHeader('Accept-Ranges', 'bytes');

      const contentRange = driveRes.headers.get('content-range');
      if (contentRange) res.setHeader('Content-Range', contentRange);
      const contentLength = driveRes.headers.get('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);

      const arrayBuffer = await driveRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isThumbnail && indexedItem.mediaType === 'image' && buffer.length < 8 * 1024 * 1024) {
        try {
          const cachedThumbPath = path.join(this.cacheDir, `thumb-${fileId}.bin`);
          fs.writeFileSync(cachedThumbPath, buffer);
        } catch {
          // Ignore cache write failure
        }
      }

      res.end(buffer);
    } catch {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to stream media from Google Drive.' }));
    }
  }
}

