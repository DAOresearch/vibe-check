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
					collapsed: false,
					items: [
						{ slug: "getting-started" },
						{ slug: "getting-started/installation" },
						{ slug: "getting-started/quickstart" },
						{ slug: "getting-started/first-test" },
						{ slug: "getting-started/first-automation" },
						{ slug: "getting-started/first-evaluation" },
					],
				},
				{
					label: "Guides",
					collapsed: false,
					items: [
						{ slug: "guides" },
						{
							label: "Testing",
							collapsed: false,
							items: [
								{ slug: "guides/testing" },
								{ slug: "guides/testing/reactive-watchers" },
								{ slug: "guides/testing/cumulative-state" },
								{ slug: "guides/testing/custom-matchers" },
								{ slug: "guides/testing/matrix-testing" },
							],
						},
						{
							label: "Automation",
							collapsed: false,
							items: [
								{ slug: "guides/automation" },
								{ slug: "guides/automation/building-workflows" },
								{ slug: "guides/automation/loop-patterns" },
								{ slug: "guides/automation/error-handling" },
							],
						},
						{
							label: "Evaluation",
							collapsed: false,
							items: [
								{ slug: "guides/evaluation" },
								{ slug: "guides/evaluation/using-judge" },
								{ slug: "guides/evaluation/rubrics" },
								{ slug: "guides/evaluation/benchmarking" },
							],
						},
						{
							label: "Advanced",
							collapsed: false,
							items: [
								{ slug: "guides/advanced" },
								{ slug: "guides/advanced/mcp-servers" },
								{ slug: "guides/advanced/cost-optimization" },
								{ slug: "guides/advanced/bundle-cleanup" },
								{ slug: "guides/advanced/multi-modal-prompts" },
							],
						},
					],
				},
				{
					label: "API Reference",
					collapsed: false,
					items: [
						{ slug: "api" },
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
							label: "Types",
							collapsed: false,
							items: [
								{ slug: "api/types" },
								{ slug: "api/types/test-context" },
								{ slug: "api/types/workflow-context" },
								{ slug: "api/types/agent-execution" },
								{ slug: "api/types/run-result" },
								{ slug: "api/types/partial-result" },
								{ slug: "api/types/file-change" },
								{ slug: "api/types/tool-call" },
								{ slug: "api/types/rubric" },
								{ slug: "api/types/configuration" },
								{ slug: "api/types/matchers" },
							],
						},
						{
							label: "Utilities",
							collapsed: false,
							items: [
								{ slug: "api/utilities" },
								{ slug: "api/utilities/config" },
							],
						},
					],
				},
				{
					label: "Explanation",
					collapsed: false,
					items: [
						{ slug: "explanation" },
						{
							label: "Concepts",
							collapsed: false,
							items: [
								{ slug: "explanation/concepts/dual-api" },
								{ slug: "explanation/concepts/auto-capture" },
								{ slug: "explanation/concepts/lazy-loading" },
							],
						},
						{
							label: "Architecture",
							collapsed: false,
							items: [
								{ slug: "explanation/architecture/overview" },
								{ slug: "explanation/architecture/context-manager" },
								{ slug: "explanation/architecture/run-bundle" },
								{ slug: "explanation/architecture/hook-integration" },
							],
						},
						{
							label: "Design",
							collapsed: false,
							items: [{ slug: "explanation/design/decisions" }],
						},
					],
				},
			],
			customCss: ["./docs/styles/custom.css"],
		}),
	],
});
