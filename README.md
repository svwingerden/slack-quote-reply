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
