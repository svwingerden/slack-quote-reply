import { SELECTORS } from "./selectors.js";
import { findComposerFor } from "./inserter.js";

// Inserting a message link makes Slack fetch an unfurl and show a preview card
// in the composer. It arrives async, so poll briefly for its remove button and
// dismiss it — the inline link stays, only the preview card goes.
export function dismissLinkPreview(messageEl, attempts = 15, intervalMs = 300) {
  const composer = findComposerFor(messageEl);
  const scope =
    composer?.closest(SELECTORS.threadPane) ||
    composer?.closest(SELECTORS.primaryPane) ||
    document;
  let tries = 0;
  const timer = setInterval(() => {
    const btn = scope.querySelector(SELECTORS.unfurlRemove);
    if (btn) {
      btn.click();
      clearInterval(timer);
    } else if (++tries >= attempts) {
      clearInterval(timer);
    }
  }, intervalMs);
}
