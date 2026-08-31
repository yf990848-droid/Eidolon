import assert from "node:assert/strict";
import test from "node:test";

test("renders the Paper Realm home page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /纸境/);
  assert.match(html, /白天属于面包/);
});

test("renders the style library page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `styles-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/styles", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /个人文风库/);
  assert.match(html, /中外文学特征/);
});

test("renders distinct length flow in the studio", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `studio-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/studio", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /大纲与章数/);
  assert.match(html, /逐章创作/);
});

test("supports short story and chapter outline agent tasks", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `length-tasks-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };

  const shortResponse = await worker.fetch(new Request("http://localhost/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "short-story", input: { length: "短篇" } }),
  }), env, context);
  assert.equal(shortResponse.status, 200);
  const shortPayload = await shortResponse.json();
  assert.equal(typeof shortPayload.data, "string");

  const outlineResponse = await worker.fetch(new Request("http://localhost/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "chapter-outline", input: { length: "长篇", chapterCount: 10 } }),
  }), env, context);
  assert.equal(outlineResponse.status, 200);
  const outlinePayload = await outlineResponse.json();
  assert.equal(outlinePayload.data.chapters.length, 10);
});
