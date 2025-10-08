#!/usr/bin/env bun

/*
  Git Worktree & Tmux Manager (Bun/TypeScript)
  -------------------------------------------------
  Drop-in CLI to manage git worktrees with tmux windows.
  Goals:
    - Single entrypoint the agent can call once per action
    - Fast: batch/parallel shell calls where possible
    - Deterministic, minimal dependencies, Bun-native

  Usage examples:
    bun ./.claude/commands/wt/wt.ts                # status (default)
    bun ./.claude/commands/wt/wt.ts list
    bun ./.claude/commands/wt/wt.ts create <branch> [path]
    bun ./.claude/commands/wt/wt.ts cleanup [-y]
    bun ./.claude/commands/wt/wt.ts open <target>
    bun ./.claude/commands/wt/wt.ts delete <identifier> [-y]

  Optional wrapper (repo root):
    . (chmod +x) -> exec bun ./.claude/commands/wt/wt.ts "$@"
*/

import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { $, stdin } from "bun";

import { logger as Logger } from "../src/lib/logger";

const logger = Logger.child({ name: "worktreeScript" });

// ---------- utils ----------

type CmdResult = { code: number; stdout: string; stderr: string };

// Regex patterns (defined at top level for performance)
const NESTED_WORKTREES_REGEX = /\/worktrees\/.*\/worktrees\//;
const NUMERIC_REGEX = /^\d+$/;
const NEWLINE_REGEX = /\r?\n/;

async function run(cmd: ReturnType<typeof $>): Promise<CmdResult> {
	try {
		const stdout = await cmd.text();
		return { code: 0, stdout, stderr: "" };
	} catch (err: unknown) {
		const error = err as {
			exitCode?: number;
			stdout?: unknown;
			stderr?: unknown;
			message?: string;
		};
		return {
			code: typeof error.exitCode === "number" ? error.exitCode : 1,
			stdout: error.stdout ? String(error.stdout) : "",
			stderr: error.stderr ? String(error.stderr) : (error.message ?? ""),
		};
	}
}

const NL = "\n";
const YES =
	process.argv.includes("-y") ||
	process.argv.includes("--yes") ||
	process.env.WT_YES === "1";

function die(msg: string, code = 1): never {
	logger.error(msg);
	process.exit(code);
}

function canonical(p: string): string {
	try {
		return realpathSync.native(resolve(p));
	} catch {
		// if path doesn't exist yet (e.g., creating a worktree), still normalize
		return resolve(p);
	}
}

function hasNestedWorktrees(p: string): boolean {
	return NESTED_WORKTREES_REGEX.test(p);
}

function isNumeric(s: string): boolean {
	return NUMERIC_REGEX.test(s);
}

// ---------- git/tmux helpers ----------

async function assertGitRepo(): Promise<void> {
	const r = await run($`git rev-parse --git-dir`);
	if (r.code !== 0) {
		die(
			"❌ Not in a git repository. Run this command from within a git repository."
		);
	}
}

/**
 * Detects if we're in a worktree and finds the main repository.
 * Returns the main repo root path, or null if we're already in the main repo.
 */
async function getMainRepoPath(): Promise<string | null> {
	// Get the git common dir - this points to the main .git directory
	const commonDirR = await run($`git rev-parse --git-common-dir`);
	if (commonDirR.code !== 0) {
		return null;
	}

	const commonDir = commonDirR.stdout.trim();

	// If common dir is just ".git", we're in the main repo
	if (commonDir === ".git") {
		return null;
	}

	// Common dir is absolute path to main repo's .git
	// Get the parent directory (the actual repo root)
	const mainRepoRoot = dirname(canonical(commonDir));
	return mainRepoRoot;
}

