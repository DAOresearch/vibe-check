#!/usr/bin/env node
/**
 * Fix Starlight MDX links to include base path
 *
 * Starlight doesn't automatically add the base path to MDX content links,
 * so we need to patch the HTML files after build.
 *
 * See: https://github.com/withastro/starlight/discussions/1407
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const basePath = "/vibe-check";

// Find all HTML files
const htmlFiles = await glob(`${distDir}/**/*.html`);

let totalFixed = 0;

for (const file of htmlFiles) {
	const content = readFileSync(file, "utf-8");
	let modified = false;

	// Fix internal links that don't have the base path
	// Pattern: href="/something" where something is NOT "vibe-check" or starts with http
	const fixedContent = content.replace(
		/href="(\/(?!vibe-check|http)[^"]*)"/g,
		(match, path) => {
			// Skip already-fixed paths, external links, and anchor links
			if (
				path.startsWith("/vibe-check") ||
				path.startsWith("http") ||
				path.startsWith("#")
			) {
				return match;
			}
			modified = true;
			totalFixed++;
			return `href="${basePath}${path}"`;
		}
	);

	if (modified) {
		writeFileSync(file, fixedContent, "utf-8");
		console.log(`✓ Fixed ${file.replace(distDir, "")}`);
	}
}

console.log(
	`\n✅ Fixed ${totalFixed} links across ${htmlFiles.length} HTML files`
);
