import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const proxyPath = path.join(root, "proxy", "session_id_proxy.mjs");
const auditPath = path.join(root, "proxy-test-audit.jsonl");
const fixedSessionId = "session-test-override";
const originalSessionId = "session-local-test";
const secret = "test-secret-must-not-be-logged";
fs.rmSync(auditPath, { force: true });

let receivedHeaders;
let receivedBody = "";
let requestCount = 0;
const upstream = http.createServer((req, res) => {
  receivedHeaders = req.headers;
  req.setEncoding("utf8");
  req.on("data", (chunk) => { receivedBody += chunk; });
  req.on("end", () => {
    requestCount += 1;
    if (requestCount === 3) {
      res.writeHead(502, { "content-type": "application/json", "x-request-id": "mock-retry-502" });
      res.end(JSON.stringify({ error: "transient mock failure" }));
      return;
    }
    res.writeHead(200, { "content-type": "text/event-stream", "x-request-id": `mock-request-${requestCount}` });
    res.write('data: {"choices":[{"delta":{"content":"ok"}}]}\n\n');
    if (requestCount === 2) {
      setTimeout(() => res.destroy(), 10);
      return;
    }
    setTimeout(() => res.end("data: [DONE]\n\n"), 10);
  });
});
await new Promise((resolve) => upstream.listen(18788, "127.0.0.1", resolve));

const proxy = spawn(process.execPath, [proxyPath], {
  env: {
    ...process.env,
    DEEPSWE_PROXY_PORT: "18787",
    DEEPSWE_PROXY_ALLOW_PRIVATE_UPSTREAM: "1",
    DEEPSWE_UPSTREAM_BASE_URL: "http://127.0.0.1:18788",
    DEEPSWE_MODEL_SESSION_ID: fixedSessionId,
    DEEPSWE_PROXY_AUDIT_PATH: auditPath,
    DEEPSWE_PROXY_RETRY_BASE_MS: "10",
  },
  stdio: ["ignore", "inherit", "inherit"],
});

try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const health = await fetch("http://127.0.0.1:18787/health");
      if (health.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  const response = await fetch("http://127.0.0.1:18787/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
      "x-deepseek-harness-session-id": originalSessionId,
    },
    body: JSON.stringify({ model: "mock", stream: true, messages: [] }),
  });
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(body, /data: \[DONE\]/);
  assert.equal(receivedHeaders["x-deepseek-harness-session-id"], fixedSessionId);
  assert.equal(receivedHeaders.authorization, `Bearer ${secret}`);
  assert.match(receivedBody, /"stream":true/);

  await assert.rejects(async () => {
    const interrupted = await fetch("http://127.0.0.1:18787/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "mock", stream: true, messages: [] }),
    });
    await interrupted.text();
  });
  const healthAfterDisconnect = await fetch("http://127.0.0.1:18787/health");
  assert.equal(healthAfterDisconnect.status, 200);

  const retried = await fetch("http://127.0.0.1:18787/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: "mock", stream: true, messages: [] }),
  });
  assert.equal(retried.status, 200);
  assert.match(await retried.text(), /data: \[DONE\]/);
  assert.equal(requestCount, 4);

  await new Promise((resolve) => setTimeout(resolve, 20));
  const audit = fs.readFileSync(auditPath, "utf8");
  assert.match(audit, new RegExp(originalSessionId));
  assert.match(audit, new RegExp(fixedSessionId));
  assert.match(audit, /"statusCode":502/);
  assert.match(audit, /"retried":true/);
  assert.doesNotMatch(audit, new RegExp(secret));
  console.log("proxy integration test passed");
} finally {
  proxy.kill();
  await new Promise((resolve) => upstream.close(resolve));
  fs.rmSync(auditPath, { force: true });
}
