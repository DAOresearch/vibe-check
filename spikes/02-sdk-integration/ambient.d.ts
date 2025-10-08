declare module "@anthropic-ai/claude-agent-sdk" {
	export type SDKMessage = {
		type: string;
		[key: string]: unknown;
	};

	export type QueryRequest = {
		prompt: string;
		[key: string]: unknown;
	};

	export type QueryResultStream = AsyncIterable<SDKMessage>;

	export function query(request: QueryRequest): QueryResultStream;
	export const version: string | undefined;
	export const sdkVersion: string | undefined;
	export const VERSION: string | undefined;
}