async function getRepoContext(): Promise<{
	repoRoot: string;
	repoName: string;
	currentBranch: string;
	currentPath: string;
	isWorktree: boolean;
	mainRepoRoot: string;
	mainRepoName: string;
}> {
	const [rootR, branchR, pwdR, mainPath] = await Promise.all([
		run($`git rev-parse --show-toplevel`),
		run($`git rev-parse --abbrev-ref HEAD`),
		run($`pwd`),
		getMainRepoPath(),
	]);
	if (rootR.code !== 0) {
		die(
			"❌ Not in a git repository. Run this command from within a git repository."
		);
	}
	const repoRoot = canonical(rootR.stdout.trim());
	const currentBranch = branchR.code === 0 ? branchR.stdout.trim() : "";
	const currentPath = canonical(pwdR.stdout.trim());

	// Determine if we're in a worktree and get main repo info
	const isWorktree = mainPath !== null;
	const mainRepoRoot = mainPath ?? repoRoot;

	// Determine the main repo name
	// If the main repo is in a structure like "repos/worktrees/PROJECT/main"
	// we should use PROJECT as the name, not "main"
	let mainRepoName = basename(mainRepoRoot);
	if (mainRepoName === "main" || mainRepoName === "master") {
		const parentDir = dirname(mainRepoRoot);
		const grandparentName = basename(parentDir);
		// Check if parent is "worktrees" - if so, use grandparent
		if (grandparentName !== "worktrees") {
			mainRepoName = grandparentName;
		}
	}

	const repoName = basename(repoRoot);

	return {
		repoRoot,
		repoName,
		currentBranch,
		currentPath,
		isWorktree,
		mainRepoRoot,
		mainRepoName,
	};
}

type Worktree = { branch: string; path: string };

function parseWorktreeLine(
	line: string,
	cur: { path?: string; branch?: string; detached?: boolean }
): void {
	const [k, ...rest] = line.split(" ");
	const v = rest.join(" ");

	if (k === "worktree") {
		cur.path = canonical(v.trim());
	} else if (k === "branch") {
		cur.branch = v.replace("refs/heads/", "").trim();
	} else if (k === "detached") {
		cur.detached = true;
	}
}

function tryPushWorktree(
	cur: { path?: string; branch?: string; detached?: boolean },
	out: Worktree[]
): boolean {
	if (cur.path && (cur.branch || cur.detached)) {
		out.push({ branch: cur.branch ?? basename(cur.path), path: cur.path });
		return true;
	}
	return false;
}

async function listWorktrees(): Promise<Worktree[]> {
	const r = await run($`git worktree list --porcelain`);
	if (r.code !== 0) {
		die(`❌ Failed to list worktrees. ${r.stderr || r.stdout}`);
	}

	const lines = r.stdout.split(NEWLINE_REGEX);
	const out: Worktree[] = [];
	let cur: { path?: string; branch?: string; detached?: boolean } = {};

	for (const line of lines) {
		if (!line.trim()) continue;

		parseWorktreeLine(line, cur);

		if (tryPushWorktree(cur, out)) {
			cur = {};
		}
	}

	// Handle last entry if not followed by blank line
	tryPushWorktree(cur, out);

	return out;
}

type TmuxWindow = {
	session: string;
	index: string;
	name: string;
	panePath: string;
};

async function tmuxExists(): Promise<boolean> {
	const r = await run($`tmux -V`);
	return r.code === 0;
}

async function tmuxSessionExists(session: string): Promise<boolean> {
	const r = await run($`tmux has-session -t ${session}`);
	return r.code === 0;
}

async function getActiveWindowLabel(session: string): Promise<string | null> {
	// Print only the active window for the session
	const r = await run(
		$`tmux list-windows -t ${session} -F '#{?window_active,#{window_index}:#{window_name},}'`
	);
	if (r.code !== 0) return null;
	return r.stdout.split(NEWLINE_REGEX).find(Boolean) ?? null;
}

async function ensureTmuxSession(session: string, cwd: string): Promise<void> {
	const has = await run($`tmux has-session -t ${session}`);
	if (has.code !== 0) {
		const create = await run($`tmux new-session -d -s ${session} -c ${cwd}`);
		if (create.code !== 0) {
			die(
				`❌ Failed to create tmux session '${session}'. ${create.stderr || create.stdout}`
			);
		}
	}
}

