import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { ion } from "starlight-ion-theme";

// https://astro.build/config
export default defineConfig({
	srcDir: "./docs",
	publicDir: "./docs/public",
	site: "https://daoresearch.github.io",
	base: import.meta.env.PROD ? "/vibe-check" : "/",
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
					autogenerate: { directory: "api" },
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
