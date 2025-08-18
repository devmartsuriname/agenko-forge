# Lighthouse Runbook (1-pager)
**Purpose:** Consistent, repeatable performance measurements for Devmart.

## Prep
- Use a **production build** locally or a stable staging URL.
- Close extensions, other tabs, VPNs; clear browser cache.
- Window size ≈ **1366×768** for desktop runs.
- Warm the server: open each page once before measuring.

## Pages to test
`/`, `/services`, `/portfolio`, `/blog`, `/pricing`, `/contact`.

## Desktop (target ≥ 90)
1. Open Chrome → DevTools → Lighthouse → **Mode: Navigation** → **Device: Desktop**.  
2. Categories: **Performance, Accessibility, Best Practices, SEO**.  
3. Run **3 times**, keep the **median**.  
4. Save each report (HTML or JSON) into `docs/perf/`.

## Mobile (target ≥ 80)
1. Same steps, **Device: Mobile**.  
2. Network throttling: **Default (Lighthouse)**; CPU throttling: **Default**.  
3. Run **3 times per page**, keep the **median**.  
4. Save reports to `docs/perf/`.

## Automated (optional)
If scripts exist (Phase 5C added them), you can run:
- `npm run perf:home:mobile`  
- `npm run perf:home:desktop`  
…and replicate for `/services`, `/portfolio`, `/blog`, `/pricing`, `/contact`.  
> Do not add or change scripts in this task.

## What to record in `docs/perf/summary.md`
- A table with **Desktop/Mobile scores** per page.
- Key metrics: **LCP**, **CLS**, **TBT**.
- Notes: outstanding issues & regressions vs. previous run.

## Quick fix playbook
- **High LCP on /**: ensure **dynamic hero preload** is active; compress hero image; set correct `sizes`; avoid render-blocking JS.
- **CLS > 0.05**: enforce aspect-ratio boxes for hero/carousel/media; avoid layout-affecting animations (use transform/opacity).
- **TBT high**: code-split heavy routes; remove unused JS; defer non-critical scripts; tighten 3rd-party usage.

## Acceptance
- Reports saved for all pages (Desktop & Mobile).
- `summary.md` updated with a scores table and brief next steps.
- No unexpected code or config changes made during documentation updates.

> Tip: Keep all historic JSON reports in `docs/perf/` to spot trends and prevent regressions.