import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(ROOT_DIR, 'dist');
const INDEX_FILE = join(DIST_DIR, 'index.html');
const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PUBLIC_RUNTIME_ENV_KEYS = [
  'VITE_PERSISTENCE_ADAPTER',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

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

function buildRuntimeConfigScript() {
  const runtimeConfig = Object.fromEntries(
    PUBLIC_RUNTIME_ENV_KEYS.map((key) => [key, process.env[key]?.trim() ?? '']),
  );
  const serializedConfig = JSON.stringify(runtimeConfig).replace(/</g, '\\u003c');
  return `<script>window.__NEXUS_ARQUI_RUNTIME_CONFIG=${serializedConfig};</script>`;
}

async function sendIndexHtml(response, method) {
  const html = await readFile(INDEX_FILE, 'utf8');
  const injectedHtml = html.includes('</head>')
    ? html.replace('</head>', `${buildRuntimeConfigScript()}</head>`)
    : `${buildRuntimeConfigScript()}${html}`;

  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': MIME_TYPES['.html'],
  });

  if (method === 'HEAD') {
    response.end();
    return;
  }

  response.end(injectedHtml);
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

  if (requestedPath === INDEX_FILE) {
    await sendIndexHtml(response, method);
    return;
  }

  if (extension) {
    if (await hasFile(requestedPath)) {
      sendFile(response, requestedPath, method, 'public, max-age=31536000, immutable');
      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  await sendIndexHtml(response, method);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Nexus-Arqui listening on port ${PORT}`);
});
