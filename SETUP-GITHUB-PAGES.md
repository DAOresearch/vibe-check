# GitHub Pages Setup Required

## Issue
The Deploy Documentation workflow is failing with:
```
Error: Failed to create deployment (status: 404)
Ensure GitHub Pages has been enabled
```

## Fix Required
A repository administrator needs to enable GitHub Pages:

1. Go to: https://github.com/DAOresearch/vibe-check/settings/pages
2. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
3. Save the settings

## Verification
After enabling Pages, the deployment workflow will succeed and the documentation will be available at:
```
https://daoresearch.github.io/vibe-check/
```

## Current Status
- ✅ Workflow is correctly configured
- ✅ Build step succeeds (documentation builds successfully)
- ❌ Deploy step fails (Pages not enabled)
- ✅ All SHA-pinned actions for security
- ✅ Proper permissions configured

## Related Files
- `.github/workflows/deploy-docs.yml` - Deployment workflow
- `astro.config.mjs` - Configured with correct base path `/vibe-check`
- OpenGraph images use absolute URLs for production
