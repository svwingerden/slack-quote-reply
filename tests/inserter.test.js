import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { findComposerFor } from "../src/inserter.js";

function setup() {
  const html = readFileSync(new URL("./fixtures/panes.html", import.meta.url), "utf8");
  const dom = new JSDOM(html, { url: "https://app.slack.com/client/T1/C123" });
  global.window = dom.window;
  global.document = dom.window.document;
  return dom.window.document;
}

test("a thread message resolves to the thread composer", () => {
  const doc = setup();
  assert.equal(findComposerFor(doc.getElementById("threadmsg")).id, "thread-composer");
});

test("a channel message resolves to the channel composer", () => {
  const doc = setup();
  assert.equal(findComposerFor(doc.getElementById("chanmsg")).id, "chan-composer");
});
