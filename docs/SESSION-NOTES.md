# Session Notes — AISymmetric Ultimate AI Site

A running log of work sessions, decisions, and lessons learned. Chronological. Newest at top.

Keep this concise — one entry per meaningful work session. Record **what changed, why, and anything non-obvious** a future operator (or future Claude) should know before touching the repo again.

---

## 2026-04-21 — Session: DNS, SendGrid, success page v2 refactor

**Context.** Re-opening the project after a break. Previous session had not been saved to Claude memory, so the new session reoriented from scratch.

### Accomplished
- **Git identity unified.** Set `Tyler Perleberg <tyler.perleberg@aisymmetricsolutions.com>` globally and on all four AISymmetric repos (Ultimate-AI-Site, March-2026-Website, Web-Portfolio, aisymmetric-digital). Previously two repos were committing under the anonymous `aisymmetrictp@users.noreply.github.com`.
- **SendGrid Sender Authentication.** Added 5 CNAMEs to the Netlify DNS zone for `aisymmetricsolutions.com` (url3128, 97609978, em5332, s1._domainkey, s2._domainkey). Verified in SendGrid. DMARC was already in place — no change needed.
- **INFRASTRUCTURE.md.** Captured the full DNS/hosting/email topology in a committed reference doc under `docs/`.
- **/success page.** Built a customer-wins microsite at `aisymmetricsolutions.com/success/` — anonymized by industry and company size. Signature visualizations: the Delivery Heartbeat (5-stage chevron + EKG pulse + 6-lane × 5-stage coverage grid) and the Win Pulse timeline (Stream-Pulse-style vertical spine).
- **Refactored /success to match main-site brand.** Switched from dark theme to light, swapped fake CSS logo for the real `logo-transparent.png`, added cross-property links to aisymmetricdigital.com and aisymmetricaegis.com.

### Key decisions
- **DNS lives at Netlify, not a separate NS1 account.** Netlify DNS is built on NSONE infrastructure, which caused confusion — the `dns1-4.p03.nsone.net` nameservers look like a third-party NS1 account but are actually Netlify-managed. Record changes go through the Netlify dashboard or API, never through a separate NS1 portal.
- **/success is a subpath, not a subdomain.** Originally planned as `success.aisymmetricsolutions.com`. Chose `/success/` on the same site to avoid a new Netlify site + DNS record + repo.
- **Cross-property links live in nav, footer, and a dedicated Properties section.** Three entry points to the AISymmetric family (Solutions / Digital / Aegis).

### Lessons learned
- **CSS `animation-fill-mode: both` is a footgun for entrance animations.** Caused the /success hero to render blank in some browsers — the `from` state of `opacity: 0` stayed sticky. Fixed by removing the entrance animation entirely from the hero. Content renders visible by default. Scroll-reveal on below-fold sections is fine because those elements are visible by default too — JS only opts them into the hidden-then-revealed state if they're confirmed below-fold at page load.
- **Rule going forward: no JS-dependent visibility for above-the-fold content.** If the JS fails, the CSS animation stalls, or the browser has an edge-case render bug, content MUST still show. Progressive enhancement only — never progressive-require.
- **Content anonymization discipline.** Every customer win on /success names only industry + size. Source docs (`2025 Successes & Logos.docx`, `2026 Successes & Logos.docx`) stay in the staging folder (`AISYMMETRIC NEW WEBSITE\AISymmetric Success Stories Website\`) but never make it into the repo.

### Deploy pattern (important, counter-intuitive)
**This Netlify site is NOT connected to GitHub for auto-deploy.** `build_settings.repo_url` is null, no webhook. Every code change requires a manual CLI deploy:

```bash
cd "C:/Users/Tyler/Desktop/Claude Projects/Websites/NEW AISymmetric Solutions Website"
netlify deploy --prod --dir=. --site=b21b3dc8-43f1-4a71-ae8a-b26b256155fc --message="..."
```

Pushes to GitHub master are **silent no-ops from Netlify's perspective**. This caused an Apr 15 → Apr 21 deploy gap where GitHub master was ahead of production and nobody noticed.

**Pending.** GitHub Actions auto-deploy workflow is drafted at `.github/workflows/deploy.yml` (backup branch `backup-workflow-commit` preserves it). Cannot be pushed yet because the current `gh` CLI token lacks the `workflow` OAuth scope. To ship it: either (a) `gh auth refresh -h github.com -s workflow`, (b) create a classic PAT with `workflow` scope and paste it for a one-shot push, or (c) create the file directly in the GitHub web UI. Once shipped, every push to master will deploy via `netlify-cli` inside GH Actions, using the already-set `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` repo secrets.

### Follow-ups / backlog
- [ ] Ship `.github/workflows/deploy.yml` to replace manual CLI deploys
- [ ] Decide whether to rename staging folder `AISYMMETRIC NEW WEBSITE\` → `_staging\` (confusingly similar to `NEW AISymmetric Solutions Website\` which is the production repo)
- [ ] Consider blocking `/docs/*` from public serving (low priority — no secrets, but ISO posture)
- [ ] `/success` V2 ideas noted in commit `db39bcf` body: live case study drawer, industry filter chips, scroll-linked EKG, logo wall, ROI mini-calculator

---

*Format for future entries: date + short session title; Context, Accomplished, Key decisions, Lessons, Follow-ups. Keep each session under ~400 words.*
