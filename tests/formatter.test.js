import { test } from "node:test";
import assert from "node:assert/strict";
import { formatQuote, formatQuoteHtml } from "../src/formatter.js";

test("author + permalink, multi-line text", () => {
  const out = formatQuote({
    text: "can you rerun the triangle job\nwith the new seed?",
    author: "Alice",
    permalink: "https://x/p1",
  });
  assert.equal(
    out,
    "> *Alice:* can you rerun the triangle job\n> with the new seed?\n> <https://x/p1|↗ original>",
  );
});

test("no author", () => {
  const out = formatQuote({ text: "hello\nworld", author: "", permalink: "https://x/p2" });
  assert.equal(out, "> hello\n> world\n> <https://x/p2|↗ original>");
});

test("no permalink", () => {
  const out = formatQuote({ text: "hi", author: "Bob", permalink: "" });
  assert.equal(out, "> *Bob:* hi");
});

test("blank line within text becomes a bare '>'", () => {
  const out = formatQuote({ text: "a\n\nb", author: "", permalink: "" });
  assert.equal(out, "> a\n>\n> b");
});

test("html: author + permalink becomes a blockquote with a clickable link", () => {
  const out = formatQuoteHtml({
    text: "line one\nline two",
    author: "Alice",
    permalink: "https://x/p1",
  });
  assert.equal(
    out,
    '<blockquote><strong>Alice:</strong> line one<br>line two <a href="https://x/p1">↗ original</a></blockquote>',
  );
});

test("html: no author, no permalink", () => {
  const out = formatQuoteHtml({ text: "hi", author: "", permalink: "" });
  assert.equal(out, "<blockquote>hi</blockquote>");
});

test("html: escapes special characters in text and author", () => {
  const out = formatQuoteHtml({ text: "a < b & c", author: "A&B", permalink: "" });
  assert.equal(out, "<blockquote><strong>A&amp;B:</strong> a &lt; b &amp; c</blockquote>");
});
