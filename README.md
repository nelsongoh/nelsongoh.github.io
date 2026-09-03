# nelsongoh.github.io

Personal landing page and visual resume for Nelson Goh. Static HTML, no build step, no JavaScript, no third-party requests.

## Deploy to GitHub Pages

1. Create a public repository named exactly `nelsongoh.github.io` under the `nelsongoh` account.
2. Copy the contents of this folder to the repository root and push to `main`. Keep the `.nojekyll` and `.well-known` entries (they are dotfiles, so check that they were copied).
3. In the repository, open Settings, then Pages. Under "Build and deployment" choose Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`. Save.
4. Tick "Enforce HTTPS" once the certificate is issued (a few minutes).
5. Visit https://nelsongoh.github.io/ .

If you later use a custom domain, add a `CNAME` file containing the bare domain, point the domain's DNS at GitHub Pages, and replace every `https://nelsongoh.github.io/` in `index.html`, `sitemap.xml`, `robots.txt`, `resume.json`, `llms.txt` and `.well-known/security.txt`.

## Before going live

- [x] Headshot: `assets/headshot.jpg` is the colour crop used on the page (4:5, 800 by 1000 px, gently warmed toward the page's cream). `assets/headshot-colour.jpg` is the untouched crop. The JSON-LD Person and resume.json point at `headshot.jpg`.
- [ ] Bump the `Expires` date in `.well-known/security.txt` once a year.
- [ ] Update `dateModified` (JSON-LD), `lastmod` (sitemap), `lastModified` (resume.json) and the llms.txt note when the content changes.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The page. JSON-LD `ProfilePage` + `Person` in the head. |
| `styles.css` | All styling. Mobile first, 12-column masthead grid from 1100px. Motion is CSS only: headline stagger on load, scroll-driven row reveals and number ignition, the Career "arc" rule (desktop), a pulse on the header dot, and a hover nudge on row numbers. Scroll-driven pieces sit inside `@supports (animation-timeline: view())` so older browsers get the static page; `prefers-reduced-motion` switches everything off. |
| `fonts/` | Self-hosted Newsreader, Instrument Sans, JetBrains Mono (OFL, see `fonts/LICENSE.md`). |
| `resume.json` | JSON Resume v1.0.0. Linked from the head as `rel="alternate"`. |
| `llms.txt` | Plain-language summary for AI agents (llmstxt.org format). |
| `robots.txt`, `sitemap.xml` | Crawl directives and the single-URL sitemap. |
| `.well-known/security.txt` | RFC 9116 security contact. |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` | Icon set: Newsreader "N" with an amber full stop on dark paper. |
| `assets/og-card.png` | 1200 by 630 social preview card. |
| `404.html` | Custom not-found page, `noindex`. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll build). |

## Hardening notes

GitHub Pages cannot set custom response headers, so the protections live in the document and in what the site refuses to do.

- **No JavaScript at all.** The ticker and the reveal are CSS animations. Nothing to inject into, nothing to update.
- **Content Security Policy via meta tag.** `default-src 'none'` with `style-src`, `font-src`, `img-src` and `manifest-src` limited to `'self'`, `base-uri 'none'`, `form-action 'none'`, `upgrade-insecure-requests`. Any script, frame, or third-party fetch is blocked by the browser, including anything an extension or a stray copy-paste might add later. JSON-LD is a data block, not executable, so the CSP does not affect it. `frame-ancestors` cannot be set from a meta tag, so clickjacking protection is not available; the site has no forms or state, so there is nothing to hijack.
- **No third-party requests.** Fonts are self-hosted, so visitors' IP addresses are not sent to Google Fonts. No analytics, no cookies, no embeds. If analytics are ever wanted, add a cookieless provider and extend `connect-src` and `script-src` accordingly.
- **Referrer policy** `strict-origin-when-cross-origin`: outbound clicks reveal only the origin, never a path.
- **External links** carry `rel="noopener"` (and `rel="me"` for identity links, which lets LinkedIn and GitHub be verified as the same person by IndieWeb tooling).
- **HTTPS** is enforced by GitHub Pages; `*.github.io` is on the HSTS preload list, so browsers never try plain HTTP.
- **security.txt** gives researchers a contact and an expiry.
- **Published personal data is deliberately minimal:** name, employer, city, email, LinkedIn, GitHub. No phone number, no street address, no birth date. The email is in plain text by choice, so that people and agents can actually use it; if scraping becomes a problem, replace it with a contact form on a separate service.

Repository-side hygiene, which matters more than any header for a static site:

- Turn on two-factor authentication for the GitHub account and use a passkey or hardware key.
- Keep the deployment on "Deploy from a branch". Do not add a GitHub Actions workflow or a Node build: every dependency would be a supply-chain surface for a site that needs none.
- Protect `main` (require a pull request or at least block force pushes), and review any pull request from a stranger before merging. Dependabot is unnecessary because there are no dependencies.
- The CV is deliberately not on the site; it lives in `ai-workshop/cv/` and is shared as a PDF on request. Never commit it, or the design folder's notes, to the public repository. Only this folder goes public.

## Local preview

Open `index.html` directly in a browser, or run a static server from this folder:

```
python -m http.server 8000
```

Headless Chrome enforces a 500 px minimum window, so to preview the 390 px layout use the browser's device toolbar rather than a headless screenshot.
