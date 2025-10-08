import type { QueryRequest, QueryResultStream } from "./types";

/**
 * Set `VIBE_AGENT_MODE=live` to exercise the real SDK. Credential discovery is delegated
 * to Claude Code itself (OAuth token, stored settings, etc.). Any other value keeps the
 * spike running against the local stub.
 */
const agentMode = (process.env.VIBE_AGENT_MODE ?? "testing").toLowerCase();
const requestLiveSdk = agentMode === "live";
const FORCE_STUB = !requestLiveSdk;

type QueryImplementation = (request: QueryRequest) => QueryResultStream;

type BridgeResolution = {
	query: QueryImplementation;
	sdkVersion: string;
	source: "real" | "stub";
};

let cachedResolution: BridgeResolution | null = null;
let resolving: Promise<BridgeResolution> | null = null;

function resolveBridge(): Promise<BridgeResolution> {
	if (cachedResolution) {
		return Promise.resolve(cachedResolution);
	}
	if (resolving) {
		return resolving;
	}

	resolving = (async () => {
		if (!FORCE_STUB) {
			try {
				const sdk = await import("@anthropic-ai/claude-agent-sdk");
				const sdkQuery = sdk.query as QueryImplementation;
				const sdkVersion =
					(sdk as { version?: string }).version ??
					(sdk as { sdkVersion?: string }).sdkVersion ??
					(sdk as { VERSION?: string }).VERSION ??
					"unknown";
				cachedResolution = {
					query: sdkQuery,
					sdkVersion,
					source: "real",
				};
				return cachedResolution;
			} catch {
				// Swallow and fall back to stub implementation.
			}
		}

		if (!cachedResolution) {
			const stub = await import("./stub-sdk");
			cachedResolution = {
				query: stub.query,
				sdkVersion: stub.sdkVersion,
				source: "stub",
			};
		}
		return cachedResolution;
	})();

	return resolving;
}

/**
 * Proxy to Claude Agent SDK's query() that shields the rest of the codebase from direct imports.
 */
export async function* query(request: QueryRequest): QueryResultStream {
	const bridge = await resolveBridge();
	const stream = bridge.query(request);
	yield* stream;
}

export async function getSdkVersion(): Promise<string> {
	const bridge = await resolveBridge();
	return bridge.sdkVersion;
}

export async function isUsingStub(): Promise<boolean> {
	const bridge = await resolveBridge();
	return bridge.source === "stub";
}
