# Slack Quote Reply

Slack has no quote-reply. This adds one for Slack **in the browser** (Chrome/Brave):

- **Selection popup** — highlight any part of a message → click **⤷ Reply** → it drops into the composer as a quote.
- **Hover button** — hover a message → click **⤷** → quotes the whole message.

Each quote shows the author's name as a **clickable link** back to the original, with your cursor ready below. Works on `app.slack.com`. The Slack **desktop app is not supported** — a browser extension can't reach it, so use Slack in Chrome/Brave.

## Install

No build step and no dependencies — you just load the folder as an unpacked extension.

1. **Get the files**, either:
   - **Download ZIP** — on the [GitHub page](https://github.com/svwingerden/slack-quote-reply), click **Code ▸ Download ZIP**, then unzip it; or
   - **Clone** — `git clone https://github.com/svwingerden/slack-quote-reply.git`
2. Open **`chrome://extensions`** (or **`brave://extensions`**) and turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `slack-quote-reply` folder — the one containing `manifest.json`.
4. Open or refresh **app.slack.com**. Highlight text in a message (or hover a message) and use the **⤷ Reply** button.

**Updating later:** `git pull` (or re-download the ZIP), then click the **↻ reload** icon on the extension's card in `chrome://extensions`.

## Develop / tests

Only needed if you want to run the tests:

- `npm install` (installs jsdom)
- `npm test` (runs `node --test`)
- After editing source files, hit the **↻ reload** icon on the extension's card.

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
