import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { DrivePortfolioSyncManager } from './driveSyncService';
import { CMSManager } from './cmsService';

interface ParsedMultipartPart {
  filename: string;
  buffer: Buffer;
  mimeType?: string;
  name?: string;
}

function parseRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB limit for 4K video/images

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        req.destroy(new Error('File upload exceeds maximum 100MB size limit.'));
        return;
      }
      chunks.push(Buffer.from(chunk));
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', reject);
  });
}

function parseMultipartFormData(bodyBuffer: Buffer, boundary: string): ParsedMultipartPart[] {
  const parts: ParsedMultipartPart[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let start = 0;

  while (start < bodyBuffer.length) {
    const boundaryIdx = bodyBuffer.indexOf(boundaryBuffer, start);
    if (boundaryIdx === -1) break;

    const partStart = boundaryIdx + boundaryBuffer.length;
    // Check for trailing '--' indicating end of stream
    if (
      partStart + 1 < bodyBuffer.length &&
      bodyBuffer[partStart] === 45 && // '-'
      bodyBuffer[partStart + 1] === 45 // '-'
    ) {
      break;
    }

    const nextBoundaryIdx = bodyBuffer.indexOf(boundaryBuffer, partStart);
    if (nextBoundaryIdx === -1) break;

    let partData = bodyBuffer.subarray(partStart, nextBoundaryIdx);
    start = nextBoundaryIdx;

    // Remove leading CRLF after boundary
    if (partData.length >= 2 && partData[0] === 13 && partData[1] === 10) {
      partData = partData.subarray(2);
    } else if (partData.length >= 1 && partData[0] === 10) {
      partData = partData.subarray(1);
    }

    // Remove trailing CRLF before next boundary
    if (
      partData.length >= 2 &&
      partData[partData.length - 2] === 13 &&
      partData[partData.length - 1] === 10
    ) {
      partData = partData.subarray(0, partData.length - 2);
    } else if (partData.length >= 1 && partData[partData.length - 1] === 10) {
      partData = partData.subarray(0, partData.length - 1);
    }

    // Find header boundary (\r\n\r\n or \n\n)
    const headerDelimCRLF = partData.indexOf(Buffer.from('\r\n\r\n'));
    const headerDelimLF = partData.indexOf(Buffer.from('\n\n'));
    let headerEnd = -1;
    let dataStart = -1;

    if (headerDelimCRLF !== -1) {
      headerEnd = headerDelimCRLF;
      dataStart = headerDelimCRLF + 4;
    } else if (headerDelimLF !== -1) {
      headerEnd = headerDelimLF;
      dataStart = headerDelimLF + 2;
    }

    if (headerEnd === -1) continue;

    const headerText = partData.subarray(0, headerEnd).toString('utf-8');
    const content = partData.subarray(dataStart);

    const nameMatch = headerText.match(/name="?([^";\r\n]+)"?/i);
    const filenameMatch = headerText.match(/filename="?([^";\r\n]+)"?/i);
    const mimeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);

    const filename = filenameMatch ? filenameMatch[1].trim() : '';
    const mimeType = mimeMatch ? mimeMatch[1].trim() : undefined;
    const name = nameMatch ? nameMatch[1].trim() : undefined;

    if (filename || (content.length > 0 && name && name !== 'token' && name !== 'password')) {
      parts.push({
        filename: filename || `upload_${Date.now()}.png`,
        buffer: content,
        mimeType,
        name,
      });
    }
  }

  return parts;
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(JSON.stringify(data));
}

function verifyAdmin(req: IncomingMessage, cms: CMSManager, parsedUrl: URL): boolean {
  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && cms.verifyToken(authHeader)) return true;

  // 2. Custom header: x-admin-token
  const xToken = req.headers['x-admin-token'] as string;
  if (xToken && cms.verifyToken(xToken)) return true;

  // 3. Custom header: x-admin-password
  const xPassword = req.headers['x-admin-password'] as string;
  if (xPassword && cms.authenticate(xPassword).success) return true;

  // 4. Query param ?token=...
  const queryToken = parsedUrl.searchParams.get('token');
  if (queryToken && cms.verifyToken(queryToken)) return true;

  // 5. Query param ?password=... or ?key=...
  const queryPass = parsedUrl.searchParams.get('password') || parsedUrl.searchParams.get('key');
  if (queryPass && cms.authenticate(queryPass).success) return true;

  return false;
}

