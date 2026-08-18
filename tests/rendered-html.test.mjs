import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
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
}

test("server-renders the Korean inference engineering deep dive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ko"/i);
  assert.match(html, /<title>Inference Engineering — Models × Hardware<\/title>/i);
  assert.match(html, /property="og:image" content="https:\/\/inference-engineering-ch2-ch3\.jae-one-lim\.chatgpt\.site\/og\.png"/i);
  assert.match(html, /name="twitter:image" content="https:\/\/inference-engineering-ch2-ch3\.jae-one-lim\.chatgpt\.site\/og\.png"/i);
  assert.match(html, /모델은 무엇을 계산하고/);
  assert.match(html, /Chapter 2 · Models/);
  assert.match(html, /Chapter 3 · Hardware/);
  assert.match(html, /감으로 말하지 말고, 먼저 계산한다/);
  assert.match(html, /더 깊이 읽기/);
  assert.match(html, /https:\/\/www\.baseten\.co\/inference-engineering\//);
  assert.doesNotMatch(html, /Starter Project|react-loading-skeleton|codex-preview/);
});

test("keeps the final source free of starter preview code", async () => {
  const [page, layout, packageJson, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useState/);
  assert.match(page, /FlashAttention/);
  assert.match(page, /PagedAttention/);
  assert.match(page, /audit-note/);
  assert.match(layout, /lang="ko"/);
  assert.match(layout, /Inference Engineering/);
  assert.match(layout, /NEXT_PUBLIC_SITE_URL/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|site-creator-vinext-starter/);
  assert.doesNotMatch(`${page}\n${layout}\n${css}`, /codex-preview|_sites-preview|SkeletonPreview/);
});
