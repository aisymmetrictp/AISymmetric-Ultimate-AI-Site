# Infrastructure — aisymmetricsolutions.com

Operational reference for the live site and its DNS / email plumbing.
Last updated: 2026-04-21.

---

## Overview

| Layer | Provider | Notes |
|---|---|---|
| Domain registrar | **Squarespace Domains LLC** | Registered 2025-05-30, expires 2026-05-30 |
| DNS zone | **Netlify DNS** (NSONE-backed) | Zone ID `69b21cbe9a8ada0ab2313f3d`; nameservers `dns1-4.p03.nsone.net` |
| Web hosting | **Netlify** | Site name `aisymmetric-ultimate`, site ID `b21b3dc8-43f1-4a71-ae8a-b26b256155fc` |
| Site repo | **GitHub** `aisymmetrictp/AISymmetric-Ultimate-AI-Site` | Deploys `master` via Netlify git integration |
| Email (MX) | **Google Workspace** | `aspmx.l.google.com` + 4 alts |
| Transactional email | **SendGrid** | Added 2026-04-20 via Sender Authentication (see below) |

### Common confusion: is DNS at NS1 or Netlify?

**Netlify.** Netlify DNS is built on top of NSONE (formerly NS1) infrastructure, so the delegated nameservers have `nsone.net` in the hostname. That does **not** mean there is a separate NS1 account to log into — records are managed entirely through the Netlify dashboard (or its API). If you ever need to edit DNS, you do not need NS1 credentials. You need Netlify access.

---

## DNS record inventory (key records)

Apex (`aisymmetricsolutions.com`):

```
A      @                   75.2.60.5                         # Netlify apex LB
MX  1  @                   aspmx.l.google.com                # Google Workspace
MX  5  @                   alt1.aspmx.l.google.com
MX  5  @                   alt2.aspmx.l.google.com
MX 10  @                   alt3.aspmx.l.google.com
MX 10  @                   alt4.aspmx.l.google.com
TXT    @                   v=spf1 include:_spf.google.com ~all
TXT    @                   google-site-verification=pIG8vz...
TXT    @                   google-site-verification=vyJBjB...
TXT    _dmarc              v=DMARC1; p=none; rua=mailto:dmarc@aisymmetricsolutions.com; adkim=s; aspf=s; pct=100
TXT    google._domainkey   v=DKIM1; k=rsa; p=MIIBIj... (429 chars)
CAA    @                   0 issue "letsencrypt.org"
```

Subdomains in active use (non-exhaustive; zone has ~60 records total):

```
CNAME  www                 aisymmetric-ultimate.netlify.app   # main site alias
       nti                 driverwages-website.netlify.app    # NTI driver wages (currently A records to 18.208.88.157 + 98.84.224.111)
       clecoproposal       cleco-aisymmetric-proposal.netlify.app   # Cleco proposal (access-gated)
       westwindow          west-window-website.netlify.app    # West Window (NETLIFY record type)
CNAME  escapely            escapely-site.netlify.app
CNAME  webportfolio        aisymmetric-web-portfolio.netlify.app
CNAME  crm                 <vercel-dns>
CNAME  clerk.crm           frontend-api.clerk.services
CNAME  dashboards          quantum-health-poc1.netlify.app
CNAME  firmos              cname.vercel-dns.com                # Vercel — added 2026-04-21
CNAME  preop               acuvai-preop-navigator.netlify.app
A      api                 76.76.21.21                        # Vercel
A      mach96              76.76.21.21
A      marketos            76.76.21.21
A      psm                 76.76.21.21
A      tspdash             76.76.21.21
```

The full zone is visible via the Netlify dashboard (Domain → aisymmetricsolutions.com → DNS).

### Note on `nti.aisymmetricsolutions.com`

