import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { extractMessage, findMessageRoot, findAuthor } from "../src/extractor.js";

function setup() {
  const html = readFileSync(new URL("./fixtures/messages.html", import.meta.url), "utf8");
  const dom = new JSDOM(html, { url: "https://app.slack.com/client/T1/C123" });
  global.window = dom.window;
  global.document = dom.window.document;
  return dom.window.document;
}

test("extracts text, author, permalink from a standalone message", () => {
  const doc = setup();
  const r = extractMessage(doc.getElementById("msg1"));
  assert.equal(r.text, "can you rerun the triangle job\nwith the new seed?");
  assert.equal(r.author, "Alice");
  assert.equal(r.permalink, "https://app.slack.com/archives/C123/p1700000000000200");
});

test("grouped message inherits author from the previous message", () => {
  const doc = setup();
  const r = extractMessage(doc.getElementById("msg2"));
  assert.equal(r.author, "Alice");
  assert.equal(r.text, "also bump the LR");
});

test("findMessageRoot walks up from a descendant node", () => {
  const doc = setup();
  const body = doc.querySelector("#msg2 .c-message__body");
  assert.equal(findMessageRoot(body).id, "msg2");
});

test("findMessageRoot resolves from a text node (not just an element)", () => {
  const doc = setup();
  const textNode = doc.querySelector("#msg1 .p-rich_text_section").firstChild;
  assert.equal(findMessageRoot(textNode).id, "msg1");
});

test("findAuthor walks back multiple messages to the group's sender", () => {
  const doc = setup();
  assert.equal(findAuthor(doc.getElementById("msg3")), "Alice");
});
