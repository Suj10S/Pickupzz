const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const pickupLines = require('./data/pickupLines');

let lines = [...pickupLines];
const publicDir = path.join(__dirname, 'public');

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const pathname = req.url === '/' ? '/index.html' : req.url;
  const target = path.join(publicDir, pathname);

  if (!target.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(target, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(target);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/generate') {
    const category = url.searchParams.get('category');
    const filtered = category ? lines.filter((line) => line.category === category.toLowerCase()) : lines;

    if (!filtered.length) return sendJson(res, 404, { message: 'No pickup lines found for this category.' });
    return sendJson(res, 200, randomItem(filtered));
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/category/')) {
    const category = decodeURIComponent(url.pathname.replace('/api/category/', '')).toLowerCase();
    const results = lines.filter((line) => line.category === category);
    return sendJson(res, 200, results);
  }

  if (req.method === 'GET' && url.pathname === '/api/search') {
    const query = (url.searchParams.get('q') || '').trim().toLowerCase();
    if (!query) return sendJson(res, 400, { message: 'Please provide a search query via ?q=' });

    const results = lines.filter((line) =>
      line.text.toLowerCase().includes(query) || line.category.toLowerCase().includes(query)
    );

    return sendJson(res, 200, results);
  }

  if (req.method === 'POST' && url.pathname === '/api/submit') {
    try {
      const body = await parseBody(req);
      const { text, category = 'user' } = body;

      if (!text || !text.trim()) return sendJson(res, 400, { message: 'Pickup line text is required.' });

      const created = {
        id: lines.length + 1,
        text: text.trim(),
        category: String(category).toLowerCase(),
        likes: 0,
        source: 'user',
        createdAt: new Date().toISOString().slice(0, 10)
      };

      lines.unshift(created);
      return sendJson(res, 201, created);
    } catch (_error) {
      return sendJson(res, 400, { message: 'Invalid JSON body.' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/favorite') {
    try {
      const body = await parseBody(req);
      const match = lines.find((line) => line.id === Number(body.id));
      if (!match) return sendJson(res, 404, { message: 'Line not found.' });

      match.likes += 1;
      return sendJson(res, 200, { id: match.id, likes: match.likes });
    } catch (_error) {
      return sendJson(res, 400, { message: 'Invalid JSON body.' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/trending') {
    const trending = [...lines].sort((a, b) => b.likes - a.likes).slice(0, 5);
    return sendJson(res, 200, trending);
  }

  if (req.method === 'POST' && url.pathname === '/api/reset') {
    lines = [...pickupLines];
    return sendJson(res, 200, { message: 'Data reset.' });
  }

  if (req.method === 'GET') {
    return serveStatic(req, res);
  }

  res.writeHead(404);
  res.end('Not found');
}

function createServer() {
  return http.createServer((req, res) => {
    handler(req, res);
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Pickupzz running on http://localhost:${port}`);
  });
}

module.exports = { createServer };
