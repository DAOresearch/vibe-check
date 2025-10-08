import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRecording, replayRecording } from "../replayer";
import type { SDKMessage } from "../types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "..", "fixtures");
const JSON_INDENT = 2;
const ERROR_EXIT_CODE = 1;

async function collectMessages(path: string): Promise<SDKMessage[]> {
	const frames: SDKMessage[] = [];
	for await (const message of replayRecording(path)) {
		frames.push(message);
	}
	return frames;
}

async function main(): Promise<void> {
	const jsonPath = join(fixturesDir, "sample-recording.json");
	const ndjsonPath = join(fixturesDir, "sample-recording.ndjson");

	const [jsonMessages, ndjsonMessages] = await Promise.all([
		collectMessages(jsonPath),
		collectMessages(ndjsonPath),
	]);

	if (jsonMessages.length !== ndjsonMessages.length) {
		throw new Error(
			"Message count mismatch between JSON and NDJSON recordings"
		);
	}

	const jsonTypes = jsonMessages.map((message) => message.type);
	const ndjsonTypes = ndjsonMessages.map((message) => message.type);

	jsonTypes.forEach((type, index) => {
		if (type !== ndjsonTypes[index]) {
			throw new Error(`Message type mismatch at index ${index}`);
		}
	});

	const jsonPayload = await loadRecording(jsonPath);
	const ndjsonPayload = await loadRecording(ndjsonPath);

	const stdout = process.stdout;
	const writeLine = (stream: NodeJS.WriteStream, message: string): void => {
		stream.write(`${message}\n`);
	};

	writeLine(stdout, "Deterministic replay verified.");
	writeLine(
		stdout,
		`JSON metadata: ${JSON.stringify(
			{
				sdkVersion: jsonPayload.sdkVersion,
				messageCount: jsonPayload.messages.length,
			},
			null,
			JSON_INDENT
		)}`
	);
	writeLine(
		stdout,
		`NDJSON metadata: ${JSON.stringify(
			{
				sdkVersion: ndjsonPayload.sdkVersion,
				messageCount: ndjsonPayload.messages.length,
			},
			null,
			JSON_INDENT
		)}`
	);
}

if (import.meta.main) {
	main().catch((error) => {
		process.stderr.write(
			`${JSON.stringify(
				{ message: "Replay example failed", error },
				null,
				JSON_INDENT
			)}\n`
		);
		process.exitCode = ERROR_EXIT_CODE;
	});
}
