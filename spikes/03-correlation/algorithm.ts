export type ToolHookKind = "PreToolUse" | "PostToolUse";

export type ToolHookEvent = {
	hook: ToolHookKind;
	runId: string;
	sessionId: string;
	toolName: string;
	toolInvocationId?: string;
	ts: number;
	sequence?: number;
	data?: Record<string, unknown>;
};

export type CorrelatedStatus = "completed" | "missing-post" | "orphan-post";

export type CorrelatedToolCall = {
	runId: string;
	sessionId: string;
	toolName: string;
	status: CorrelatedStatus;
	startedAt?: number;
	endedAt?: number;
	durationMs?: number;
	input?: unknown;
	output?: unknown;
	preEvent?: ToolHookEvent;
	postEvent?: ToolHookEvent;
};

export type CorrelationOptions = {
	assumeOrdered?: boolean;
};

type PendingPre = {
	event: ToolHookEvent;
};

type PendingPost = {
	event: ToolHookEvent;
};

function getKey(event: ToolHookEvent): string {
	if (event.toolInvocationId) {
		return `id:${event.toolInvocationId}`;
	}
	return `session:${event.sessionId}:tool:${event.toolName}`;
}

function parseInput(event?: ToolHookEvent): unknown {
	if (!event) {
		return;
	}
	if (event.data?.toolInput !== undefined) {
		return event.data.toolInput;
	}
	if (event.data?.input !== undefined) {
		return event.data.input;
	}
	return event.data;
}

function parseOutput(event?: ToolHookEvent): unknown {
	if (!event) {
		return;
	}
	if (event.data?.toolOutput !== undefined) {
		return event.data.toolOutput;
	}
	if (event.data?.output !== undefined) {
		return event.data.output;
	}
	return event.data;
}

/**
 * Correlates PreToolUse and PostToolUse hook events in O(n) time using stable queues.
 */
export function correlateToolCalls(
	events: ToolHookEvent[],
	options: CorrelationOptions = {}
): CorrelatedToolCall[] {
	const assumeOrdered = options.assumeOrdered ?? false;
	const pendingPres = new Map<string, PendingPre[]>();
	const pendingPosts = new Map<string, PendingPost[]>();
	const correlated: CorrelatedToolCall[] = [];

	const pushCorrelation = (
		pre: ToolHookEvent | undefined,
		post: ToolHookEvent | undefined
	): void => {
		if (pre && post) {
			const duration = post.ts - pre.ts;
			correlated.push({
				runId: pre.runId,
				sessionId: pre.sessionId,
				toolName: pre.toolName,
				status: "completed",
				startedAt: pre.ts,
				endedAt: post.ts,
				durationMs: duration >= 0 ? duration : undefined,
				input: parseInput(pre),
				output: parseOutput(post),
				preEvent: pre,
				postEvent: post,
			});
			return;
		}
		if (pre) {
			correlated.push({
				runId: pre.runId,
				sessionId: pre.sessionId,
				toolName: pre.toolName,
				status: "missing-post",
				startedAt: pre.ts,
				input: parseInput(pre),
				preEvent: pre,
			});
			return;
		}
		if (post) {
			correlated.push({
				runId: post.runId,
				sessionId: post.sessionId,
				toolName: post.toolName,
				status: "orphan-post",
				startedAt: post.ts,
				endedAt: post.ts,
				output: parseOutput(post),
				postEvent: post,
			});
		}
	};

	const ensureQueue = <T>(map: Map<string, T[]>, key: string): T[] => {
		const existing = map.get(key);
		if (existing) {
			return existing;
		}
		const created: T[] = [];
		map.set(key, created);
		return created;
	};

	const handlePre = (event: ToolHookEvent): void => {
		const key = getKey(event);
		const queue = ensureQueue(pendingPres, key);
		queue.push({ event });
		const waitingPosts = pendingPosts.get(key);
		if (!waitingPosts?.length) {
			return;
		}
		const post = waitingPosts.shift();
		queue.shift();
		if (waitingPosts.length === 0) {
			pendingPosts.delete(key);
		}
		if (queue.length === 0) {
			pendingPres.delete(key);
		}
		pushCorrelation(event, post?.event);
	};

	const handlePost = (event: ToolHookEvent): void => {
		const key = getKey(event);
		const queue = pendingPres.get(key);
		if (queue?.length) {
			const pre = queue.shift();
			if (queue.length === 0) {
				pendingPres.delete(key);
			}
			pushCorrelation(pre?.event, event);
			return;
		}
		const waiting = ensureQueue(pendingPosts, key);
		waiting.push({ event });
	};

	const source = assumeOrdered
		? events
		: [...events].sort((a, b) => {
				const sequenceA = a.sequence ?? 0;
				const sequenceB = b.sequence ?? 0;
				if (sequenceA !== sequenceB) {
					return sequenceA - sequenceB;
				}
				return a.ts - b.ts;
			});

	for (const event of source) {
		if (event.hook === "PreToolUse") {
			handlePre(event);
		} else {
			handlePost(event);
		}
	}

	const flushQueue = <T extends PendingPre | PendingPost>(
		map: Map<string, T[]>,
		emit: (pending: T) => void
	): void => {
		for (const queue of map.values()) {
			for (const pending of queue) {
				emit(pending);
			}
		}
	};

	flushQueue(pendingPres, (pending) => {
		pushCorrelation(pending.event, undefined);
	});
	flushQueue(pendingPosts, (pending) => {
		pushCorrelation(undefined, pending.event);
	});

	return correlated.sort((a, b) => {
		const timeA = a.startedAt ?? a.endedAt ?? 0;
		const timeB = b.startedAt ?? b.endedAt ?? 0;
		return timeA - timeB;
	});
}
