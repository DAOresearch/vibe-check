#!/usr/bin/env bash
#
# Sitemap Verification Script
# Verifies sitemap generation and validates post-deployment
#

set -e

SITE_URL="https://daoresearch.github.io/vibe-check"
SITEMAP_URL="${SITE_URL}/sitemap-index.xml"

echo "🔍 Vibe Check Sitemap Verification"
echo "===================================="
echo ""

# Check if this is local verification or post-deployment
if [ "$1" == "--local" ]; then
  echo "📂 Local verification mode"
  echo ""

  if [ ! -f "dist/sitemap-index.xml" ]; then
    echo "❌ Error: sitemap-index.xml not found in dist/"
    echo "   Run 'bun run docs:build' first"
    exit 1
  fi

  if [ ! -f "dist/sitemap-0.xml" ]; then
    echo "❌ Error: sitemap-0.xml not found in dist/"
    exit 1
  fi

  echo "✅ Sitemap index file exists"
  echo "✅ Sitemap file exists"
  echo ""

  # Count URLs
  url_count=$(grep -o '<url>' dist/sitemap-0.xml | wc -l)
  echo "📊 Sitemap contains ${url_count} URLs"
  echo ""

  # Verify base URLs
  echo "🔗 Verifying URL structure..."
  if grep -q "${SITE_URL}/" dist/sitemap-0.xml; then
    echo "✅ Base URL correct: ${SITE_URL}"
  else
    echo "❌ Base URL incorrect"
    exit 1
  fi

  # Check for key pages
  echo ""
  echo "📄 Checking key pages..."

  key_pages=(
    "${SITE_URL}/"
    "${SITE_URL}/getting-started/"
    "${SITE_URL}/api/"
    "${SITE_URL}/guides/"
  )

  for page in "${key_pages[@]}"; do
    if grep -q "${page}" dist/sitemap-0.xml; then
      echo "  ✅ ${page}"
    else
      echo "  ❌ Missing: ${page}"
      exit 1
    fi
  done

  echo ""
  echo "✨ Local sitemap verification passed!"
  echo ""
  echo "Next steps:"
  echo "1. Deploy the site to GitHub Pages"
  echo "2. Run: ./scripts/verify-sitemap.sh --deployed"

else
  echo "🌐 Post-deployment verification mode"
  echo ""
  echo "Checking: ${SITEMAP_URL}"
  echo ""

  # Check if sitemap exists
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "${SITEMAP_URL}")

  if [ "${http_code}" == "200" ]; then
    echo "✅ Sitemap accessible (HTTP ${http_code})"
  else
    echo "❌ Sitemap not accessible (HTTP ${http_code})"
    exit 1
  fi

  # Fetch and validate
  sitemap_content=$(curl -s "${SITEMAP_URL}")

  if echo "${sitemap_content}" | grep -q "sitemap-0.xml"; then
    echo "✅ Sitemap index valid"
  else
    echo "❌ Sitemap index invalid"
    exit 1
  fi

  # Fetch actual sitemap
  actual_sitemap=$(curl -s "${SITE_URL}/sitemap-0.xml")
  url_count=$(echo "${actual_sitemap}" | grep -o '<url>' | wc -l)

  echo "✅ Found ${url_count} URLs in sitemap"
  echo ""

  # Check for key pages
  echo "📄 Verifying key pages..."

  key_pages=(
    "${SITE_URL}/"
    "${SITE_URL}/getting-started/"
    "${SITE_URL}/api/"
    "${SITE_URL}/guides/"
    "${SITE_URL}/examples/"
    "${SITE_URL}/explanation/"
  )

  for page in "${key_pages[@]}"; do
    if echo "${actual_sitemap}" | grep -q "${page}"; then
      echo "  ✅ ${page}"
    else
      echo "  ❌ Missing: ${page}"
      exit 1
    fi
  done

  echo ""
  echo "✨ Post-deployment sitemap verification passed!"
  echo ""
  echo "Optional: Run sitemap validator"
  echo "  npx sitemap-validator ${SITEMAP_URL}"
fi
