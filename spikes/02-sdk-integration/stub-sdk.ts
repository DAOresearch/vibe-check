import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { QueryRequest, QueryResultStream } from "./types";

const TOOL_DELAY_MS = 5;

export const sdkVersion = "0.0.0-stub";

export async function* query(request: QueryRequest): QueryResultStream {
	const startTs = performance.now();
	const now = () => Date.now();
	const toolCallId = randomUUID();

	yield {
		type: "system",
		text: `Stub Claude Agent SDK v${sdkVersion}`,
		timestamp: now(),
	};

	yield {
		type: "user",
		text: request.prompt,
		timestamp: now(),
	};

	yield {
		type: "assistant",
		text: "Invoking tool...",
		timestamp: now(),
		toolCallId,
		channel: "tool_invocation",
	};

	await new Promise((resolve) => setTimeout(resolve, TOOL_DELAY_MS));

	yield {
		type: "stream_event",
		event: "completion_delta",
		delta: "processed chunk",
		toolCallId,
		timestamp: now(),
	};

	await new Promise((resolve) => setTimeout(resolve, TOOL_DELAY_MS));

	yield {
		type: "result",
		toolCallId,
		outputText: JSON.stringify({
			success: true,
			tool: "search",
			args: request.tools ?? [],
		}),
		timestamp: now(),
	};

	yield {
		type: "assistant",
		text: "Tool run complete. Summary: success.",
		timestamp: now(),
	};

	const runDurationMs = performance.now() - startTs;
	yield {
		type: "stream_event",
		event: "tool_completed",
		toolCallId,
		delta: JSON.stringify({ runDurationMs }),
		timestamp: now(),
	};
}
