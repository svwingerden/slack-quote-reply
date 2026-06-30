# Slack Quote-Reply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Chrome/Brave MV3 extension that adds one-click quote-reply to Slack-in-the-browser, via a selection popup (partial quote) and a hover button (whole message).

**Architecture:** A thin classic content script (`loader.js`) dynamically imports an ES-module entrypoint (`src/main.js`); all logic lives in small ES modules under `src/` so the pure ones are unit-testable under Node. Pure logic (formatting, DOM extraction, composer lookup) is unit-tested with `node --test` + jsdom; browser-only wiring (selection, mutation observer, composer insertion) is verified manually against live Slack.

**Tech Stack:** Vanilla JavaScript (ES modules), Chrome Manifest V3, `node --test` (built-in), jsdom (dev-only).

## Global Constraints

- **Manifest V3**, content script on `https://app.slack.com/*` only. Desktop Slack out of scope.
- **No build step / no bundler.** Modules load via `import(chrome.runtime.getURL(...))`; `src/*.js` must be in `web_accessible_resources`.
- **Minimal permissions:** none beyond the `content_scripts` match. No clipboard, no host_permissions.
- **Every Slack CSS selector lives in `src/selectors.js`** — nowhere else. This is the fragility-containment rule.
- **`chrome.*` APIs only in `loader.js` and `src/main.js`** — never in the pure modules (keeps them testable under Node).
- American English spelling. ES modules everywhere (`"type": "module"`).
- Output quote format: every quoted line prefixed `> `; author as bold prefix on the first line `*Author:*`; permalink as a final quoted line.

---

## File Structure

| File | Responsibility |
|---|---|
| `manifest.json` | MV3 manifest; registers `loader.js` + `styles.css` on `app.slack.com`; declares `src/*.js` web-accessible. |
| `loader.js` | Classic content script. One line: dynamic-import `src/main.js`. |
| `src/main.js` | Entrypoint. Wires triggers → `handleQuote()`. Only file besides loader using `chrome.*`. |
| `src/selectors.js` | `SELECTORS` object — every Slack CSS selector. |
| `src/formatter.js` | Pure: `{text,author,permalink} → quote string`. |
| `src/extractor.js` | DOM read: message text / author / permalink; `findMessageRoot`. |
| `src/inserter.js` | Composer lookup + text insertion. |
| `src/selection-watcher.js` | Selection popup trigger. |
| `src/hover-button.js` | Hover-toolbar button trigger (MutationObserver). |
| `src/toast.js` | Transient status message (error path). |
| `styles.css` | Styles for the two buttons + toast. |
| `package.json` | `"type":"module"`, `test` script, jsdom dev dep. |
| `tests/formatter.test.js` | Unit tests for formatter. |
| `tests/extractor.test.js` | Unit tests for extractor (jsdom + fixture). |
| `tests/inserter.test.js` | Unit test for `findComposerFor` (jsdom + fixture). |
| `tests/fixtures/messages.html` | Two grouped Slack messages. |
| `tests/fixtures/panes.html` | Channel + thread panes, each with a composer. |
| `README.md` | Install (Load unpacked), dev/test, the insertion spike note. |

---

### Task 1: Scaffold — extension loads on Slack

