const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

test('GET /api/generate returns a line', async () => {
  const res = await fetch(`${baseUrl}/api/generate`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.text);
});

test('GET /api/search without query returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/search`);
  assert.equal(res.status, 400);
});

test('POST /api/submit creates a new line', async () => {
  const create = await fetch(`${baseUrl}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Are you CSS? Because you style my life.', category: 'nerdy' })
  });

  assert.equal(create.status, 201);
  const body = await create.json();
  assert.equal(body.source, 'user');
});
