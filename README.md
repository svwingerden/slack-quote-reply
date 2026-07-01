# Slack Quote Reply

One-click quote-reply for Slack in the browser (Chrome/Brave). Adds:
- a **selection popup** — highlight text in a message → "⤷ Quote" → it lands in the composer
- a **hover button** — hover a message → quote the whole thing

Desktop Slack (Electron) is not supported — browser only.

## Install (unpacked)
1. `chrome://extensions` → enable Developer mode.
2. "Load unpacked" → select this folder.
3. Open `app.slack.com`. Console should log `[slack-quote-reply] active (selection + hover)`.

## Develop
- `npm install` (jsdom, for tests)
- `npm test` (runs `node --test`)
- After editing files, hit the reload icon on the extension card.

## Note on insertion
Quotes are inserted by dispatching a synthetic `paste` event at the composer
carrying two arms (`src/inserter.js`):
- `text/html` — a `<blockquote>` with a bold author, the quoted text, and a
  clickable `↗ original` link. The default WYSIWYG composer turns this into a
  real quote block.
- `text/plain` — the mrkdwn equivalent (`> …` with `<url|↗ original>`), which
  the "Format messages with markup" mode and the on-send parser honor.

The composer takes whichever arm its mode understands, so both settings work.
The two rendered forms are built by `formatQuoteHtml` / `formatQuote` in
`src/formatter.js`.
