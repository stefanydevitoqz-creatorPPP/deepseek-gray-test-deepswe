import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const threshold = Number(process.env.DEEPSWE_TOKEN_LIMIT || "1000000");
const windowSeconds = Number(process.env.DEEPSWE_TOKEN_WINDOW_SECONDS || "600");
const expectedModel = process.env.DEEPSWE_EXPECTED_MODEL || "deepseek-v4-pro";
const expectedReasoningEffort = process.env.DEEPSWE_EXPECTED_REASONING_EFFORT || "max";
const sessionRoot = "/tmp/dsh-deepswe/sessions/--app--";
const statusPath = "/logs/agent/token-watchdog.json";
const npmRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
const modulePath = pathToFileURL(path.join(npmRoot, "@deepseek-ai", "dsh", "node_modules", "@deepseek-ai", "dsh-session-persistence-jsonl", "lib", "index.js")).href;
const { JsonlSessionPersistence } = await import(modulePath);

const writeStatus = (status) => {
  fs.writeFileSync(statusPath, JSON.stringify({ timestamp: new Date().toISOString(), threshold, windowSeconds, expectedModel, expectedReasoningEffort, ...status }, null, 2) + "\n", { mode: 0o600 });
};

const visitUsage = (event) => {
  const usages = [];
  const models = new Set();
  const reasoningEfforts = new Set();
  const seen = new Set();
  const visit = (value) => {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (value.usage && typeof value.usage.inputTokens === "number" && typeof value.usage.outputTokens === "number") usages.push(value.usage);
    if (typeof value.model === "string") models.add(value.model);
    if (typeof value.reasoningEffort === "string") reasoningEfforts.add(value.reasoningEffort);
    for (const child of Object.values(value)) visit(child);
  };
  visit(event);
  return { usages, models, reasoningEfforts };
};

const snapshot = async () => {
  if (!fs.existsSync(sessionRoot)) return null;
  const ids = fs.readdirSync(sessionRoot).filter((name) => name.startsWith("session-")).sort();
  if (!ids.length) return null;
  const id = ids.at(-1);
  const logPath = path.join(sessionRoot, id, "session.jsonl.zstd");
  if (!fs.existsSync(logPath)) return null;
  const fake = {
    compression: "zstd",
    ensureRootEncoding: async () => {},
    findLog: async () => logPath,
    readStableFile: JsonlSessionPersistence.prototype.readStableFile,
  };
  const raw = await JsonlSessionPersistence.prototype.readRaw.call(fake, id);
  const events = raw.content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const totals = { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0, reasoning: 0 };
  const models = new Set();
  const reasoningEfforts = new Set();
  let usageRecords = 0;
  for (const event of events) {
    const found = visitUsage(event);
    for (const model of found.models) models.add(model);
    for (const effort of found.reasoningEfforts) reasoningEfforts.add(effort);
    if (event.type !== "assistant/message") continue;
    for (const usage of found.usages) {
      usageRecords += 1;
      totals.uncachedInput += usage.inputTokens || 0;
      totals.cacheRead += usage.cacheReadTokens || 0;
      totals.cacheWrite += usage.cacheWriteTokens || 0;
      totals.output += usage.outputTokens || 0;
      totals.reasoning += usage.reasoningTokens || 0;
    }
  }
  const total = totals.uncachedInput + totals.cacheRead + totals.cacheWrite + totals.output;
  return { sessionId: id, usageRecords, totals, total, models: [...models], reasoningEfforts: [...reasoningEfforts] };
};

const dshElapsedSeconds = () => {
  try {
    const pid = execFileSync(
      "pgrep",
      ["-f", "node .*/dsh --profile headless"],
      { encoding: "utf8" },
    ).trim().split(/\s+/)[0];
    if (!pid) return null;
    const elapsed = Number(execFileSync("ps", ["-o", "etimes=", "-p", pid], { encoding: "utf8" }).trim());
    return Number.isFinite(elapsed) ? elapsed : null;
  } catch {
    return null;
  }
};

let checking = false;
const check = async () => {
  if (checking) return;
  checking = true;
  try {
    const current = await snapshot();
    if (!current) {
      writeStatus({ state: "waiting-for-session" });
      return;
    }
    const elapsedSeconds = dshElapsedSeconds();
    const withinWindow = elapsedSeconds !== null && elapsedSeconds <= windowSeconds;
    const wrongModel = current.models.length > 0 && current.models.some((model) => model !== expectedModel);
    const reasoningEffortMismatch = current.reasoningEfforts.length > 0 && current.reasoningEfforts.some((effort) => effort !== expectedReasoningEffort);
    const overLimitInWindow = current.total >= threshold && withinWindow;
    if (wrongModel || overLimitInWindow) {
      const reason = wrongModel ? "unexpected-model" : "token-limit-within-window";
      writeStatus({ state: "terminating", reason, elapsedSeconds, withinWindow, reasoningEffortMismatch, ...current });
      try { execFileSync("pkill", ["-TERM", "-f", "[d]sh --profile headless"]); } catch {}
      process.exit(20);
    }
    const state = withinWindow ? "monitoring-window" : "monitoring-window-expired";
    writeStatus({ state, elapsedSeconds, withinWindow, reasoningEffortMismatch, ...current });
    if (!withinWindow) process.exit(0);
  } catch (error) {
    writeStatus({ state: "monitor-error", error: error.message });
  } finally {
    checking = false;
  }
};

await check();
setInterval(check, 2000);
