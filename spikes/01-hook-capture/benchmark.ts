import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { format } from "node:util";
import { HookCaptureSession, type HookEvent } from "./prototype";

const ITERATIONS = Number.parseInt(
	process.env.HOOK_BENCH_ITERATIONS ?? "5000",
	10
);
const ASSUMED_AGENT_RUNTIME_MS = Number.parseInt(
	process.env.AGENT_RUNTIME_MS ?? "5000",
	10
);
const ERROR_EXIT_CODE = 1;
const TOOLS_PER_RUN = 5;
const TOOLS_PER_SESSION = 10;
const TOOL_VARIANT_STRIDE = 2;
const PERCENT_MULTIPLIER = 100;
const PRECISION_TWO = 2;
const PRECISION_FOUR = 4;

function createMockEvent(toolIndex: number): HookEvent {
	const runId = `run-${Math.floor(toolIndex / TOOLS_PER_RUN)}`;
	const sessionId = `session-${Math.floor(toolIndex / TOOLS_PER_SESSION)}`;
	const toolName =
		toolIndex % TOOL_VARIANT_STRIDE === 0 ? "npm_search" : "apply_patch";
	return {
		hook: toolIndex % TOOL_VARIANT_STRIDE === 0 ? "PreToolUse" : "PostToolUse",
		ts: Date.now(),
		runId,
		sessionId,
		toolName,
		data: {
			requestId: randomUUID(),
			payload: {
				index: toolIndex,
				args: ["--flag", `${toolIndex}`],
			},
		},
	};
}

function measureBaseline(events: HookEvent[]): number {
	const start = performance.now();
	for (const event of events) {
		JSON.stringify(event);
	}
	return performance.now() - start;
}

async function measureCapture(
	events: HookEvent[]
): Promise<{ duration: number; filePath: string }> {
	const session = HookCaptureSession.start({ cleanupOnClose: true });
	const start = performance.now();
	const writes = events.map((event) => session.capture(event));
	await Promise.allSettled(writes);
	await session.close();
	return { duration: performance.now() - start, filePath: session.filePath };
}

async function main(): Promise<void> {
	const events = new Array(ITERATIONS)
		.fill(null)
		.map((_, index) => createMockEvent(index));
	const baselineMs = measureBaseline(events);
	const { duration: captureMs, filePath } = await measureCapture(events);
	const overhead = ((captureMs - baselineMs) / baselineMs) * PERCENT_MULTIPLIER;
	const perEventMs = captureMs / ITERATIONS;
	const estimatedRelativeOverhead =
		(captureMs / ASSUMED_AGENT_RUNTIME_MS) * PERCENT_MULTIPLIER;

	const stdout = process.stdout;
	const writeLine = (stream: NodeJS.WriteStream, message: string): void => {
		stream.write(`${message}\n`);
	};

	const log = (message: string, ...args: unknown[]): void => {
		writeLine(stdout, format(message, ...args));
	};

	log("Hook Capture Benchmark");
	log("Iterations: %d", ITERATIONS);
	log("Baseline serialization (ms): %s", baselineMs.toFixed(PRECISION_TWO));
	log("Capture to temp file (ms): %s", captureMs.toFixed(PRECISION_TWO));
	log("Relative overhead (%%): %s", overhead.toFixed(PRECISION_TWO));
	log("Per-event cost (ms): %s", perEventMs.toFixed(PRECISION_FOUR));
	log(
		"Estimated overhead vs %dms agent runtime (%%): %s",
		ASSUMED_AGENT_RUNTIME_MS,
		estimatedRelativeOverhead.toFixed(PRECISION_TWO)
	);
	log("Temp file (auto-cleaned): %s", filePath);
}

if (import.meta.main) {
	main().catch((error) => {
		const stderr = process.stderr;
		stderr.write(`${format("Benchmark failed %o", error)}\n`);
		process.exitCode = ERROR_EXIT_CODE;
	});
}
