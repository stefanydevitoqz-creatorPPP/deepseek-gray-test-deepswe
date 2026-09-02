import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.DEEPSWE_PROXY_PORT || "8787");
const maxRequestBytes = Number(process.env.DEEPSWE_PROXY_MAX_REQUEST_BYTES || String(32 * 1024 * 1024));
const maxAttempts = Number(process.env.DEEPSWE_PROXY_MAX_ATTEMPTS || "5");
const retryBaseMs = Number(process.env.DEEPSWE_PROXY_RETRY_BASE_MS || "1000");
const sessionId = process.env.DEEPSWE_MODEL_SESSION_ID || "";
const upstream = new URL(process.env.DEEPSWE_UPSTREAM_BASE_URL || "https://api.deepseek.com");
const auditPath = process.env.DEEPSWE_PROXY_AUDIT_PATH || "/logs/agent/proxy-audit.jsonl";
const allowPrivateUpstream = process.env.DEEPSWE_PROXY_ALLOW_PRIVATE_UPSTREAM === "1";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DEEPSWE_PROXY_PORT must be an integer from 1 through 65535");
}
if (!Number.isSafeInteger(maxRequestBytes) || maxRequestBytes < 1 || maxRequestBytes > 1024 * 1024 * 1024) {
  throw new Error("DEEPSWE_PROXY_MAX_REQUEST_BYTES must be a positive integer no larger than 1 GiB");
}
if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
  throw new Error("DEEPSWE_PROXY_MAX_ATTEMPTS must be an integer from 1 through 10");
}
if (!Number.isInteger(retryBaseMs) || retryBaseMs < 10 || retryBaseMs > 30000) {
  throw new Error("DEEPSWE_PROXY_RETRY_BASE_MS must be an integer from 10 through 30000");
}
if (!sessionId || /[\0\r\n]/.test(sessionId) || !/^[\x20-\x7e]{1,256}$/.test(sessionId)) {
  throw new Error("DEEPSWE_MODEL_SESSION_ID must be 1-256 printable ASCII characters without CR/LF/NUL");
}
if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.search || upstream.hash) {
  throw new Error("DEEPSWE_UPSTREAM_BASE_URL must be an HTTP(S) URL without credentials, query, or fragment");
}
const isLoopbackUpstream = upstream.hostname === host || upstream.hostname === "localhost" || upstream.hostname === "::1";
if (isLoopbackUpstream && !allowPrivateUpstream) {
  throw new Error("loopback upstreams require DEEPSWE_PROXY_ALLOW_PRIVATE_UPSTREAM=1");
}
if (isLoopbackUpstream && Number(upstream.port || (upstream.protocol === "https:" ? 443 : 80)) === port) {
  throw new Error("proxy upstream cannot point to itself");
}

const hopByHop = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "host", "content-length"]);
const filteredHeaders = (headers) => Object.fromEntries(Object.entries(headers).filter(([name, value]) => value !== undefined && !hopByHop.has(name.toLowerCase())));
const appendAudit = (entry) => {
  try {
    fs.mkdirSync(path.dirname(auditPath), { recursive: true, mode: 0o700 });
    fs.appendFileSync(auditPath, JSON.stringify(entry) + "\n", { encoding: "utf8", mode: 0o600 });
    fs.chmodSync(auditPath, 0o600);
  } catch (error) {
    process.stderr.write(`proxy audit write failed: ${error.message}\n`);
  }
};

const retryStatuses = new Set([429, 500, 502, 503, 504]);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const retryDelay = (headers, attempt) => {
  const retryAfter = headers["retry-after"];
  if (typeof retryAfter === "string") {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30000);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay) && dateDelay > 0) return Math.min(dateDelay, 30000);
  }
  return Math.min(retryBaseMs * (2 ** (attempt - 1)), 30000);
};

