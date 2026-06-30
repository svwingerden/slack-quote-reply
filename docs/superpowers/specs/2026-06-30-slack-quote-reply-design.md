# Slack Quote-Reply — Design

**Date:** 2026-06-30
**Status:** Approved for planning

## Problem

Slack has no native quote-reply (unlike Discord/Telegram/iMessage). Replying to a
specific message means: select the text, copy it, paste it, prefix each line with
`> `, then write underneath. Tedious and manual.

## Goal

A Chrome/Brave extension that adds a one-click "quote reply" to Slack-in-the-browser,
producing a properly formatted quote in the composer with the cursor placed below,
ready to type.

## Scope

- **In:** Slack web app (`app.slack.com`) in Chrome/Brave. Two trigger surfaces.
  Auto-insert into the composer (one click, no manual paste).
- **Out:** The Slack desktop (Electron) app — a browser extension cannot reach it.
  Same logic could later be force-injected into the desktop app, but that breaks on
  every Slack auto-update and violates ToS, so it is explicitly deferred.

## Approach (and rejected alternatives)

**Chosen: Manifest V3 content-script extension on `app.slack.com`.** The only clean
way to both add UI to each message and write into the real composer.

- *Rejected — Slack app + message shortcut:* runs server-side, cannot write into the
  client composer; best case is a modal you retype into, which is worse than today.
- *Rejected — patching the desktop Electron app:* fragile across auto-updates, against
  ToS.

## Triggers (two surfaces, one engine)

| Trigger | Interaction | Quoted text |
|---|---|---|
| **Selection popup** | Highlight text inside a message → a floating "⤷ Quote" button appears near the selection | Exactly the highlighted text |
| **Hover button** | Hover a message → a button in Slack's existing hover toolbar | The whole message body |

Both resolve the **author** and **permalink** from the message containing the quoted
text, run the same formatter, and use the same inserter. A selection spanning multiple
messages anchors to the message where the selection *starts*.

The selection popup is the more robust of the two (our own floating element, positioned
off the selection's bounding box — no dependency on Slack's self-re-rendering toolbar).
The hover button is the more fragile and is the first thing to drop if Slack's toolbar
markup churns.

## Output format

Inserted into the composer, cursor on the blank line below:

```
> *Alice:* can you rerun the triangle job with the new seed?
> <permalink-to-original>

█
```

- Author attribution as the first quoted line (`> *Name:*` then the text).
- Permalink as a final quoted line.
- Multi-line quoted text: every line prefixed with `> `.

## Components

A single content script, kept modular by responsibility:

| Module | Responsibility |
|---|---|
| `SELECTORS` | One object at the top of the file holding **every** Slack CSS selector. Slack's obfuscated class names are the extension's main fragility; centralizing them means a Slack rename is a one-line fix. |
| `observer` | A `MutationObserver` that (re-)injects the hover button as Slack virtualizes/re-renders the message list on scroll. Idempotent — never double-injects. |
| `selectionWatcher` | Listens for `mouseup`/`selectionchange`; when a non-empty selection lands inside a message, shows the floating quote button positioned via the selection's `getBoundingClientRect()`. |
| `extractor` | Given a message element, returns `{ text, author, permalink }`. Author walks up to the group header when the message is grouped under a single name. Permalink is read from the message's timestamp anchor `href` (made absolute against the workspace origin). |
| `formatter` (pure) | `{ text, author, permalink } → quote string`. No DOM, no side effects — unit-tested. |
| `inserter` | Focuses the active composer (`.ql-editor`) and inserts the quote text via `document.execCommand('insertText', …)`, leaving the cursor below. |
| `toast` | Tiny transient status element (e.g. for the rare error path). |

## Insertion mechanism

Insert the formatted `> …` text into the focused composer as plain text
(`document.execCommand('insertText')` or equivalent caret insertion). Slack renders a
leading `>` as a blockquote, so this is the simplest mechanism that produces the desired
result.

**Contingency (isolated to the `inserter` module):** if the default WYSIWYG composer
declines to render *programmatically*-inserted `> …` as a quote, swap the inserter's
single insertion call for a synthetic `paste` event carrying both `text/html`
(`<blockquote>…</blockquote>`) and `text/plain` (`> …`). This is a one-function change,
not a redesign. Confirm the simple path works in the live composer before building out
the rest.

## Testing

- **Formatter:** real unit tests (pure function — author/no-author, single/multi-line,
  permalink present/absent).
- **Extractor:** run selectors against a saved snippet of real Slack message HTML
  (jsdom fixture) — covers grouped vs. ungrouped messages.
- **Manual QA checklist:** grouped messages, threads vs. channel, code blocks/emoji,
  selection vs. hover, multiple workspaces.

## Risks

- **Slack DOM churn** — obfuscated class names can change with Slack releases. Mitigated
  by the centralized `SELECTORS` object; not eliminated.
- **Composer insertion** — see contingency above. Low residual risk.
- **Desktop app** — not covered (out of scope).

## Location

Standalone repo at `~/timaeus/slack-quote-reply/`, loaded via `chrome://extensions` →
"Load unpacked". Not part of the SRI monorepo.
