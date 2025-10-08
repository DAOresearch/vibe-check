import { promises as fsPromises } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { recordQuery } from "../recorder";
import type { QueryRequest } from "../types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures");
const JSON_INDENT = 2;
const ERROR_EXIT_CODE = 1;

const request: QueryRequest = {
	prompt:
		"Summarize the benefits of NDJSON for streaming Claude agent transcripts.",
	model: "claude-3-5-sonnet-latest",
	tools: [
		{
			name: "documentation_search",
			description: "Search project documentation",
		},
	],
	metadata: { spike: "sdk-integration" },
};

async function main(): Promise<void> {
	const jsonPath = join(fixturesDir, "sample-recording.json");
	const ndjsonPath = join(fixturesDir, "sample-recording.ndjson");

	const jsonSummary = await recordQuery(request, {
		format: "json",
		outputPath: jsonPath,
		metadata: { format: "json", scenario: "basic" },
	});
	const ndjsonSummary = await recordQuery(request, {
		format: "ndjson",
		outputPath: ndjsonPath,
		metadata: { format: "ndjson", scenario: "basic" },
	});

	const [jsonStat, ndjsonStat] = await Promise.all([
		fsPromises.stat(jsonPath),
		fsPromises.stat(ndjsonPath),
	]);

	const stdout = process.stdout;

	const writeLine = (stream: NodeJS.WriteStream, message: string): void => {
		stream.write(`${message}\n`);
	};

	writeLine(
		stdout,
		`JSON recording summary: ${JSON.stringify(jsonSummary, null, JSON_INDENT)}`
	);
	writeLine(
		stdout,
		`NDJSON recording summary: ${JSON.stringify(
			ndjsonSummary,
			null,
			JSON_INDENT
		)}`
	);
	writeLine(stdout, `JSON file size: ${jsonStat.size} bytes`);
	writeLine(stdout, `NDJSON file size: ${ndjsonStat.size} bytes`);
}

if (import.meta.main) {
	main().catch((error) => {
		process.stderr.write(
			`${JSON.stringify(
				{ message: "Recording example failed", error },
				null,
				JSON_INDENT
			)}\n`
		);
		process.exitCode = ERROR_EXIT_CODE;
	});
}