**Files:**
- Create: `manifest.json`, `loader.js`, `src/main.js`, `styles.css`, `package.json`, `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a loadable extension; `src/main.js` is the import target later tasks replace/extend.

- [ ] **Step 1: Write `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Slack Quote Reply",
  "version": "0.1.0",
  "description": "One-click quote-reply for Slack web.",
  "content_scripts": [
    {
      "matches": ["https://app.slack.com/*"],
      "js": ["loader.js"],
      "css": ["styles.css"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    { "resources": ["src/*.js"], "matches": ["https://app.slack.com/*"] }
  ]
}
```

- [ ] **Step 2: Write `loader.js`**

```js
import(chrome.runtime.getURL("src/main.js"));
```

- [ ] **Step 3: Write `src/main.js` (stub)**

```js
console.info("[slack-quote-reply] loaded");
```

- [ ] **Step 4: Write `styles.css`**

```css
.sqr-quote-btn {
  position: absolute;
  z-index: 99999;
  display: none;
  padding: 4px 8px;
  font: 12px/1.2 Slack-Lato, Lato, sans-serif;
  background: #1264a3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.sqr-hover-btn {
  margin-right: 4px;
  padding: 0 6px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.sqr-hover-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}
.sqr-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  background: #350d36;
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  font: 13px/1.3 sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 5: Write `package.json`**

```json
{
  "name": "slack-quote-reply",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": { "test": "node --test" },
  "devDependencies": { "jsdom": "^24.0.0" }
}
```

- [ ] **Step 6: Write `README.md`**

```markdown
# Slack Quote Reply

One-click quote-reply for Slack in the browser (Chrome/Brave). Adds:
- a **selection popup** — highlight text in a message → "⤷ Quote" → it lands in the composer
- a **hover button** — hover a message → quote the whole thing

Desktop Slack (Electron) is not supported — browser only.

## Install (unpacked)
1. `chrome://extensions` → enable Developer mode.
2. "Load unpacked" → select this folder.
3. Open `app.slack.com`. Console should log `[slack-quote-reply] loaded`.

## Develop
- `npm install` (jsdom, for tests)
- `npm test` (runs `node --test`)
- After editing files, hit the reload icon on the extension card.

## Note on insertion
Quotes are inserted as `> …` text, which Slack renders as a blockquote. If the
default WYSIWYG composer ever stops rendering programmatically-inserted `>` as a
quote, the only change needed is the body of `insertIntoComposer` in
`src/inserter.js` (swap the `execCommand` call for a synthetic `paste` carrying
`text/html` `<blockquote>` + `text/plain`).
```

- [ ] **Step 7: Verify it loads (manual)**

Run: load unpacked at `chrome://extensions`, open `app.slack.com`, open DevTools console.
Expected: `[slack-quote-reply] loaded` appears, no errors.

- [ ] **Step 8: Commit**

```bash
git add manifest.json loader.js src/main.js styles.css package.json README.md
git commit -m "feat: scaffold MV3 extension that loads on Slack web"
```

---

### Task 2: Formatter (pure, TDD)

**Files:**
- Create: `src/formatter.js`, `tests/formatter.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `formatQuote({ text, author, permalink }) -> string` (quote lines joined by `\n`, no trailing newline).

- [ ] **Step 1: Write the failing test (`tests/formatter.test.js`)**

```js
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
    "> *Alice:* can you rerun the triangle job\n> with the new seed?\n> https://x/p1",
  );
});

test("no author", () => {
  const out = formatQuote({ text: "hello\nworld", author: "", permalink: "https://x/p2" });
  assert.equal(out, "> hello\n> world\n> https://x/p2");
});

test("no permalink", () => {
  const out = formatQuote({ text: "hi", author: "Bob", permalink: "" });
  assert.equal(out, "> *Bob:* hi");
});

