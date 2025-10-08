import { performance } from "node:perf_hooks";
import { format } from "node:util";
import { correlateToolCalls, type ToolHookEvent } from "./algorithm";

const TOOL_COUNT = Number.parseInt(
	process.env.CORRELATION_TOOL_COUNT ?? "2000",
	10
);
const RUN_STRIDE = 50;
const SESSION_STRIDE = 25;
const TIMESTAMP_STEP_MS = 5;
const POST_DELAY_MS = 3;
const SHUFFLE_STRIDE = 7;
const TOOL_VARIANT_STRIDE = 2;
const SEQUENCE_PAIR_STEP = 2;
const SEQUENCE_OFFSET = 1;
const MICROSECONDS_PER_MILLISECOND = 1000;
const DURATION_PRECISION = 3;
const PERCENT_PRECISION = 2;
const ERROR_EXIT_CODE = 1;

function createSyntheticEvents(): ToolHookEvent[] {
	const events: ToolHookEvent[] = [];
	for (let index = 0; index < TOOL_COUNT; index += 1) {
		const runId = `run-${Math.floor(index / RUN_STRIDE)}`;
		const sessionId = `session-${Math.floor(index / SESSION_STRIDE)}`;
		const toolName =
			index % TOOL_VARIANT_STRIDE === 0 ? "terminal_run" : "file_write";
		const tsBase = Date.now() + index * TIMESTAMP_STEP_MS;
		events.push({
			hook: "PreToolUse",
			runId,
			sessionId,
			toolName,
			toolInvocationId: `call-${index}`,
			ts: tsBase,
			sequence: index * SEQUENCE_PAIR_STEP,
			data: { toolInput: { index, toolName } },
		});
		events.push({
			hook: "PostToolUse",
			runId,
			sessionId,
			toolName,
			toolInvocationId: `call-${index}`,
			ts: tsBase + POST_DELAY_MS,
			sequence: index * SEQUENCE_PAIR_STEP + SEQUENCE_OFFSET,
			data: { toolOutput: { ok: true, index } },
		});
	}
	// Shuffle a subset to simulate out-of-order delivery.
	for (let i = 0; i < events.length; i += SHUFFLE_STRIDE) {
		const nextIndex = i + 1;
		const current = events[i];
		const next = events[nextIndex];
		if (!(current && next)) {
			continue;
		}
		events[i] = next;
		events[nextIndex] = current;
	}
	return events;
}

function main(): void {
	const events = createSyntheticEvents();
	const start = performance.now();
	const results = correlateToolCalls(events);
	const durationMs = performance.now() - start;

	if (results.length !== TOOL_COUNT) {
		throw new Error("Unexpected correlated tool call count");
	}

	const stdout = process.stdout;
	const writeLine = (stream: NodeJS.WriteStream, message: string): void => {
		stream.write(`${message}\n`);
	};

	writeLine(stdout, "Correlation Benchmark");
	writeLine(stdout, `Tool invocations: ${TOOL_COUNT}`);
	writeLine(stdout, `Total events: ${events.length}`);
	writeLine(
		stdout,
		`Correlation time (ms): ${durationMs.toFixed(DURATION_PRECISION)}`
	);
	writeLine(
		stdout,
		`Average per tool (µs): ${(
			(durationMs * MICROSECONDS_PER_MILLISECOND) / TOOL_COUNT
		).toFixed(PERCENT_PRECISION)}`
	);
	writeLine(stdout, `First result status: ${results[0]?.status ?? "unknown"}`);
}

if (import.meta.main) {
	try {
		main();
	} catch (error) {
		process.stderr.write(
			`${format("Correlation benchmark failed %o", error)}\n`
		);
		process.exitCode = ERROR_EXIT_CODE;
	}
}
