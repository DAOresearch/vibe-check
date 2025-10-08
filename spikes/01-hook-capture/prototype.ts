import { randomUUID } from "node:crypto";
import { once } from "node:events";
import {
	createWriteStream,
	promises as fsPromises,
	type WriteStream,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { format } from "node:util";

export type HookKind =
	| "RunStart"
	| "RunFinish"
	| "PreToolUse"
	| "PostToolUse"
	| "Log"
	| "Error";

export type HookEvent = {
	hook: HookKind;
	ts: number;
	runId: string;
	sessionId: string;
	data: Record<string, unknown>;
	toolName?: string;
};

export type HookCaptureOptions = {
	/**
	 * Directory to write temp files into. Defaults to the system tmp dir.
	 */
	directory?: string;
	/**
	 * Automatically delete the file when closing the session.
	 */
	cleanupOnClose?: boolean;
	/**
	 * Flush buffered events on this cadence to reduce tail latency.
	 */
	proactiveFlushIntervalMs?: number;
	/**
	 * Called when the capture file cannot be written to.
	 * Return true to keep the session running in memory, false to stop capturing.
	 */
	onWriteError?: (error: unknown) => boolean | undefined;
};

type QueuedWrite = {
	payload: string;
	resolve: () => void;
	reject: (error: unknown) => void;
};

const stdout = process.stdout;
const stderr = process.stderr;
const DEMO_TOOL_DELAY_MS = 10;
const DEMO_RUN_DURATION_MS = 42;
const DEMO_RESULT_COUNT = 5;
const DEMO_FLUSH_INTERVAL_MS = 25;
const FAILURE_ERROR_MESSAGE = "simulated disk write failure";
const FAILURE_TOOL_EXIT_CODE = 1;
const ERROR_EXIT_CODE = 1;
const STREAM_BUFFER_MULTIPLIER = 64;
const KIBIBYTE = 1024;
const STREAM_HIGH_WATER_MARK = STREAM_BUFFER_MULTIPLIER * KIBIBYTE; // 64 KiB buffer

function writeLine(stream: NodeJS.WriteStream, message: string): void {
	stream.write(`${message}\n`);
}

function log(message: string, ...args: unknown[]): void {
	writeLine(stdout, format(message, ...args));
}

function logError(message: string, ...args: unknown[]): void {
	writeLine(stderr, format(message, ...args));
}

/**
 * HookCaptureSession writes hook events to an NDJSON temp file without blocking the caller.
 *
 * Events are queued in memory and flushed to an append-only write stream. When the OS write
 * buffer is full, the session waits for the `drain` event in the background. Callers do not
 * need to await `capture()` unless they want backpressure propagation.
 */
export class HookCaptureSession {
	readonly filePath: string;

	readonly #stream: WriteStream;
	readonly #queue: QueuedWrite[] = [];
	#processing = false;
	#closed = false;
	#failed = false;
	readonly #flushTimer?: NodeJS.Timeout;
	readonly #options: HookCaptureOptions;

	private constructor(
		filePath: string,
		stream: WriteStream,
		options: HookCaptureOptions
	) {
		this.filePath = filePath;
		this.#stream = stream;
		this.#options = options;

		stream.on("error", (error) => {
			this.#failed = true;
			const shouldContinue = options.onWriteError?.(error) ?? false;
			// Fail queued writes.
			while (this.#queue.length > 0) {
				const queued = this.#queue.shift();
				queued?.reject(error);
			}
			if (!shouldContinue) {
				this.close().catch(() => {
					// Swallow errors on forced close; session is already in error state.
				});
			}
		});

		if (options.proactiveFlushIntervalMs) {
			this.#flushTimer = setInterval(() => {
				this.flush().catch(() => {
					// Periodic flush failures are handled by onWriteError during capture.
				});
			}, options.proactiveFlushIntervalMs).unref();
		}
	}

	static start(options: HookCaptureOptions = {}): HookCaptureSession {
		const directory = options.directory ?? tmpdir();
		const filePath = join(directory, `vibe-hooks-${randomUUID()}.ndjson`);
		const stream = createWriteStream(filePath, {
			flags: "a",
			encoding: "utf8",
			highWaterMark: STREAM_HIGH_WATER_MARK,
		});
		return new HookCaptureSession(filePath, stream, options);
	}

	/**
	 * Queue an event to be persisted. Returns a promise that resolves when the event
	 * is written, allowing callers to optionally await backpressure.
	 */
	capture(event: HookEvent): Promise<void> {
		if (this.#closed) {
			return Promise.reject(new Error("HookCaptureSession is already closed"));
		}
		if (this.#failed) {
			return Promise.reject(
				new Error("HookCaptureSession encountered a write failure")
			);
		}

		const enriched = {
			...event,
			ts: event.ts ?? Date.now(),
			data: event.data ?? {},
		};
		const payload = `${JSON.stringify(enriched)}\n`;

		return new Promise((resolve, reject) => {
			this.#queue.push({ payload, resolve, reject });
			this.#maybeProcess();
		});
	}

	/**
	 * Flushes any pending events immediately.
	 */
	async flush(): Promise<void> {
		if (this.#processing) {
			// Wait for the current flush to finish.
			await new Promise((resolve) => setImmediate(resolve));
		}
		await this.#processQueue();
	}

	async close(): Promise<void> {
		if (this.#closed) {
			return;
		}
		this.#closed = true;

		if (this.#flushTimer) {
			clearInterval(this.#flushTimer);
		}

		await this.flush();
		await new Promise<void>((resolve, reject) => {
			this.#stream.end((error: NodeJS.ErrnoException | null) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});

		if (this.#options.cleanupOnClose) {
			await fsPromises.rm(this.filePath, { force: true });
		}
	}

	#maybeProcess(): void {
		if (!this.#processing) {
			this.#processQueue().catch(() => {
				// Errors propagate through queued promise rejections.
			});
		}
	}

	/**
	 * Testing helper: trigger a synthetic write failure to exercise recovery paths.
	 */
	forceFailure(error: unknown = new Error(FAILURE_ERROR_MESSAGE)): void {
		this.#stream.destroy(
			error instanceof Error ? error : new Error(String(error))
		);
	}

	async #processQueue(): Promise<void> {
		if (this.#processing) {
			return;
		}
		this.#processing = true;

		try {
			while (this.#queue.length > 0) {
				const queued = this.#queue.shift();
				if (!queued) {
					continue;
				}
				const { payload, resolve, reject } = queued;

				if (!this.#stream.write(payload)) {
					try {
						await once(this.#stream, "drain");
					} catch (error) {
						reject(error);
						continue;
					}
				}
				resolve();
			}
		} finally {
			this.#processing = false;
		}
	}
}

