# DENZA × JAZZABLANCA — Launch Landing Page

A standalone Cloudflare Worker that serves the DENZA launch landing page
(static assets) and accepts "Request Private Access" lead submissions at
`POST /api/submit`.

Built to match the approved design: header logos, car lineup (D9 / N7 /
Z9 GT / B5), the **TECHNOLOGY DRIVES ELEGANCE** hero, the request form, and
the argyle texture background.

## Structure

```
denza-launch/
├── public/
│   ├── index.html          # the page (self-contained HTML + CSS + JS)
│   └── assets/
│       ├── bg.jpeg         # background texture (2nd reference image)
│       ├── cars.png        # car lineup strip
│       ├── denza-logo.png  # header logo (left)
│       └── jazz-logo.png   # Jazzablanca partner logo (right)
├── src/index.js            # Worker: serves assets + handles /api/submit
├── wrangler.jsonc          # Worker + custom-domain config
└── package.json
```

## Local preview

```bash
cd denza-launch
npx wrangler dev --local
# open http://localhost:8787
```

## Deploy to Cloudflare (custom domain: denza.expndy.com)

Authenticate once with the target Cloudflare account, then deploy:

```bash
cd denza-launch
npx wrangler login            # or set CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
npx wrangler deploy
```

`wrangler deploy` reads `wrangler.jsonc`, which maps the Worker to the
custom domain **`denza.expndy.com`**. The `expndy.com` zone must already be
active in that Cloudflare account; Wrangler provisions the edge certificate
automatically on first deploy.

> The original request said `denza@expndy.com` — that isn't a valid hostname,
> so it's configured as the subdomain `denza.expndy.com`. To use a different
> hostname, edit the `routes[0].pattern` in `wrangler.jsonc`.

## Capturing leads (optional)

Out of the box, submissions are validated and written to the Worker log
(visible via `wrangler tail`). To persist them, create a KV namespace and
bind it as `LEADS`:

```bash
npx wrangler kv namespace create LEADS
```

Then uncomment the `kv_namespaces` block in `wrangler.jsonc`, paste the
returned `id`, and redeploy. Stored leads are keyed `lead:<timestamp>:<uuid>`.