export function odsDrivePortfolioPlugin(projectRoot: string): Plugin {
  let syncManager: DrivePortfolioSyncManager | null = null;
  let cmsManager: CMSManager | null = null;

  const getSyncManager = () => {
    if (!syncManager) {
      syncManager = new DrivePortfolioSyncManager(projectRoot);
    }
    return syncManager;
  };

  const getCmsManager = () => {
    if (!cmsManager) {
      cmsManager = new CMSManager(projectRoot);
    }
    return cmsManager;
  };

  const attachMiddleware = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = req.url || '';
      const parsedUrl = new URL(url, 'http://localhost');
      const pathname = parsedUrl.pathname;

      // 0. High-Performance Static Delivery for Uploads (/uploads/*) with HTTP Range Support for Video Seeking
      if (pathname.startsWith('/uploads/')) {
        const relativePath = decodeURIComponent(pathname.replace('/uploads/', ''));
        const filePath = path.join(projectRoot, 'public', 'uploads', relativePath);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.avif': 'image/avif',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
          };
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          const range = req.headers.range;

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            const chunkSize = end - start + 1;

            res.statusCode = 206;
            res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunkSize);
            res.setHeader('Content-Type', contentType);
            fs.createReadStream(filePath, { start, end }).pipe(res);
            return;
          }

          res.statusCode = 200;
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      // 1. Universal Media Upload Endpoints:
      // Accepts POST to /api/cms/media/upload, /api/cms/upload, /api/media/upload, /api/upload
      const isUploadRoute =
        pathname === '/api/cms/media/upload' ||
        pathname === '/api/cms/upload' ||
        pathname === '/api/media/upload' ||
        pathname === '/api/upload';

      if (isUploadRoute && req.method === 'POST') {
        const cms = getCmsManager();
        const isAuthed = verifyAdmin(req, cms, parsedUrl);

        if (!isAuthed) {
          sendJson(res, 401, {
            error:
              'Unauthorized. Pass Authorization header (Bearer <token>), x-admin-password, or ?password=olar2026',
          });
          return;
        }

        try {
          const rawBuffer = await parseRawBody(req);
          const contentType = req.headers['content-type'] || '';

          // CASE A: multipart/form-data (FormData from browser, curl -F, Postman)
          if (contentType.includes('multipart/form-data')) {
            const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
            if (!boundaryMatch) {
              sendJson(res, 400, { error: 'Missing boundary in multipart/form-data header.' });
              return;
            }
            const boundary = boundaryMatch[1].trim().replace(/^["']|["']$/g, '');
            const parts = parseMultipartFormData(rawBuffer, boundary);

            if (parts.length === 0) {
              sendJson(res, 400, { error: 'No file part found in multipart form-data payload.' });
              return;
            }

            const primaryPart = parts[0];
            const fileInfo = cms.saveUploadedFile(
              primaryPart.filename,
              primaryPart.buffer,
              primaryPart.mimeType
            );

            sendJson(res, 200, {
              success: true,
              ...fileInfo,
              partsUploaded: parts.length,
            });
            return;
          }

          // CASE B: application/json (Base64 or dataUrl payload)
          let jsonBody: any = null;
          try {
            const bodyStr = rawBuffer.toString('utf-8');
            if (bodyStr.trim().startsWith('{')) {
              jsonBody = JSON.parse(bodyStr);
            }
          } catch {
            // Not JSON
          }

          if (jsonBody) {
            const filename =
              jsonBody.filename || jsonBody.name || parsedUrl.searchParams.get('filename') || 'upload.png';
            const rawBase64 =
              jsonBody.dataUrl || jsonBody.base64 || jsonBody.file || jsonBody.image || jsonBody.content;

            if (!rawBase64 || typeof rawBase64 !== 'string') {
              sendJson(res, 400, {
                error:
                  'Invalid JSON payload. Provide { filename: "...", dataUrl: "data:image/...;base64,..." } or { filename: "...", base64: "..." }',
              });
              return;
            }

            let base64Data = rawBase64;
            let mimeType: string | undefined;

            const match = rawBase64.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              base64Data = match[2];
            }

            const fileBuffer = Buffer.from(base64Data, 'base64');
            const fileInfo = cms.saveUploadedFile(filename, fileBuffer, mimeType);
            sendJson(res, 200, { success: true, ...fileInfo });
            return;
          }

          // CASE C: Raw Binary Upload (image/*, video/*, octet-stream)
          const fallbackFilename =
            (req.headers['x-filename'] as string) ||
            parsedUrl.searchParams.get('filename') ||
            `upload_${Date.now()}`;

          const fileInfo = cms.saveUploadedFile(fallbackFilename, rawBuffer, contentType);
          sendJson(res, 200, { success: true, ...fileInfo });
          return;
        } catch (err: any) {
          sendJson(res, 500, { error: err.message || 'Media upload failed.' });
          return;
        }
      }

      // 2. Media Listing Endpoints (/api/cms/media or /api/media)
      if ((pathname === '/api/cms/media' || pathname === '/api/media') && req.method === 'GET') {
        const cms = getCmsManager();
        const mediaList = cms.listMedia();
        sendJson(res, 200, { success: true, media: mediaList });
        return;
      }

      // 3. CMS & Auth Endpoints
      if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/cms')) {
        const cms = getCmsManager();
        const isAuthed = verifyAdmin(req, cms, parsedUrl);

        // POST /api/auth/login
        if (pathname === '/api/auth/login' && req.method === 'POST') {
          try {
            const rawBuffer = await parseRawBody(req);
            const body = JSON.parse(rawBuffer.toString('utf-8'));
            const result = cms.authenticate(body.password || '');
            if (result.success) {
              sendJson(res, 200, result);
            } else {
              sendJson(res, 401, result);
            }
          } catch {
            sendJson(res, 400, { error: 'Invalid login payload.' });
          }
          return;
        }

        // GET /api/auth/verify
        if (pathname === '/api/auth/verify' && req.method === 'GET') {
          if (isAuthed) {
            sendJson(res, 200, { valid: true });
          } else {
            sendJson(res, 401, { valid: false, error: 'Unauthorized' });
          }
          return;
        }

        // GET /api/cms/content
        if (pathname === '/api/cms/content' && req.method === 'GET') {
          const includeDrafts =
            parsedUrl.searchParams.get('all') === 'true' ||
            parsedUrl.searchParams.get('preview') === 'true';
          if (includeDrafts && isAuthed) {
            sendJson(res, 200, cms.getAllContent());
          } else {
            sendJson(res, 200, cms.getPublishedContent());
          }
          return;
        }

        // Protected CMS Mutations below
        if (!isAuthed) {
          sendJson(res, 401, { error: 'Unauthorized: valid CMS session token or password required.' });
          return;
        }

        // POST /api/cms/save
        if (pathname === '/api/cms/save' && req.method === 'POST') {
          try {
            const rawBuffer = await parseRawBody(req);
            const body = JSON.parse(rawBuffer.toString('utf-8'));
            const updated = cms.saveContent(body);
            sendJson(res, 200, { success: true, database: updated });
          } catch (err: any) {
            sendJson(res, 500, { error: err.message || 'Failed to save content.' });
          }
          return;
        }

        // POST /api/cms/publish
        if (pathname === '/api/cms/publish' && req.method === 'POST') {
          try {
            const rawBuffer = await parseRawBody(req);
            const body = JSON.parse(rawBuffer.toString('utf-8'));
            if (body.all) {
              const updated = cms.publishAll();
              sendJson(res, 200, { success: true, database: updated });
            } else if (body.collection && body.id) {
              const updated = cms.setItemStatus(body.collection, body.id, 'published');
              sendJson(res, 200, { success: true, database: updated });
            } else {
              sendJson(res, 400, { error: 'Specify "all: true" or collection & id.' });
            }
          } catch (err: any) {
            sendJson(res, 500, { error: err.message || 'Failed to publish.' });
          }
          return;
        }

        // POST /api/cms/unpublish
        if (pathname === '/api/cms/unpublish' && req.method === 'POST') {
          try {
            const rawBuffer = await parseRawBody(req);
            const body = JSON.parse(rawBuffer.toString('utf-8'));
            if (body.collection && body.id) {
              const updated = cms.setItemStatus(body.collection, body.id, 'draft');
              sendJson(res, 200, { success: true, database: updated });
            } else {
              sendJson(res, 400, { error: 'Specify collection and id.' });
            }
          } catch (err: any) {
            sendJson(res, 500, { error: err.message || 'Failed to unpublish.' });
          }
          return;
        }

        // POST /api/cms/reorder
        if (pathname === '/api/cms/reorder' && req.method === 'POST') {
          try {
            const rawBuffer = await parseRawBody(req);
            const body = JSON.parse(rawBuffer.toString('utf-8'));
            if (body.collection && Array.isArray(body.orderedIds)) {
              const updated = cms.reorderCollection(body.collection, body.orderedIds);
              sendJson(res, 200, { success: true, database: updated });
            } else {
              sendJson(res, 400, { error: 'Specify collection and orderedIds array.' });
            }
          } catch (err: any) {
            sendJson(res, 500, { error: err.message || 'Failed to reorder.' });
          }
          return;
        }

        sendJson(res, 404, { error: 'Unknown CMS endpoint.' });
        return;
      }

      // 4. Google Drive Sync Endpoints
      if (!url.startsWith('/api/portfolio')) {
        next();
        return;
      }

      const manager = getSyncManager();

      // GET /api/portfolio — Return synchronized portfolio index
      if (pathname === '/api/portfolio' && req.method === 'GET') {
        const index = manager.getPortfolioIndex();
        sendJson(res, 200, index);
        return;
      }

      // POST /api/portfolio/sync — Trigger synchronization (Manual or Drive Push Webhook)
      if (pathname === '/api/portfolio/sync' && req.method === 'POST') {
        const syncSecret = process.env.PORTFOLIO_SYNC_SECRET;
        if (syncSecret) {
          const authHeader = req.headers.authorization || '';
          const channelToken = req.headers['x-goog-channel-token'] || '';
          if (authHeader !== `Bearer ${syncSecret}` && channelToken !== syncSecret) {
            sendJson(res, 401, { error: 'Unauthorized sync trigger.' });
            return;
          }
        }

        const updated = await manager.syncAllFolders();
        sendJson(res, 200, updated);
        return;
      }

      // GET /api/portfolio/media/:fileId
      if (pathname.startsWith('/api/portfolio/media/') && req.method === 'GET') {
        const fileId = decodeURIComponent(pathname.replace('/api/portfolio/media/', ''));
        await manager.proxyDriveMedia(fileId, false, req, res);
        return;
      }

      // GET /api/portfolio/thumbnail/:fileId
      if (pathname.startsWith('/api/portfolio/thumbnail/') && req.method === 'GET') {
        const fileId = decodeURIComponent(pathname.replace('/api/portfolio/thumbnail/', ''));
        await manager.proxyDriveMedia(fileId, true, req, res);
        return;
      }

      sendJson(res, 404, { error: 'Unknown /api/portfolio endpoint.' });
    });
  };

  return {
    name: 'ods-drive-portfolio-api',
    configureServer(server) {
      attachMiddleware(server);
    },
    configurePreviewServer(server) {
      attachMiddleware(server);
    },
  };
}