async function listTmuxWindows(session: string): Promise<TmuxWindow[]> {
	// Use '|' as delimiter to avoid ':' conflicts in names/paths
	const panes = await run(
		$`tmux list-panes -a -F '#{session_name}|#{window_index}|#{window_name}|#{pane_current_path}'`
	);
	if (panes.code !== 0) {
		return [];
	}
	const out: TmuxWindow[] = [];
	for (const line of panes.stdout.split(NEWLINE_REGEX)) {
		if (!line.trim()) {
			continue;
		}
		const [sess, idx, name, pth] = line.split("|");
		if (!(sess && idx && name && pth)) {
			continue;
		}
		if (sess !== session) {
			continue;
		}
		out.push({ session: sess, index: idx, name, panePath: canonical(pth) });
	}
	// de-dupe per window (first pane wins)
	const seen = new Map<string, TmuxWindow>();
	for (const w of out) {
		const key = `${w.index}:${w.name}`;
		if (!seen.has(key)) {
			seen.set(key, w);
		}
	}
	return Array.from(seen.values());
}

// ---------- formatting ----------

function printStatus(
	ctx: {
		repoName: string;
		currentBranch: string;
		currentPath: string;
		sessionExists: boolean;
		currentWindow: string | null;
	},
	wts: Worktree[],
	wins: TmuxWindow[]
) {
	const synced = isSynchronized(wts, wins);
	const status = synced ? "✓ Synchronized" : "⚠ Out of sync";
	const tmuxLine = `Tmux Session: ${ctx.repoName} (${ctx.sessionExists ? "exists" : "none"})`;
	const curWin = ctx.currentWindow ?? "not-in-tmux";
	const lines = [
		"📊 Worktree Manager Status",
		"",
		`Repository: ${ctx.repoName}`,
		`Current Branch: ${ctx.currentBranch}`,
		`Current Path: ${ctx.currentPath}`,
		"",
		tmuxLine,
		`Current Window: ${curWin}`,
		"",
		`Worktrees: ${wts.length} total`,
		`Tmux Windows: ${wins.length} total`,
		`Status: ${status}`,
		"",
		"Quick Actions:",
		"  create <branch>     Create new worktree",
		"  list                List all worktrees",
		"  open <target>       Switch to window",
		"  cleanup             Clean up orphaned items",
		"  delete <id>         Delete worktree and window",
	];
	logger.info(lines.join(NL));
}

function isSynchronized(wts: Worktree[], wins: TmuxWindow[]): boolean {
	// Two-way check: same size and all worktree paths match window paths
	const wtPaths = new Set(wts.map((w) => w.path));
	const winPaths = new Set(wins.map((w) => w.panePath));
	if (wtPaths.size !== winPaths.size) return false;
	for (const p of wtPaths) {
		if (!winPaths.has(p)) return false;
	}
	return true;
}

function printList(
	repoName: string,
	sessionExists: boolean,
	wts: Worktree[],
	wins: TmuxWindow[]
) {
	const header = [
		"📋 Worktree List",
		"",
		`Repository: ${repoName}`,
		`Tmux Session: ${repoName} (${sessionExists ? "exists" : "none"})`,
		"",
		`WORKTREES (${wts.length} total):`,
		"",
	];
	const winByPath = new Map<string, TmuxWindow>();
	for (const w of wins) {
		winByPath.set(w.panePath, w);
	}

	const items: string[] = [];
	wts.forEach((wt, i) => {
		const w = winByPath.get(wt.path);
		let status = "⚠ no window";
		let winLabel = "-";
		if (w) {
			winLabel = `${w.index}:${w.name}`;
			status =
				hasNestedWorktrees(w.panePath) || hasNestedWorktrees(wt.path)
					? "⚠ incorrect path"
					: "✓ synced";
		} else if (hasNestedWorktrees(wt.path)) {
			status = "⚠ incorrect path";
		}
		items.push(
			`${i + 1}. ${wt.branch}`,
			`   Path: ${wt.path}`,
			`   Tmux: ${winLabel} ${status}`,
			""
		);
	});

	const summary = [
		`Summary: ${wts.length} worktrees, ${wins.length} tmux windows`,
	];
	if (
		items.join("").includes("incorrect path") ||
		items.join("").includes("no window")
	) {
		summary.push("Run 'cleanup' to fix issues");
	}

	logger.info([...header, ...items, ...summary].join(NL));
}

