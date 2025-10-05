# Sitemap Generation

This document describes the sitemap implementation for the Vibe Check documentation site.

## Overview

The documentation site uses Astro's official `@astrojs/sitemap` integration to automatically generate a sitemap for all documentation pages.

## Configuration

The sitemap is configured in `astro.config.mjs`:

```javascript
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://daoresearch.github.io",
  base: "/vibe-check",
  integrations: [
    sitemap(),
    // ... other integrations
  ],
});
```

## Generated Files

The build process generates two sitemap files in the `dist/` directory:

- `sitemap-index.xml` - Main sitemap index file
- `sitemap-0.xml` - Contains all page URLs

These files are automatically included when the site is deployed to GitHub Pages.

## Verification

### Local Verification

After building the documentation, verify the sitemap locally:

```bash
bun run docs:build
./scripts/verify-sitemap.sh --local
```

This checks:
- ✅ Sitemap files exist
- ✅ URL count matches expected pages
- ✅ Base URL is correct (`/vibe-check`)
- ✅ Key pages are included

### Post-Deployment Verification

After deploying to GitHub Pages, verify the live sitemap:

```bash
./scripts/verify-sitemap.sh --deployed
```

Or manually check:

```bash
# Check sitemap exists
curl https://daoresearch.github.io/vibe-check/sitemap-index.xml

# Validate with external tool
npx sitemap-validator https://daoresearch.github.io/vibe-check/sitemap-index.xml
```

## Expected Content

The sitemap should include approximately 39 pages:

### Core Pages
- Homepage (`/`)
- About Documentation

### Getting Started (5 pages)
- Index
- Introduction
- Installation
- Quick Start
- First Automation
- First Evaluation

### API Reference (11 pages)
- Index
- vibeTest
- vibeWorkflow
- defineAgent
- runAgent
- prompt
- judge
- matchers
- types

### Guides (9 pages)
- Index
- Agents (index, configuration)
- Automation (index, pipelines, orchestration)
- Evaluation (index, benchmarking, matrix-testing)

### Examples (2 pages)
- Index
- MDX Demo

### Explanation (8 pages)
- Index
- Architecture
- Core Concepts
- Decisions (index, why-vitest, hook-capture, storage-strategy, dual-api)

### Other Sections
- Claude Code Integration
- Contributing
- Recipes

**Note:** The 404 page is intentionally excluded from the sitemap.

## URL Structure

All URLs use the correct base path:

```
https://daoresearch.github.io/vibe-check/[page-path]/
```

Trailing slashes are enforced via the `trailingSlash: "always"` configuration.

## Troubleshooting

### "No pages found" Warning

If you see this warning during build:

```
[@astrojs/sitemap] No pages found!
```

**Causes:**
- Sitemap plugin not installed
- Sitemap running before pages are generated
- `site` URL not configured

**Solution:**
Ensure `@astrojs/sitemap` is listed in `devDependencies` and properly configured in `astro.config.mjs`.

### Missing Pages in Sitemap

If pages are missing from the sitemap:

1. Verify the page exists in `docs/content/docs/`
2. Check that the page is accessible when building locally
3. Ensure the page isn't excluded via `robots.txt` or frontmatter

### Incorrect URLs

If URLs don't include the base path:

1. Verify `base: "/vibe-check"` in `astro.config.mjs`
2. Check `site` is set to the root GitHub Pages URL
3. Rebuild the site: `bun run docs:build`

## Related

- Issue #12: Verify sitemap generation post-deployment
- Issue #11: Documentation site enhancements (where sitemap warning was first observed)
- [Astro Sitemap Docs](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