/**
 * Utility used by the prototype to simulate hook callbacks fired by Claude agent runs.
 */
export class HookEmitter {
	private readonly capture: HookCaptureSession;

	constructor(capture: HookCaptureSession) {
		this.capture = capture;
	}

	async emit(event: Omit<HookEvent, "ts"> & { ts?: number }): Promise<void> {
		await this.capture.capture({
			ts: event.ts ?? Date.now(),
			hook: event.hook,
			runId: event.runId,
			sessionId: event.sessionId,
			data: event.data,
			toolName: event.toolName,
		});
	}
}

/**
 * Simple demo: simulate a query() execution that emits PreToolUse/PostToolUse hook pairs.
 */
export async function runDemo(): Promise<string> {
	const session = HookCaptureSession.start({
		proactiveFlushIntervalMs: DEMO_FLUSH_INTERVAL_MS,
	});
	const hooks = new HookEmitter(session);
	const runId = randomUUID();
	const sessionId = randomUUID();

	await hooks.emit({
		hook: "RunStart",
		runId,
		sessionId,
		data: { model: "claude-3-5-sonnet-latest" },
	});

	await hooks.emit({
		hook: "PreToolUse",
		runId,
		sessionId,
		toolName: "npm_search",
		data: { args: ["vitest"] },
	});

	await new Promise((resolve) => setTimeout(resolve, DEMO_TOOL_DELAY_MS));

	await hooks.emit({
		hook: "PostToolUse",
		runId,
		sessionId,
		toolName: "npm_search",
		data: { resultCount: DEMO_RESULT_COUNT },
	});

	await hooks.emit({
		hook: "RunFinish",
		runId,
		sessionId,
		data: { durationMs: DEMO_RUN_DURATION_MS },
	});

	await session.close();
	return session.filePath;
}

/**
 * Demo that forces the capture session into a failure mode by revoking permissions on the file.
 * The onWriteError callback allows the caller to decide whether to keep a degraded session alive.
 */
export async function runFailureDemo(): Promise<{
	filePath: string;
	error: unknown;
}> {
	let capturedError: unknown;
	const session = HookCaptureSession.start({
		onWriteError(error) {
			capturedError = error;
			// Returning false stops the session and prevents further writes.
			return false;
		},
	});
	const hooks = new HookEmitter(session);
	const runId = randomUUID();
	const sessionId = randomUUID();

	await hooks.emit({
		hook: "PreToolUse",
		runId,
		sessionId,
		toolName: "formatter",
		data: { args: ["--write", "src/index.ts"] },
	});

	// Simulate disk failure by making the file read-only and closing the descriptor.
	await session.flush();
	session.forceFailure(new Error(FAILURE_ERROR_MESSAGE));

	try {
		await hooks.emit({
			hook: "PostToolUse",
			runId,
			sessionId,
			toolName: "formatter",
			data: { exitCode: FAILURE_TOOL_EXIT_CODE },
		});
	} catch {
		// Ignore individual write failures in the demo.
	}

	await session.close().catch(() => {
		// Expected to fail on close when the file permission is read-only.
	});
	return { filePath: session.filePath, error: capturedError };
}

if (import.meta.main) {
	const mode = process.argv[2];
	if (mode === "failure") {
		runFailureDemo()
			.then(({ filePath, error }) => {
				log("Failure demo complete.");
				log("File path: %s", filePath);
				log("Captured error: %o", error);
			})
			.catch((error) => {
				logError("Failure demo errored %o", error);
				process.exitCode = ERROR_EXIT_CODE;
			});
	} else {
		runDemo()
			.then((filePath) => {
				log("Demo run complete. Hook payloads written to: %s", filePath);
			})
			.catch((error) => {
				logError("Demo run errored %o", error);
				process.exitCode = ERROR_EXIT_CODE;
			});
	}
}