// ---------- actions ----------

async function actionStatus() {
	await assertGitRepo();
	const { mainRepoName, currentBranch, currentPath, isWorktree, repoName } =
		await getRepoContext();

	const tmuxOk = await tmuxExists();
	const sessionExists = tmuxOk && (await tmuxSessionExists(mainRepoName));

	const [wts, wins, activeWin] = await Promise.all([
		listWorktrees(),
		sessionExists ? listTmuxWindows(mainRepoName) : Promise.resolve([]),
		sessionExists ? getActiveWindowLabel(mainRepoName) : Promise.resolve(null),
	]);

	const displayName = isWorktree
		? `${mainRepoName} (in worktree: ${repoName})`
		: mainRepoName;

	printStatus(
		{
			repoName: displayName,
			currentBranch,
			currentPath,
			sessionExists,
			currentWindow: activeWin,
		},
		wts,
		wins
	);
}

async function actionList() {
	await assertGitRepo();
	const { mainRepoName } = await getRepoContext();

	const tmuxOk = await tmuxExists();
	const sessionExists = tmuxOk && (await tmuxSessionExists(mainRepoName));

	const [wts, wins] = await Promise.all([
		listWorktrees(),
		sessionExists ? listTmuxWindows(mainRepoName) : Promise.resolve([]),
	]);

	printList(mainRepoName, sessionExists, wts, wins);
}

function calculateWorktreePath(
	mainRepoRoot: string,
	branch: string,
	customPath?: string
): string {
	const worktreeBase = dirname(mainRepoRoot);

	if (customPath) {
		return canonical(join(resolve(dirname(customPath)), basename(customPath)));
	}

	// Create worktree as sibling to main repo (same level)
	return canonical(join(worktreeBase, basename(branch)));
}

async function createWorktreeWithBranch(
	worktreePath: string,
	branch: string
): Promise<void> {
	// Try: new local branch -> track remote -> existing local
	let r = await run($`git worktree add ${worktreePath} -b ${branch}`);

	if (r.code !== 0) {
		const local = await run(
			$`git show-ref --verify --quiet refs/heads/${branch}`
		);
		if (local.code !== 0) {
			const remote = await run($`git ls-remote --heads origin ${branch}`);
			if (remote.code === 0 && remote.stdout.trim()) {
				r = await run(
					$`git worktree add ${worktreePath} --track -b ${branch} origin/${branch}`
				);
			}
		}
	}

	if (r.code !== 0) {
		r = await run($`git worktree add ${worktreePath} ${branch}`);
		if (r.code !== 0) {
			die(`❌ Failed to create worktree\n${r.stderr || r.stdout}`);
		}
	}
}

async function createTmuxWindow(
	sessionName: string,
	branch: string,
	worktreePath: string
): Promise<string> {
	const win = await run(
		$`tmux new-window -P -F '#{window_index}' -t ${sessionName}: -n ${branch} -c ${worktreePath}`
	);
	if (win.code !== 0) {
		die(
			`❌ Worktree created but failed to create tmux window. ${win.stderr || win.stdout}`
		);
	}
	return win.stdout.trim();
}

async function actionCreate(branch: string | undefined, customPath?: string) {
	if (!branch) {
		die("❌ Usage: wt create <branch> [path]");
	}

	await assertGitRepo();
	const { mainRepoRoot, mainRepoName } = await getRepoContext();

	if (!(await tmuxExists())) {
		die("❌ tmux is not installed. Install with: brew install tmux");
	}

	await ensureTmuxSession(mainRepoName, mainRepoRoot);

	const worktreePath = calculateWorktreePath(mainRepoRoot, branch, customPath);

	if (hasNestedWorktrees(worktreePath)) {
		die(
			`❌ Invalid path: nested /worktrees/ directories detected\n   Path would be: ${worktreePath}`
		);
	}

	await createWorktreeWithBranch(worktreePath, branch);
	const idx = await createTmuxWindow(mainRepoName, branch, worktreePath);
	await run($`tmux select-window -t ${mainRepoName}:${idx}`);

	logger.info(
		`✓ Created worktree: ${worktreePath}\n✓ Created tmux window: ${mainRepoName}:${idx} (${branch})\n✓ Switched to new window`
	);
}

