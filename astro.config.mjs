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
					collapsed: false,
					items: [
						{
							label: "Testing",
							collapsed: false,
							items: [
								{ slug: "guides/testing/reactive-watchers" },
								{ slug: "guides/testing/cumulative-state" },
								{ slug: "guides/testing/custom-matchers" },
								{ slug: "guides/testing/matrix-testing" },
							],
						},
					],
				},
				{
					label: "API Reference",
					collapsed: false,
					items: [
						{
							label: "Core",
							collapsed: false,
							items: [
								{ slug: "api/core/vibetest" },
								{ slug: "api/core/vibeworkflow" },
								{ slug: "api/core/runagent" },
								{ slug: "api/core/defineagent" },
								{ slug: "api/core/judge" },
							],
						},
						{
							label: "Utilities",
							collapsed: false,
							items: [{ slug: "api/utilities/config" }],
						},
					],
				},
			],
			customCss: ["./docs/styles/custom.css"],
		}),
	],
});
