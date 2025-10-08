import { once } from "node:events";
import {
	createWriteStream,
	promises as fsPromises,
	type WriteStream,
} from "node:fs";
import { dirname } from "node:path";
import { performance } from "node:perf_hooks";
import { getSdkVersion, isUsingStub, query } from "./bridge";
import type { QueryRequest, SDKMessage } from "./types";

export type RecordingFormat = "json" | "ndjson";

type RecorderOptions = {
	outputPath: string;
	format: RecordingFormat;
	request: QueryRequest;
	sdkVersion: string;
	metadata?: Record<string, unknown>;
};

type RecordedMessage = {
	index: number;
	offsetMs: number;
	message: SDKMessage;
};

export type RecordingSummary = {
	outputPath: string;
	format: RecordingFormat;
	sdkVersion: string;
	messageCount: number;
	usedStub: boolean;
	metadata?: Record<string, unknown>;
};

type RecordQueryOptions = {
	outputPath: string;
	format: RecordingFormat;
	metadata?: Record<string, unknown>;
};

const JSON_INDENT = 2;

async function ensureParentDirectory(path: string): Promise<void> {
	await fsPromises.mkdir(dirname(path), { recursive: true });
}

export class RecordingSession {
	readonly #options: RecorderOptions;
	readonly #start = performance.now();
	readonly #messages: RecordedMessage[] = [];
	readonly #stream: WriteStream | null;
	#nextIndex = 0;

	private constructor(options: RecorderOptions, stream: WriteStream | null) {
		this.#options = options;
		this.#stream = stream;
	}

	static async create(options: RecorderOptions): Promise<RecordingSession> {
		await ensureParentDirectory(options.outputPath);
		let stream: WriteStream | null = null;
		if (options.format === "ndjson") {
			stream = createWriteStream(options.outputPath, {
				encoding: "utf8",
				flags: "w",
			});
			const header = {
				kind: "metadata" as const,
				recordedAt: new Date().toISOString(),
				sdkVersion: options.sdkVersion,
				request: options.request,
				metadata: options.metadata ?? {},
			};
			stream.write(`${JSON.stringify(header)}\n`);
		}
		return new RecordingSession(options, stream);
	}

	async recordMessage(message: SDKMessage): Promise<void> {
		const record: RecordedMessage = {
			index: this.#nextIndex++,
			offsetMs: performance.now() - this.#start,
			message,
		};

		if (this.#options.format === "ndjson") {
			const serialized = `${JSON.stringify({ kind: "message", ...record })}\n`;
			const stream = this.#stream;
			if (!stream) {
				throw new Error("NDJSON stream not initialised");
			}
			if (!stream.write(serialized)) {
				await once(stream, "drain");
			}
		} else {
			this.#messages.push(record);
		}
	}

	async finalize(): Promise<void> {
		if (this.#options.format === "json") {
			const payload = {
				format: "json" as const,
				recordedAt: new Date().toISOString(),
				sdkVersion: this.#options.sdkVersion,
				request: this.#options.request,
				metadata: this.#options.metadata ?? {},
				messages: this.#messages,
			};
			await fsPromises.writeFile(
				this.#options.outputPath,
				JSON.stringify(payload, null, JSON_INDENT),
				"utf8"
			);
		} else {
			await new Promise<void>((resolve, reject) => {
				const stream = this.#stream;
				if (!stream) {
					reject(new Error("NDJSON stream not initialised"));
					return;
				}
				stream.end((error: NodeJS.ErrnoException | null) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			});
		}
	}
}

export async function recordQuery(
	request: QueryRequest,
	options: RecordQueryOptions
): Promise<RecordingSummary> {
	const sdkVersion = await getSdkVersion();
	const session = await RecordingSession.create({
		outputPath: options.outputPath,
		format: options.format,
		request,
		sdkVersion,
		metadata: options.metadata,
	});

	let count = 0;
	for await (const message of query(request)) {
		await session.recordMessage(message);
		count += 1;
	}
	await session.finalize();

	return {
		outputPath: options.outputPath,
		format: options.format,
		sdkVersion,
		messageCount: count,
		usedStub: await isUsingStub(),
		metadata: options.metadata,
	};
}