async function actionCleanup() {
	await assertGitRepo();
	const { mainRepoName, mainRepoRoot } = await getRepoContext();

	const tmuxOk = await tmuxExists();
	if (!tmuxOk) {
		die("❌ tmux is not installed. Install with: brew install tmux");
	}

	// Ensure session exists before cleanup
	await ensureTmuxSession(mainRepoName, mainRepoRoot);

	const removed = await pruneStaleWorktrees(YES);

	const wins = await listTmuxWindows(mainRepoName);
	const wts = await listWorktrees();
	const wtPaths = new Set(wts.map((w) => w.path));

	const orphaned = wins.filter(
		(w) =>
			!(existsSync(w.panePath) && wtPaths.has(w.panePath)) ||
			hasNestedWorktrees(w.panePath)
	);
	const incorrectWts = wts.filter((w) => hasNestedWorktrees(w.path));
	const pathIssues = incorrectWts.length;

	const closed = await closeOrphanedWindows(mainRepoName, orphaned, YES);

	const winByPath = new Map(wins.map((w) => [w.panePath, w] as const));
	const missing = wts.filter((w) => !winByPath.has(w.path));
	const created = await createMissingWindows(mainRepoName, missing, YES);

	if (incorrectWts.length) {
		const lines = [
			`⚠️  Detected ${incorrectWts.length} worktrees at incorrect paths (nested /worktrees/ directories):`,
			...incorrectWts.map((w) => `  - ${w.path}`),
			"",
			"These were likely created with incorrect relative paths.",
			"Fix by:",
			"  1. Backing up any uncommitted changes",
			"  2. Running: git worktree remove <incorrect-path>",
			"  3. Recreating with: create <branch-name>",
			"",
		];
		logger.info(lines.join(NL));
	}

	logger.info(
		[
			"🧹 Cleanup Report:",
			`Stale Worktrees: ${removed} removed`,
			`Orphaned Windows: ${closed} closed`,
			`Missing Windows: ${created} created`,
			`Path Issues: ${pathIssues} detected`,
			"✓ Cleanup complete",
		].join(NL)
	);
}

async function pruneStaleWorktrees(yes: boolean): Promise<number> {
	const dry = await run($`git worktree prune --dry-run`);
	const staleLines = dry.stdout.split(NEWLINE_REGEX).filter(Boolean);
	if (!staleLines.length) {
		return 0;
	}
	if (yes) {
		const pr = await run($`git worktree prune -v`);
		if (pr.code !== 0) {
			logger.error(pr.stderr || pr.stdout);
			return 0;
		}
		return staleLines.length;
	}
	logger.info(`Remove ${staleLines.length} stale worktree references? (y/n)`);
	const ans = await promptYesNo();
	if (!ans) {
		return 0;
	}
	const pr = await run($`git worktree prune -v`);
	if (pr.code !== 0) {
		logger.error(pr.stderr || pr.stdout);
		return 0;
	}
	return staleLines.length;
}

async function closeOrphanedWindows(
	repoName: string,
	orphaned: TmuxWindow[],
	yes: boolean
): Promise<number> {
	if (!orphaned.length) {
		return 0;
	}
	if (!yes) {
		logger.info(
			`Close ${orphaned.length} orphaned/incorrect tmux windows? (y/n)`
		);
		const ans = await promptYesNo();
		if (!ans) {
			return 0;
		}
	}
	const kills = orphaned.map((w) =>
		run($`tmux kill-window -t ${repoName}:${w.index}`)
	);
	const results = await Promise.all(kills);
	return results.filter((r) => r.code === 0).length;
}

async function createMissingWindows(
	repoName: string,
	missing: Worktree[],
	yes: boolean
): Promise<number> {
	if (!missing.length) {
		return 0;
	}
	if (!yes) {
		logger.info(`Create ${missing.length} missing tmux windows? (y/n)`);
		const ans = await promptYesNo();
		if (!ans) {
			return 0;
		}
	}
	const creates = missing.map((m) =>
		run($`tmux new-window -t ${repoName}: -n ${m.branch} -c ${m.path}`)
	);
	const results = await Promise.all(creates);
	return results.filter((r) => r.code === 0).length;
}