test("blank line within text becomes a bare '>'", () => {
  const out = formatQuote({ text: "a\n\nb", author: "", permalink: "" });
  assert.equal(out, "> a\n>\n> b");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/formatter.js'` (or `formatQuote is not a function`).

- [ ] **Step 3: Write minimal implementation (`src/formatter.js`)**

```js
export function formatQuote({ text = "", author = "", permalink = "" }) {
  const lines = text.split("\n");
  if (author) {
    lines[0] = `*${author}:* ${lines[0]}`;
  }
  const quoted = lines.map((line) => `> ${line}`.trimEnd());
  if (permalink) {
    quoted.push(`> ${permalink}`);
  }
  return quoted.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/formatter.js tests/formatter.test.js
git commit -m "feat: formatQuote - build blockquote text with author + permalink"
```

---

### Task 3: Extractor (DOM read, TDD with jsdom)

**Files:**
- Create: `src/selectors.js`, `src/extractor.js`, `tests/extractor.test.js`, `tests/fixtures/messages.html`

**Interfaces:**
- Consumes: `SELECTORS` from `src/selectors.js`.
- Produces:
  - `extractMessage(messageEl) -> { text, author, permalink }`
  - `findMessageRoot(node) -> Element | null`
  - `richTextToPlain(el) -> string`

- [ ] **Step 1: Write `src/selectors.js`**

```js
export const SELECTORS = {
  message: ".c-message_kit__message",
  listItem: ".c-virtual_list__item",
  sender: ".c-message__sender_button",
  timestamp: "a.c-timestamp",
  body: ".c-message__body",
  richSection: ".p-rich_text_section",
  composer: ".ql-editor",
  primaryPane: ".p-workspace__primary_view",
  threadPane: ".p-flexpane",
  hoverActions: ".c-message_actions__container",
};
```

- [ ] **Step 2: Write the fixture (`tests/fixtures/messages.html`)**

```html
<div class="c-virtual_list__item">
  <div class="c-message_kit__message" id="msg1">
    <a class="c-message__sender_button">Alice</a>
    <a class="c-timestamp" href="/archives/C123/p1700000000000200"></a>
    <div class="c-message__body">
      <div class="p-rich_text_section">can you rerun the triangle job<br />with the new seed?</div>
    </div>
  </div>
</div>
<div class="c-virtual_list__item">
  <div class="c-message_kit__message" id="msg2">
    <a class="c-timestamp" href="/archives/C123/p1700000000000300"></a>
    <div class="c-message__body">
      <div class="p-rich_text_section">also bump the LR</div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Write the failing test (`tests/extractor.test.js`)**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { extractMessage, findMessageRoot } from "../src/extractor.js";

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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm install && npm test`
Expected: FAIL — `Cannot find module '../src/extractor.js'`.

- [ ] **Step 5: Write the implementation (`src/extractor.js`)**

```js
import { SELECTORS } from "./selectors.js";

export function richTextToPlain(el) {
  if (!el) return "";
  const sections = el.querySelectorAll(SELECTORS.richSection);
  const blocks = sections.length ? Array.from(sections) : [el];
  return blocks
    .map((block) => {
      let out = "";
      for (const node of block.childNodes) {
        out += node.nodeName === "BR" ? "\n" : node.textContent;
      }
      return out;
    })
    .join("\n")
    .trim();
}

export function findMessageRoot(node) {
  const el = node?.nodeType === 1 ? node : node?.parentElement;
  return el ? el.closest(SELECTORS.message) : null;
}

export function findAuthor(messageEl) {
  const own = messageEl.querySelector(SELECTORS.sender);
  if (own) return own.textContent.trim();
  let item = messageEl.closest(SELECTORS.listItem) || messageEl;
  for (let i = 0; i < 50 && item; i++) {
    item = item.previousElementSibling;
    const sender = item?.querySelector?.(SELECTORS.sender);
    if (sender) return sender.textContent.trim();
  }
  return "";
}

export function getPermalink(messageEl) {
  const href = messageEl.querySelector(SELECTORS.timestamp)?.getAttribute("href");
  if (!href) return "";
  try {
    return new URL(href, window.location.href).href;
  } catch {
    return "";
  }
}

export function extractMessage(messageEl) {
  return {
    text: richTextToPlain(messageEl.querySelector(SELECTORS.body)),
    author: findAuthor(messageEl),
    permalink: getPermalink(messageEl),
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS (formatter + extractor tests).

- [ ] **Step 7: Commit**

```bash
git add src/selectors.js src/extractor.js tests/extractor.test.js tests/fixtures/messages.html
git commit -m "feat: extract message text, author, permalink from Slack DOM"
```

> **During the live spike (Task 5), re-capture a real Slack message's `outerHTML` from
> DevTools into `tests/fixtures/messages.html` and reconcile `SELECTORS` against it.**
> The fixture here is structurally faithful but synthetic; real class names are the
> known fragility and must be confirmed against live Slack.

---

### Task 4: Inserter — composer lookup (TDD) + insertion (manual)

**Files:**
- Create: `src/inserter.js`, `tests/inserter.test.js`, `tests/fixtures/panes.html`

**Interfaces:**
- Consumes: `SELECTORS`.
- Produces:
  - `findComposerFor(messageEl) -> Element | null`
  - `insertIntoComposer(messageEl, quoteText) -> boolean`

- [ ] **Step 1: Write the fixture (`tests/fixtures/panes.html`)**

```html
<div class="p-workspace__primary_view">
  <div class="c-message_kit__message" id="chanmsg"></div>
  <div class="ql-editor" id="chan-composer"></div>
</div>
<div class="p-flexpane">
  <div class="c-message_kit__message" id="threadmsg"></div>
  <div class="ql-editor" id="thread-composer"></div>
</div>
```

- [ ] **Step 2: Write the failing test (`tests/inserter.test.js`)**

```js
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/inserter.js'`.

- [ ] **Step 4: Write the implementation (`src/inserter.js`)**

```js
import { SELECTORS } from "./selectors.js";

export function findComposerFor(messageEl) {
  const pane =
    messageEl.closest(SELECTORS.threadPane) ||
    messageEl.closest(SELECTORS.primaryPane) ||
    document;
  return pane.querySelector(SELECTORS.composer);
}

export function insertIntoComposer(messageEl, quoteText) {
  const composer = findComposerFor(messageEl);
  if (!composer) return false;
  composer.focus();
  const sel = window.getSelection();
  sel.selectAllChildren(composer);
  sel.collapseToEnd();
  return document.execCommand("insertText", false, quoteText + "\n\n");
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (thread + channel composer resolution).

- [ ] **Step 6: Commit**

```bash
git add src/inserter.js tests/inserter.test.js tests/fixtures/panes.html
git commit -m "feat: resolve the right composer per pane and insert quote text"
```

---

### Task 5: Selection popup + wiring (manual e2e — the insertion spike)

**Files:**
- Create: `src/selection-watcher.js`, `src/toast.js`
- Modify: `src/main.js` (replace the stub)

**Interfaces:**
- Consumes: `extractMessage`, `findMessageRoot`, `formatQuote`, `insertIntoComposer`.
- Produces:
  - `initSelectionWatcher(onQuote)` where `onQuote(messageEl, selectedText)`
  - `showToast(message)`
  - `handleQuote(messageEl, textOverride = null)` (in `main.js`)

- [ ] **Step 1: Write `src/toast.js`**

```js
export function showToast(message) {
  const el = document.createElement("div");
  el.className = "sqr-toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
```

- [ ] **Step 2: Write `src/selection-watcher.js`**

```js
import { findMessageRoot } from "./extractor.js";

let btn = null;

function ensureButton() {
  if (btn) return btn;
  btn = document.createElement("button");
  btn.className = "sqr-quote-btn";
  btn.type = "button";
  btn.textContent = "⤷ Quote";
  document.body.appendChild(btn);
  return btn;
}

function hide() {
  if (btn) btn.style.display = "none";
}

export function initSelectionWatcher(onQuote) {
  document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (!text || sel.rangeCount === 0) return hide();
    const messageEl = findMessageRoot(sel.anchorNode);
    if (!messageEl) return hide();

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const b = ensureButton();
    b.onmousedown = (e) => {
      // mousedown + preventDefault so the page selection isn't cleared first
      e.preventDefault();
      e.stopPropagation();
      const current = window.getSelection().toString().trim() || text;
      hide();
      onQuote(messageEl, current);
    };
    b.style.display = "block";
    b.style.top = `${window.scrollY + rect.top - 36}px`;
    b.style.left = `${window.scrollX + rect.left}px`;
  });
  document.addEventListener("scroll", hide, true);
}
```

- [ ] **Step 3: Replace `src/main.js`**

```js
import { extractMessage } from "./extractor.js";
import { formatQuote } from "./formatter.js";
import { insertIntoComposer } from "./inserter.js";
import { initSelectionWatcher } from "./selection-watcher.js";
import { showToast } from "./toast.js";

function handleQuote(messageEl, textOverride = null) {
  const info = extractMessage(messageEl);
  const text = textOverride != null ? textOverride : info.text;
  const quote = formatQuote({ ...info, text });
  if (!insertIntoComposer(messageEl, quote)) {
    showToast("Couldn't find the message box to insert the quote.");
  }
}

initSelectionWatcher((messageEl, selectedText) => handleQuote(messageEl, selectedText));
console.info("[slack-quote-reply] active (selection)");
```

- [ ] **Step 4: Verify in live Slack (manual — THE SPIKE)**

Run: reload the extension, open `app.slack.com`, open a channel.
1. Highlight part of a message → expect a "⤷ Quote" button near the selection.
2. Click it → expect the composer to receive:
   ```
   > *Author:* <the highlighted text>
   > <permalink>
   ```
   with the cursor on a blank line below.
3. **Critically:** confirm Slack renders it as an actual blockquote (grey bar), not literal `> ` text. Test in **both** composer modes (default, and Preferences → Advanced → "Format messages with markup").

Expected: a real blockquote in both modes.
If literal `> ` shows in the default WYSIWYG composer: apply the contingency from
`README.md` — swap the body of `insertIntoComposer` for a synthetic `paste` carrying
`text/html` (`<blockquote>` of the lines) + `text/plain` (the `> …` string), then
re-verify. No other file changes.

- [ ] **Step 5: Commit**

```bash
git add src/selection-watcher.js src/toast.js src/main.js
git commit -m "feat: selection-popup quote trigger + wiring"
```

---

### Task 6: Hover button (whole-message trigger, manual e2e)

**Files:**
- Create: `src/hover-button.js`
- Modify: `src/main.js` (add the hover wiring)

**Interfaces:**
- Consumes: `SELECTORS`, `findMessageRoot`, and `handleQuote` (via the `onQuote` callback).
- Produces: `initHoverButtons(onQuote)` where `onQuote(messageEl)` (whole message — no text override).

- [ ] **Step 1: Write `src/hover-button.js`**

```js
import { SELECTORS } from "./selectors.js";
import { findMessageRoot } from "./extractor.js";

const MARK = "data-sqr-injected";

function makeButton(messageEl, onQuote) {
  const b = document.createElement("button");
  b.className = "sqr-hover-btn";
  b.type = "button";
  b.title = "Quote reply";
  b.textContent = "⤷";
  b.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuote(messageEl);
  });
  return b;
}

