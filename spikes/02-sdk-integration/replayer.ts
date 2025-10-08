import { createReadStream, promises as fsPromises } from "node:fs";
import { performance } from "node:perf_hooks";
import { createInterface } from "node:readline";
import type { RecordingFormat } from "./recorder";
import type { SDKMessage } from "./types";

type RecordedFrame = {
	index: number;
	offsetMs: number;
	message: SDKMessage;
};

export type RecordingPayload = {
	format: RecordingFormat;
	recordedAt: string;
	sdkVersion: string;
	request: unknown;
	metadata?: Record<string, unknown>;
	messages: RecordedFrame[];
};

export type ReplayOptions = {
	preserveTiming?: boolean;
	speedMultiplier?: number;
};

const DEFAULT_SPEED_MULTIPLIER = 1;

async function loadNdjson(path: string): Promise<RecordingPayload> {
	const stream = createReadStream(path, { encoding: "utf8" });
	const reader = createInterface({
		input: stream,
		crlfDelay: Number.POSITIVE_INFINITY,
	});
	const frames: RecordedFrame[] = [];
	let metadata: Omit<RecordingPayload, "format" | "messages"> | null = null;

	for await (const line of reader) {
		if (!line.trim()) {
			continue;
		}
		const payload = JSON.parse(line) as
			| ({ kind: "metadata" } & Omit<RecordingPayload, "format" | "messages">)
			| ({ kind: "message" } & RecordedFrame);

		if (payload.kind === "metadata") {
			metadata = {
				recordedAt: payload.recordedAt,
				request: payload.request,
				sdkVersion: payload.sdkVersion,
				metadata: payload.metadata,
			};
		} else {
			frames.push({
				index: payload.index,
				offsetMs: payload.offsetMs,
				message: payload.message,
			});
		}
	}

	if (!metadata) {
		throw new Error("Recording metadata missing from NDJSON file");
	}

	return {
		format: "ndjson",
		messages: frames,
		...metadata,
	};
}

async function loadJson(path: string): Promise<RecordingPayload> {
	const buffer = await fsPromises.readFile(path, "utf8");
	const payload = JSON.parse(buffer) as RecordingPayload;
	return payload;
}

export function loadRecording(path: string): Promise<RecordingPayload> {
	if (path.endsWith(".ndjson")) {
		return loadNdjson(path);
	}
	return loadJson(path);
}

export async function* replayRecording(
	path: string,
	options: ReplayOptions = {}
): AsyncGenerator<SDKMessage> {
	const payload = await loadRecording(path);
	const speedMultiplier = options.speedMultiplier ?? DEFAULT_SPEED_MULTIPLIER;
	const preserveTiming = options.preserveTiming ?? false;
	const start = performance.now();

	for (const frame of payload.messages) {
		if (preserveTiming) {
			const targetDelay = frame.offsetMs / speedMultiplier;
			const elapsed = performance.now() - start;
			const remaining = targetDelay - elapsed;
			if (remaining > 0) {
				await new Promise((resolve) => setTimeout(resolve, remaining));
			}
		}
		yield frame.message;
	}
}
