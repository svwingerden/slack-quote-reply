import { test } from "node:test";
import assert from "node:assert/strict";
import { formatQuote } from "../src/formatter.js";

test("author + permalink: the name is the clickable link (multi-line)", () => {
  const out = formatQuote({
    text: "can you rerun the triangle job\nwith the new seed?",
    author: "Alice",
    permalink: "https://x/p1",
  });
  assert.equal(
    out,
    "> *[Alice](https://x/p1):* can you rerun the triangle job\n> with the new seed?",
  );
});

test("author + permalink: single line keeps the link on the name", () => {
  const out = formatQuote({ text: "hey", author: "Alice", permalink: "https://x/p3" });
  assert.equal(out, "> *[Alice](https://x/p3):* hey");
});

test("author, no permalink: falls back to a bold name", () => {
  const out = formatQuote({ text: "hi", author: "Bob", permalink: "" });
  assert.equal(out, "> *Bob:* hi");
});

test("no author: no prefix and no link (even if a permalink exists)", () => {
  const out = formatQuote({ text: "hello\nworld", author: "", permalink: "https://x/p2" });
  assert.equal(out, "> hello\n> world");
});

test("blank line within text becomes a bare '>'", () => {
  const out = formatQuote({ text: "a\n\nb", author: "", permalink: "" });
  assert.equal(out, "> a\n>\n> b");
});
