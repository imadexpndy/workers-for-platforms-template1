/**
 * DENZA × JAZZABLANCA launch landing page.
 *
 * Serves the static page from /public and accepts lead submissions at
 * POST /api/submit. Submissions are stored in the LEADS KV namespace when
 * one is bound; otherwise they are written to the Worker log so the form
 * still works on a bare `wrangler deploy` with no extra provisioning.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/submit') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
      }
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
      }

      let data;
      try {
        data = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }

      const required = ['nom', 'prenom', 'email', 'telephone', 'ville'];
      for (const f of required) {
        if (!data[f] || String(data[f]).trim() === '') {
          return json({ error: `Missing field: ${f}` }, 400);
        }
      }
      if (!data.consent) {
        return json({ error: 'Consent required' }, 400);
      }

      const lead = {
        nom: String(data.nom).slice(0, 120),
        prenom: String(data.prenom).slice(0, 120),
        email: String(data.email).slice(0, 200),
        telephone: String(data.telephone).slice(0, 60),
        ville: String(data.ville).slice(0, 120),
        consent: true,
        receivedAt: new Date().toISOString(),
        ip: request.headers.get('CF-Connecting-IP') || null,
      };

      if (env.LEADS) {
        const key = `lead:${lead.receivedAt}:${crypto.randomUUID()}`;
        await env.LEADS.put(key, JSON.stringify(lead));
      } else {
        console.log('DENZA lead (no KV bound):', JSON.stringify(lead));
      }

      return json({ ok: true });
    }

    // Everything else: serve the static landing page.
    return env.ASSETS.fetch(request);
  },
};