function inject(root, onQuote) {
  root.querySelectorAll?.(SELECTORS.hoverActions).forEach((bar) => {
    if (bar.hasAttribute(MARK)) return;
    const messageEl = findMessageRoot(bar);
    if (!messageEl) return;
    bar.setAttribute(MARK, "1");
    bar.prepend(makeButton(messageEl, onQuote));
  });
}

export function initHoverButtons(onQuote) {
  inject(document, onQuote);
  new MutationObserver((muts) => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) inject(node, onQuote);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}
```

- [ ] **Step 2: Update `src/main.js` (full file)**

```js
import { extractMessage } from "./extractor.js";
import { formatQuote } from "./formatter.js";
import { insertIntoComposer } from "./inserter.js";
import { initSelectionWatcher } from "./selection-watcher.js";
import { initHoverButtons } from "./hover-button.js";
import { showToast } from "./toast.js";

function handleQuote(messageEl, textOverride = null) {
  const info = extractMessage(messageEl);
  const text = textOverride != null ? textOverride : info.text;
  const quote = formatQuote({ ...info, text });
  if (!insertIntoComposer(messageEl, quote)) {
    showToast("Couldn't find the message box to insert the quote.");
  }
}

initSelectionWatcher((messageEl, selectedText) => handleQuote(messageEl, selectedText));
initHoverButtons((messageEl) => handleQuote(messageEl));
console.info("[slack-quote-reply] active (selection + hover)");
```

- [ ] **Step 3: Verify in live Slack (manual)**

Run: reload the extension, open a channel.
1. Hover a message → expect a "⤷" button in the hover action toolbar.
2. Click it → expect the **whole** message quoted into the composer with author + permalink, cursor below.
3. Scroll the channel up and down → expect buttons to keep appearing on newly-rendered messages (no duplicates on a single message).
4. Open a thread → expect hover buttons there too, inserting into the thread composer.

Expected: all four behave; the rendered result is a real blockquote.
If the hover button never appears, the `hoverActions` selector is wrong — capture the
real toolbar element's class in DevTools and fix `SELECTORS.hoverActions` only.

- [ ] **Step 4: Commit**

```bash
git add src/hover-button.js src/main.js
git commit -m "feat: hover-toolbar quote trigger for whole messages"
```

---

## Self-Review

**Spec coverage:**
- Two triggers — selection popup (Task 5), hover button (Task 6). ✓
- Format `> *Author:*` + text + permalink — formatter (Task 2). ✓
- Author + permalink extraction, grouped-message author walk — extractor (Task 3). ✓
- Auto-insert into correct (channel/thread) composer — inserter (Task 4), wired in 5/6. ✓
- Centralized `SELECTORS` — Task 3, used everywhere. ✓
- Insertion contingency isolated to one function — noted in README (Task 1) and Task 5 spike. ✓
- Testing: formatter unit, extractor jsdom fixture, composer-lookup jsdom fixture, manual QA checklist (Tasks 5/6). ✓
- Standalone repo location — already created. ✓
- Desktop out of scope — Global Constraints + README. ✓

**Placeholder scan:** none — every code step is complete.

**Type consistency:** `formatQuote({text,author,permalink})`, `extractMessage→{text,author,permalink}`, `findMessageRoot`, `findComposerFor`, `insertIntoComposer(messageEl, quoteText)`, `handleQuote(messageEl, textOverride)`, `initSelectionWatcher(onQuote)`, `initHoverButtons(onQuote)`, `showToast` — names and signatures match across all tasks. ✓
