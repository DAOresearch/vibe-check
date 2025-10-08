import { promises as fsPromises } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { correlateToolCalls, type ToolHookEvent } from "./algorithm";

type TestCaseDefinition = {
	description: string;
	events: ToolHookEvent[];
	expectedStatuses: string[];
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesPath = join(__dirname, "test-cases.json");
const ERROR_EXIT_CODE = 1;
const JSON_INDENT = 2;

async function main(): Promise<void> {
	const raw = await fsPromises.readFile(casesPath, "utf8");
	const definitions = JSON.parse(raw) as Record<string, TestCaseDefinition>;
	let failures = 0;

	for (const [name, testCase] of Object.entries(definitions)) {
		const results = correlateToolCalls(testCase.events);
		const statuses = results.map((result) => result.status);
		const pass =
			statuses.length === testCase.expectedStatuses.length &&
			statuses.every(
				(status, index) => status === testCase.expectedStatuses[index]
			);

		if (pass) {
			process.stdout.write(`✅ ${name}: ${testCase.description}\n`);
			continue;
		}
		failures += 1;
		const failureMessage = [
			`❌ ${name}: ${testCase.description}`,
			`  Expected: ${JSON.stringify(testCase.expectedStatuses)}`,
			`  Received: ${JSON.stringify(statuses)}`,
		].join("\n");
		process.stderr.write(`${failureMessage}\n`);
	}

	if (failures > 0) {
		throw new Error(`${failures} test case(s) failed`);
	}
}

if (import.meta.main) {
	main().catch((error) => {
		process.stderr.write(
			`${JSON.stringify(
				{ message: "Correlation test harness failed", error },
				null,
				JSON_INDENT
			)}\n`
		);
		process.exitCode = ERROR_EXIT_CODE;
	});
}
