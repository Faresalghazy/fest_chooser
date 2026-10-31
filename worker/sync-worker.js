// Metal Summer 2027 sync server: a free Cloudflare Worker with one KV namespace bound as SYNC.
// POST /new          body = settings JSON  -> { code }
// GET  /c/ABCDEFGH                          -> settings JSON
// PUT  /c/ABCDEFGH   body = settings JSON  -> { ok: true }
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const MAX_BYTES = 60000;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const newCode = () => [...crypto.getRandomValues(new Uint8Array(8))].map((b) => ALPHABET[b % 32]).join('');

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX_BYTES) return { error: json({ error: 'too_large' }, 413) };
  try { JSON.parse(text); } catch { return { error: json({ error: 'bad_json' }, 400) }; }
  return { text };
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname === '/new') {
      const { text, error } = await readBody(req);
      if (error) return error;
      let code = newCode();
      for (let i = 0; i < 5 && (await env.SYNC.get(code)); i++) code = newCode();
      await env.SYNC.put(code, text);
      return json({ code });
    }

    const m = url.pathname.match(/^\/c\/([A-Z2-9]{8})$/);
    if (m && req.method === 'GET') {
      const value = await env.SYNC.get(m[1]);
      return value
        ? new Response(value, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS } })
        : json({ error: 'not_found' }, 404);
    }
    if (m && req.method === 'PUT') {
      if (!(await env.SYNC.get(m[1]))) return json({ error: 'not_found' }, 404);
      const { text, error } = await readBody(req);
      if (error) return error;
      await env.SYNC.put(m[1], text);
      return json({ ok: true });
    }
    return json({ error: 'not_found' }, 404);
  },
};
