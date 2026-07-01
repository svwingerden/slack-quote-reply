import { SELECTORS } from "./selectors.js";
import { findComposerFor } from "./inserter.js";

// Inserting a message link makes Slack fetch an unfurl and show a draft preview
// card in the composer. Its ✕ mounts only while the card is hovered, so poll:
// synthesize a hover to mount the ✕, then click it. The inline link stays; only
// the preview card goes.
export function dismissLinkPreview(messageEl, attempts = 24, intervalMs = 250) {
  const composer = findComposerFor(messageEl);
  const scope =
    composer?.closest(SELECTORS.threadPane) ||
    composer?.closest(SELECTORS.primaryPane) ||
    document;
  let tries = 0;
  let sawCard = false;
  const timer = setInterval(() => {
    if (++tries > attempts) {
      clearInterval(timer);
      return;
    }
    const card = scope.querySelector(SELECTORS.unfurlPreview);
    if (!card) {
      if (sawCard) clearInterval(timer); // preview removed → done
      return;
    }
    sawCard = true;
    const hit = scope.querySelector(SELECTORS.unfurlRemove);
    if (hit) {
      (hit.closest('button, [role="button"]') || hit).click();
    } else {
      // Fire mouseover across the card so React fires onMouseEnter for whichever
      // element gates the ✕, mounting it before the next tick clicks it.
      [card, ...card.querySelectorAll("*")].forEach((el) =>
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })),
      );
    }
  }, intervalMs);
}
