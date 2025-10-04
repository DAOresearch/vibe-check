# Vibe Check Documentation Site

This documentation site is built with [Astro Starlight](https://starlight.astro.build/) and the [Ion theme](https://louisescher.github.io/starlight-ion-theme/).

## 🚀 Development

Start the development server with hot reload:

```bash
bun run docs:dev
```

The site will be available at `http://localhost:4321`

## 🏗️ Building

Build the static site:

```bash
bun run docs:build
```

Preview the built site:

```bash
bun run docs:preview
```

## 📁 Structure

```
docs/content/docs/
├── index.mdx                 # Home page (splash template)
├── getting-started/          # Getting started guides
│   ├── introduction.md
│   ├── installation.md
│   ├── quick-start.md
│   ├── first-automation.md
│   └── first-evaluation.md
├── guides/                   # How-to guides
├── api/                      # API reference
├── examples/                 # Code examples
├── recipes/                  # Copy-paste patterns
├── claude-code/              # Claude Code integration
└── contributing/             # Contributing guides
```

## 🎨 Customization

### Theme Configuration

Edit `astro.config.mjs` to customize:
- Site metadata
- Sidebar navigation
- Social links
- Ion theme settings

### Custom Styles

Edit `src/styles/custom.css` to customize:
- Brand colors
- Typography
- Component styles

## 🚢 Deployment

### GitHub Actions Setup

A GitHub Actions workflow example is provided in `deploy-docs.yml.example`. To enable auto-deployment:

1. Move the example workflow to the workflows directory:
   ```bash
   mv deploy-docs.yml.example .github/workflows/deploy-docs.yml
   ```

2. Commit and push the workflow file

3. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

The site will automatically deploy when:
- Changes are pushed to `main` branch
- Files in `docs/`, `astro.config.mjs`, or `package.json` are modified

Manual deployment trigger:
- Go to Actions → Deploy Documentation → Run workflow

The site will be available at: `https://daoresearch.github.io/vibe-check/`

## 📝 Writing Documentation

### Markdown Files

All documentation uses Markdown with frontmatter:

```markdown
---
title: Page Title
description: Page description for SEO
---

# Page Title

Your content here...
```

### MDX Files

For interactive components, use `.mdx`:

```mdx
---
title: Page Title
---

import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Example">
    Card content
  </Card>
</CardGrid>
```

### Available Components

Starlight provides built-in components:
- `Card` / `CardGrid` - Content cards
- `Tabs` / `TabItem` - Tabbed content
- `Code` - Syntax-highlighted code
- `Aside` - Callouts and notes
- And more...

See: https://starlight.astro.build/components/using-components/

## 📦 Dependencies

### Sharp (Image Optimization)

`sharp@^0.34.4` (~8MB native binary) is used by Astro for:
- Optimizing images in documentation
- Converting images to modern formats (WebP, AVIF)
- Generating responsive image sets

**Note:** Sharp is platform-specific. The correct binary is downloaded during `bun install` based on your OS/architecture (Linux, macOS, Windows).

## 🔍 Search

Search is automatically enabled using [Pagefind](https://pagefind.app/) - no configuration needed!

## 🛠️ Troubleshooting

### Build fails with module errors

Run a clean install:

```bash
rm -rf node_modules bun.lock
bun install
```

### Images not loading

Ensure Sharp is installed:

```bash
bun add -D sharp
```

### Hot reload not working

Restart the dev server:

```bash
# Stop the server (Ctrl+C)
bun run docs:dev
```
