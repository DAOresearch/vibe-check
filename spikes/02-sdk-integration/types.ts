export type SDKMessage =
	| {
			type: "system";
			text: string;
			timestamp: number;
	  }
	| {
			type: "user";
			text: string;
			timestamp: number;
	  }
	| {
			type: "assistant";
			text: string;
			timestamp: number;
			toolCallId?: string;
			channel?: "text" | "tool_invocation";
	  }
	| {
			type: "result";
			toolCallId: string;
			outputText?: string;
			outputJson?: unknown;
			timestamp: number;
	  }
	| {
			type: "stream_event";
			event: "completion_delta" | "tool_delta" | "tool_completed";
			delta?: string;
			toolCallId?: string;
			timestamp: number;
	  };

export type QueryToolDefinition = {
	name: string;
	description?: string;
	inputSchema?: unknown;
};

export type QueryRequest = {
	prompt: string;
	model?: string;
	tools?: QueryToolDefinition[];
	timeoutMs?: number;
	metadata?: Record<string, unknown>;
};

export type QueryResultStream = AsyncIterable<SDKMessage>;
