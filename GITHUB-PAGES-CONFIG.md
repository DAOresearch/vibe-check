# GitHub Pages Configuration

## Current Setup

The documentation site is configured to deploy to:
```
https://daoresearch.github.io/vibe-check/
```

This is the **correct** scoped configuration for this project.

## Configuration Details

**In `astro.config.mjs`:**
```javascript
site: "https://daoresearch.github.io",
base: import.meta.env.PROD ? "/vibe-check" : "/",
```

- `site`: The base domain for your GitHub Pages organization
- `base`: The subpath for this specific project (`/vibe-check`)

## Why This Is Correct

GitHub Pages for organization repositories works as follows:

1. **Organization site**: `https://daoresearch.github.io`
   - This would be from a repository named `daoresearch.github.io`
   - Serves content at the root path

2. **Project sites**: `https://daoresearch.github.io/<repository-name>/`
   - This is what we have: `https://daoresearch.github.io/vibe-check/`
   - Serves content at a subpath

## How It Works

When you enable GitHub Pages for the `vibe-check` repository:

- The site will be available at `https://daoresearch.github.io/vibe-check/`
- All internal links are automatically prefixed with `/vibe-check/` in production
- In development (localhost), the base path is `/` for easier local testing

## OpenGraph Images

We've already configured OpenGraph images with absolute URLs:
```
https://daoresearch.github.io/vibe-check/og-images/homepage.png
```

These will work correctly once Pages is enabled.

## Enabling GitHub Pages

To activate deployment:

1. Go to: https://github.com/DAOresearch/vibe-check/settings/pages
2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
3. Save settings

After enabling, the next push to `main` will deploy the site.

## Verification

Once deployed, verify these URLs work:
- Homepage: https://daoresearch.github.io/vibe-check/
- Getting Started: https://daoresearch.github.io/vibe-check/getting-started/introduction/
- API Reference: https://daoresearch.github.io/vibe-check/api/

## Configuration is Already Correct

✅ No changes needed to `astro.config.mjs`  
✅ No changes needed to `deploy-docs.yml`  
✅ OpenGraph images already use absolute URLs  
✅ All internal links will work automatically with the base path

The configuration is **scoped correctly to this project**.