async function actionOpen(target: string | undefined) {
	if (!target) {
		die("❌ Usage: wt open <target>");
	}
	await assertGitRepo();
	const { mainRepoName } = await getRepoContext();
	if (!(await tmuxExists())) {
		die("❌ tmux is not installed. Install with: brew install tmux");
	}
	const wins = await listTmuxWindows(mainRepoName);

	let match: TmuxWindow | undefined;
	if (isNumeric(target)) {
		match = wins.find((w) => w.index === target);
	} else {
		const exact = wins.find((w) => w.name === target);
		const partials = wins.filter((w) => w.name.includes(target));
		if (!exact && partials.length > 1) {
			die(
				`❌ Multiple windows match '${target}': ${partials.map((w) => w.name).join(", ")}. Be more specific.`
			);
		}
		match = exact ?? partials[0];
	}

	if (!match) {
		die(
			`❌ Window '${target}' not found. Available windows: ${wins.map((w) => `${w.index}:${w.name}`).join(", ")}`
		);
	}

	const sel = await run(
		$`tmux select-window -t ${mainRepoName}:${match.index}`
	);
	if (sel.code !== 0) {
		die(`❌ Failed to switch window. ${sel.stderr || sel.stdout}`);
	}
	logger.info(
		`✓ Switched to window: ${mainRepoName}:${match.index} (${match.name})`
	);
}

async function actionDelete(identifier: string | undefined) {
	if (!identifier) {
		die("❌ Usage: wt delete <branch|path>");
	}
	await assertGitRepo();
	const { mainRepoName } = await getRepoContext();
	const wts = await listWorktrees();

	const matches = wts.filter(
		(w) => w.branch === identifier || w.path.includes(identifier)
	);
	if (!matches.length) {
		die("❌ No matching worktree found.");
	}
	if (matches.length > 1) {
		die(
			`❌ Multiple matches. Be more specific:\n${matches.map((m) => ` - ${m.branch} @ ${m.path}`).join(NL)}`
		);
	}
	const wt = matches[0];
	if (!wt) {
		die("❌ No matching worktree found.");
	}

	if (!YES) {
		logger.info(
			`⚠️  Delete worktree '${wt.path}' (branch: ${wt.branch})? This will remove uncommitted changes. (y/n)`
		);
		const ans = await promptYesNo();
		if (!ans) {
			process.exit(0);
		}
	}

	// find matching window by path
	const wins = (await tmuxExists()) ? await listTmuxWindows(mainRepoName) : [];
	const win = wins.find((w) => w.panePath === wt.path);
	if (win) {
		await run($`tmux kill-window -t ${mainRepoName}:${win.index}`);
		logger.info(
			`✓ Closed tmux window: ${mainRepoName}:${win.index} (${win.name})`
		);
	}

	const rm = await run($`git worktree remove ${wt.path} --force`);
	if (rm.code !== 0) {
		die(`❌ Failed to remove worktree. ${rm.stderr || rm.stdout}`);
	}
	logger.info(
		`✓ Removed worktree: ${wt.path}\n\nBranch '${wt.branch}' still exists. To delete it:\n  git branch -D ${wt.branch}`
	);
}

// ---------- prompt helper ----------

async function promptYesNo(): Promise<boolean> {
	const buf = await new Response(stdin.stream()).text();
	const ans = buf.trim().toLowerCase();
	return ans === "y" || ans === "yes";
}

function formatTmuxDebugInfo(
	wins: TmuxWindow[],
	curWinR: CmdResult,
	sessionExistsR: CmdResult
): string[] {
	const inTmux = curWinR.code === 0;
	const sessionExists = sessionExistsR.code === 0;

	const lines = [
		`Session Exists: ${sessionExists ? "YES ✓" : "NO"}`,
		`Currently In Tmux: ${inTmux ? "YES ✓" : "NO"}`,
		inTmux ? `Current Window: ${curWinR.stdout.trim()}` : "",
		`Windows in Session: ${wins.length}`,
		"",
	];

	if (wins.length > 0) {
		lines.push("=== Tmux Windows ===");
		for (const win of wins) {
			lines.push(`  ${win.index}:${win.name}`, `    Path: ${win.panePath}`, "");
		}
	}

	return lines;
}

