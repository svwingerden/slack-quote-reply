import { SELECTORS } from "./selectors.js";
import { findComposerFor } from "./inserter.js";

const HIDE_CLASS = "sqr-suppressing-unfurl";

// Inserting a message link makes Slack fetch an unfurl and show a draft preview
// card in the composer. We hide it (via HIDE_CLASS + CSS) so it never visibly
// flashes, then — because the card must exist for us to act on it — synthesize a
// hover to mount its ✕ and click it. Clicking the ✕ also tells Slack not to
// unfurl the link when the message is sent, so recipients see just the link.
export function dismissLinkPreview(messageEl, attempts = 30, intervalMs = 150) {
  const composer = findComposerFor(messageEl);
  const scope =
    composer?.closest(SELECTORS.threadPane) ||
    composer?.closest(SELECTORS.primaryPane) ||
    document;
  document.body.classList.add(HIDE_CLASS);
  let tries = 0;
  let sawCard = false;
  let timer;
  const stop = () => {
    clearInterval(timer);
    document.body.classList.remove(HIDE_CLASS);
  };
  timer = setInterval(() => {
    if (++tries > attempts) return stop();
    const card = scope.querySelector(SELECTORS.unfurlPreview);
    if (!card) {
      if (sawCard) stop(); // preview removed → done
      return;
    }
    sawCard = true;
    const hit = scope.querySelector(SELECTORS.unfurlRemove);
    if (hit) {
      (hit.closest('button, [role="button"]') || hit).click();
    } else {
      // The ✕ mounts only while hovered — fire mouseover across the card so
      // React fires onMouseEnter for whichever element gates it.
      [card, ...card.querySelectorAll("*")].forEach((el) =>
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })),
      );
    }
  }, intervalMs);
}