Points to `driverwages-website.netlify.app`. Currently uses **A records** (`18.208.88.157`, `98.84.224.111`) rather than a CNAME. Functional today (those are Netlify's LB IPs), but the Netlify-recommended pattern is a CNAME for auto-tracking of IP changes. Low priority — swap only if IP-pool drift becomes an issue.

---

## SendGrid Sender Authentication (added 2026-04-20)

Five CNAMEs added to authenticate mail sent from `@aisymmetricsolutions.com` via SendGrid. Pushed through the Netlify DNS API (zone `69b21cbe9a8ada0ab2313f3d`):

| Host | Target | TTL |
|---|---|---|
| `url3128` | `sendgrid.net` | 300 |
| `97609978` | `sendgrid.net` | 300 |
| `em5332` | `u97609978.wl229.sendgrid.net` | 300 |
| `s1._domainkey` | `s1.domainkey.u97609978.wl229.sendgrid.net` | 300 |
| `s2._domainkey` | `s2.domainkey.u97609978.wl229.sendgrid.net` | 300 |

Verified in SendGrid dashboard on 2026-04-20.

### DMARC alignment caveat

- DMARC is set to `adkim=s; aspf=s` (strict).
- DKIM will align strictly for SendGrid-sent mail (signer `d=aisymmetricsolutions.com` via the `s1`/`s2` selectors).
- SPF will **not** align strictly — SendGrid's Return-Path is under `em5332.aisymmetricsolutions.com`, which does not match the apex.
- DMARC still passes overall (DKIM alone satisfies it).
- With `p=none`, nothing is rejected regardless. Aggregate reports will show SPF fails; ignore unless the noise becomes actionable. If so, relax SPF alignment to `aspf=r`.
- Do **not** add `include:sendgrid.net` to the apex SPF — it will not improve strict alignment and adds needless lookup surface.

---

## Git identity

All AISymmetric-related repos commit under:

```
user.name  = Tyler Perleberg
user.email = tyler.perleberg@aisymmetricsolutions.com
```

Set both globally and per-repo on 2026-04-20. Previously, `AISymmetric-Ultimate-AI-Site` and `AISymmetric-Web-Portfolio` committed under `aisymmetrictp@users.noreply.github.com`; that has been corrected. Historic commit authorship is unchanged (only new commits reflect the new identity).

For GitHub to link new commits to the user's personal profile, `tyler.perleberg@aisymmetricsolutions.com` must be listed as a verified email at https://github.com/settings/emails.

---

## Related AISymmetric repos

| Repo | Domain / purpose | Status |
|---|---|---|
| `aisymmetrictp/AISymmetric-Ultimate-AI-Site` | **aisymmetricsolutions.com** (this repo) | Production |
| `aisymmetrictp/AISymmetric-Web-Portfolio` | `webportfolio.aisymmetricsolutions.com` (24 showcase industry sites) | Production |
| `aisymmetrictp/aisymmetric-digital` | Digital-agency spin-off site (52 showcase sites) | Production |
| `aisymmetrictp/AISymmetric-March-2026-Website` | Earlier Next.js version of the main site | Superseded |

---

## Operational runbook — managing DNS

### Add/change a record via Netlify API

Netlify CLI is configured with a personal access token under the Tyler Perleberg user. To create a DNS record:

```bash
TOKEN="<netlify token from ~/AppData/Roaming/netlify/Config/config.json>"
ZONE="69b21cbe9a8ada0ab2313f3d"
curl -sS -X POST "https://api.netlify.com/api/v1/dns_zones/$ZONE/dns_records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","hostname":"<host>.aisymmetricsolutions.com","value":"<target>","ttl":300}'
```

Use `hostname` as the **full FQDN** (`foo.aisymmetricsolutions.com`), not just the relative label.

Gotcha: `netlify api createDnsRecord` via the CLI's subcommand dispatcher does **not** accept `zone_id` inside `--data` — it treats it as a path variable and errors with "Missing required path variable 'zone_id'". Use the raw `curl` form above instead.

### List records

```bash
curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.netlify.com/api/v1/dns_zones/$ZONE/dns_records"
```

### Delete a record

```bash
curl -sS -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://api.netlify.com/api/v1/dns_zones/$ZONE/dns_records/<record_id>"
```

### Verify public resolution

```powershell
Resolve-DnsName -Type CNAME -Name foo.aisymmetricsolutions.com -Server 8.8.8.8
```

Records with `ttl=300` typically propagate globally within 1–5 minutes. If a record shows in Netlify's zone API with `errors: []` but is not yet served by the authoritative nameserver, wait ~1 minute and re-check; if still stuck, delete and recreate.

---

## Change log

| Date | Change | By |
|---|---|---|
| 2026-04-23 | Recorded `westwindow.aisymmetricsolutions.com` in subdomain inventory. A NETLIFY-type record (id `69ea7a650e763f0008cb5fe8`) → `west-window-website.netlify.app` already existed. Added a CNAME on top by mistake (id `69ea83a231fe5139e5129453`); deleted the duplicate. NETLIFY record retained as the single authoritative record. | Tyler Perleberg |
| 2026-04-21 | Verified DNS for `clecoproposal.aisymmetricsolutions.com` — already wired via a NETLIFY record to `cleco-aisymmetric-proposal.netlify.app` (Netlify DNS record id `69e83b3175afec0009c70fc6`). SSL provisioned. No action needed. Recorded in subdomain inventory. | Tyler Perleberg |
| 2026-04-21 | Added CNAME `firmos.aisymmetricsolutions.com` → `cname.vercel-dns.com` (TTL 3600) for a new Vercel-hosted project. Netlify DNS record id `69e78e7d6516a4076eeabdf7`. | Tyler Perleberg |
| 2026-04-21 | Refactor of `/success` page — light theme, real logo, cross-property links, fixed hero-visibility bug (removed `animation-fill-mode: both` which was locking hero at opacity:0). | Tyler Perleberg |
| 2026-04-21 | Discovered Netlify site has no git auto-deploy (`repo_url: null`). Drafted `.github/workflows/deploy.yml` to close this gap. Manual `netlify deploy --prod` still required until workflow is shipped. | Tyler Perleberg |
| 2026-04-21 | Added `/success` customer-wins microsite at `aisymmetricsolutions.com/success/`. | Tyler Perleberg |
| 2026-04-20 | Added 5 SendGrid Sender-Authentication CNAMEs (url3128, 97609978, em5332, s1._domainkey, s2._domainkey). Verified in SendGrid. | Tyler Perleberg |
| 2026-04-20 | Unified git identity across all AISymmetric repos to `Tyler Perleberg <tyler.perleberg@aisymmetricsolutions.com>`. | Tyler Perleberg |
| 2026-04-20 | Created this infrastructure doc. | Tyler Perleberg |
| 2026-04-15 | ISO 27001/27701 compliance: cookie consent, CSP headers, breach notification, CAA record. | — |

See also: [`docs/SESSION-NOTES.md`](./SESSION-NOTES.md) for chronological session-by-session narrative.
