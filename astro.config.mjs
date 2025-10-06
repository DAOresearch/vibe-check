import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	srcDir: "./docs",
	publicDir: "./docs/public",
	site: "https://daoresearch.github.io",
	base: process.env.NODE_ENV === "production" ? "/vibe-check" : "",
	trailingSlash: "always",
	integrations: [
		starlight({
			title: "Vibe Check",
			description: "Automation and Evaluation framework for Claude Code agents",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/DAOresearch/vibe-check",
				},
			],
			sidebar: [
				{
					label: "Getting Started",
					autogenerate: { directory: "getting-started" },
				},
				{
					label: "Guides",
					autogenerate: { directory: "guides" },
				},
				{
					label: "API Reference",
					collapsed: false,
					items: [
						{
							label: "Core",
							collapsed: false,
							items: [
								{ slug: "api/vibetest" },
								{ slug: "api/vibeworkflow" },
								{ slug: "api/runagent" },
								{ slug: "api/defineagent" },
								{ slug: "api/judge" },
							],
						},
						{
							label: "Utilities",
							collapsed: false,
							items: [
								{ slug: "api/prompt" },
								{ slug: "api/matchers" },
								{ slug: "api/types" },
							],
						},
					],
				},
				{
					label: "Examples",
					autogenerate: { directory: "examples" },
				},
				{
					label: "Recipes",
					autogenerate: { directory: "recipes" },
				},
				{
					label: "Explanation",
					autogenerate: { directory: "explanation" },
				},
				{
					label: "Claude Code Integration",
					autogenerate: { directory: "claude-code" },
				},
				{
					label: "Contributing",
					autogenerate: { directory: "contributing" },
				},
			],
			customCss: ["./docs/styles/custom.css"],
		}),
	],
});