function formatWorktreesDebugInfo(
	wts: Worktree[],
	mainRepoRoot: string
): string[] {
	const lines: string[] = [];

	if (wts.length > 0) {
		lines.push(`=== Git Worktrees (${wts.length} total) ===`);
		for (const wt of wts) {
			const isMain = wt.path === mainRepoRoot;
			lines.push(
				`  ${wt.branch}${isMain ? " [MAIN]" : ""}`,
				`    Path: ${wt.path}`,
				""
			);
		}
	}

	return lines;
}

async function actionDebug() {
	await assertGitRepo();
	const ctx = await getRepoContext();
	const tmuxOk = await tmuxExists();

	// Get git common dir to show the detection logic
	const [commonDirR, gitDirR] = await Promise.all([
		run($`git rev-parse --git-common-dir`),
		run($`git rev-parse --git-dir`),
	]);

	const lines = [
		"🔍 Debug Information",
		"",
		"=== Git Repository Context ===",
		`Current Path: ${ctx.currentPath}`,
		`Repository Root: ${ctx.repoRoot}`,
		`Repository Name: ${ctx.repoName}`,
		`Current Branch: ${ctx.currentBranch}`,
		"",
		"=== Worktree Detection ===",
		`Is Worktree: ${ctx.isWorktree ? "YES ✓" : "NO"}`,
		`Main Repo Root: ${ctx.mainRepoRoot}`,
		`Main Repo Name: ${ctx.mainRepoName}`,
		"",
		"=== Git Directory Info ===",
		`git-dir: ${gitDirR.stdout.trim()}`,
		`git-common-dir: ${commonDirR.stdout.trim()}`,
		"",
		"=== Tmux Configuration ===",
		`Tmux Available: ${tmuxOk ? "YES ✓" : "NO"}`,
		`Session Name (used): ${ctx.mainRepoName}`,
		"",
	];

	if (tmuxOk) {
		const [wins, curWinR, sessionExistsR] = await Promise.all([
			listTmuxWindows(ctx.mainRepoName),
			run(
				$`tmux display-message -p '#{session_name}:#{window_index}:#{window_name}'`
			),
			run($`tmux has-session -t ${ctx.mainRepoName}`),
		]);

		lines.push(...formatTmuxDebugInfo(wins, curWinR, sessionExistsR));
	}

	const wts = await listWorktrees();
	lines.push(...formatWorktreesDebugInfo(wts, ctx.mainRepoRoot));

	logger.info(lines.filter((line) => line !== "").join(NL));
}

// ---------- dispatch ----------

async function main() {
	const [, , sub, ...rest] = process.argv;
	switch (sub) {
		case undefined:
		case "status":
			await actionStatus();
			break;
		case "list":
			await actionList();
			break;
		case "create":
			await actionCreate(rest[0], rest[1]);
			break;
		case "cleanup":
			await actionCleanup();
			break;
		case "open":
			await actionOpen(rest[0]);
			break;
		case "delete":
			await actionDelete(rest[0]);
			break;
		case "debug":
			await actionDebug();
			break;
		case "help":
		case "-h":
		case "--help":
			printHelp();
			break;
		default:
			die(`❌ Unknown subcommand: ${sub}\nRun with --help for usage.`);
	}
}

function printHelp() {
	logger.info(
		[
			"Git Worktree & Tmux Manager (wt)",
			"",
			"Usage:",
			"  wt [status]                   Show current status",
			"  wt list                       List all worktrees and windows",
			"  wt create <branch> [path]     Create new worktree and window",
			"  wt cleanup [-y|--yes]         Clean up orphaned items",
			"  wt open <target>              Switch to window by name/index",
			"  wt delete <identifier> [-y]   Delete worktree and window",
			"  wt debug                      Show detailed debug information",
			"",
			"Flags:",
			"  -y, --yes    Auto-confirm prompts",
		].join(NL)
	);
}

main().catch((err) => die(`❌ ${err?.message || String(err)}`));
