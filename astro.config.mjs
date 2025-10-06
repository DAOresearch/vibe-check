import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { ion } from "starlight-ion-theme";

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
					items: [
						{
							label: "Core",
							items: [
								{ label: "vibeTest", link: "/api/core/vibetest/" },
								{ label: "vibeWorkflow", link: "/api/core/vibeworkflow/" },
								{ label: "runAgent", link: "/api/core/runagent/" },
								{ label: "defineAgent", link: "/api/core/defineagent/" },
								{ label: "judge", link: "/api/core/judge/" },
							],
						},
						{
							label: "Utilities",
							items: [
								{ label: "defineVibeConfig", link: "/api/utilities/config/" },
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
			plugins: [ion()],
			customCss: ["./docs/styles/custom.css"],
		}),
	],
});
