import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(ROOT_DIR, 'dist');
const INDEX_FILE = join(DIST_DIR, 'index.html');
const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function toFilePath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const sanitizedPath = decodedPath.replace(/^\/+/, '');
  const normalizedPath = normalize(sanitizedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  return join(DIST_DIR, normalizedPath);
}

async function hasFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function sendFile(response, path, method, cacheControl) {
  response.writeHead(200, {
    'Cache-Control': cacheControl,
    'Content-Type': MIME_TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream',
  });

  if (method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(path).pipe(response);
}

const server = createServer(async (request, response) => {
  const method = request.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const requestedPath = toFilePath(pathname);
  const extension = extname(pathname).toLowerCase();

  if (extension) {
    if (await hasFile(requestedPath)) {
      sendFile(response, requestedPath, method, 'public, max-age=31536000, immutable');
      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  sendFile(response, INDEX_FILE, method, 'no-cache');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Nexus-Arqui listening on port ${PORT}`);
});