const readBody = async (req) => {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > maxRequestBytes) {
      const error = new Error("request body too large");
      error.code = "REQUEST_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/chat/completions") {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
    return;
  }

  const declaredLength = Number(req.headers["content-length"] || "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxRequestBytes) {
    res.writeHead(413, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "request body too large" }));
    req.resume();
    return;
  }

  const startedAt = Date.now();
  const sourceSessionId = String(req.headers["x-deepseek-harness-session-id"] || "");
  const headers = filteredHeaders(req.headers);
  headers["x-deepseek-harness-session-id"] = sessionId;
  const targetPath = `${upstream.pathname.replace(/\/$/, "")}${req.url}` || "/chat/completions";
  const transport = upstream.protocol === "https:" ? https : http;
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    if (!res.destroyed) {
      res.writeHead(error.code === "REQUEST_TOO_LARGE" ? 413 : 400, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  headers["content-length"] = String(body.length);

  const attemptRequest = (attempt) => new Promise((resolve, reject) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const upstreamReq = transport.request({
      protocol: upstream.protocol,
      hostname: upstream.hostname,
      port: upstream.port || undefined,
      method: "POST",
      path: targetPath,
      headers,
    }, (upstreamRes) => {
      const statusCode = upstreamRes.statusCode || 502;
      const requestId = upstreamRes.headers["x-request-id"] || upstreamRes.headers["request-id"] || null;
      if (retryStatuses.has(statusCode) && attempt < maxAttempts && !res.headersSent) {
        upstreamRes.on("error", reject);
        upstreamRes.on("end", () => {
          appendAudit({
            timestamp: new Date().toISOString(),
            sourceSessionId,
            overrideSessionId: sessionId,
            statusCode,
            durationMs: Date.now() - startedAt,
            requestId,
            attempt,
            retried: true,
          });
          finish({ retry: true, delayMs: retryDelay(upstreamRes.headers, attempt) });
        });
        upstreamRes.resume();
        return;
      }

      const failStream = (code) => {
        appendAudit({
          timestamp: new Date().toISOString(),
          sourceSessionId,
          overrideSessionId: sessionId,
          statusCode,
          durationMs: Date.now() - startedAt,
          requestId,
          attempt,
          streamError: code,
        });
        if (!res.destroyed) res.destroy(new Error(code));
        finish({ retry: false });
      };
      upstreamRes.once("error", (error) => failStream(error.code || "UPSTREAM_STREAM_ERROR"));
      upstreamRes.once("aborted", () => failStream("UPSTREAM_RESPONSE_ABORTED"));
      res.writeHead(statusCode, filteredHeaders(upstreamRes.headers));
      upstreamRes.pipe(res);
      upstreamRes.once("end", () => {
        appendAudit({
          timestamp: new Date().toISOString(),
          sourceSessionId,
          overrideSessionId: sessionId,
          statusCode,
          durationMs: Date.now() - startedAt,
          requestId,
          attempt,
          retried: false,
        });
        finish({ retry: false });
      });
    });
    upstreamReq.once("error", (error) => {
      if (!settled) reject(error);
    });
    res.once("close", () => {
      if (!res.writableEnded && !upstreamReq.destroyed) upstreamReq.destroy();
    });
    upstreamReq.end(body);
  });

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (res.destroyed) return;
    try {
      const result = await attemptRequest(attempt);
      if (!result.retry) return;
      await sleep(result.delayMs);
    } catch (error) {
      lastError = error;
      appendAudit({
        timestamp: new Date().toISOString(),
        sourceSessionId,
        overrideSessionId: sessionId,
        statusCode: null,
        durationMs: Date.now() - startedAt,
        requestId: null,
        attempt,
        retried: attempt < maxAttempts,
        transportError: error.code || "UPSTREAM_TRANSPORT_ERROR",
      });
      if (attempt < maxAttempts) await sleep(Math.min(retryBaseMs * (2 ** (attempt - 1)), 30000));
    }
  }

  if (!res.destroyed && !res.headersSent) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: lastError?.code || "upstream unavailable after retries" }));
  }
});

server.listen(port, host, () => process.stdout.write(`session-id proxy listening on http://${host}:${port}\n`));
