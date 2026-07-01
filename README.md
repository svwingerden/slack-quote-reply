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
Quotes are inserted as plain text via `execCommand("insertText")`
(`src/inserter.js`); Slack's composer live-converts the mrkdwn as if you typed
it — `>` → quote block, and `[author](url)` → the author's name as a clickable
link to the original message. The quote string is built by `formatQuote` in
`src/formatter.js`.

Note: Slack's own `<url|label>` link syntax does NOT convert on paste (Slack
auto-linkifies the raw URL and drops the label), which is why the standard
markdown `[label](url)` form is used instead.

Inserting a message link makes Slack show an unfurl preview card in the
composer; `src/preview-remover.js` polls for its remove button and dismisses it
(the inline link stays). The button selector (`SELECTORS.unfurlRemove`) is a
best guess — adjust it against live Slack if the preview doesn't disappear.
