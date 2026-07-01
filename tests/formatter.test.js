import { test } from "node:test";
import assert from "node:assert/strict";
import { formatQuote } from "../src/formatter.js";

test("author + permalink, multi-line text", () => {
  const out = formatQuote({
    text: "can you rerun the triangle job\nwith the new seed?",
    author: "Alice",
    permalink: "https://x/p1",
  });
  assert.equal(
    out,
    "> *Alice:* can you rerun the triangle job\n> with the new seed? [↗ original](https://x/p1)",
  );
});

test("no author", () => {
  const out = formatQuote({ text: "hello\nworld", author: "", permalink: "https://x/p2" });
  assert.equal(out, "> hello\n> world [↗ original](https://x/p2)");
});

test("no permalink", () => {
  const out = formatQuote({ text: "hi", author: "Bob", permalink: "" });
  assert.equal(out, "> *Bob:* hi");
});

test("blank line within text becomes a bare '>'", () => {
  const out = formatQuote({ text: "a\n\nb", author: "", permalink: "" });
  assert.equal(out, "> a\n>\n> b");
});

test("single-line author + permalink keeps link inline on the same line", () => {
  const out = formatQuote({ text: "hey", author: "Alice", permalink: "https://x/p3" });
  assert.equal(out, "> *Alice:* hey [↗ original](https://x/p3)");
});
