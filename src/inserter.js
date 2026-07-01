import { SELECTORS } from "./selectors.js";

export function findComposerFor(messageEl) {
  const pane =
    messageEl.closest(SELECTORS.threadPane) ||
    messageEl.closest(SELECTORS.primaryPane) ||
    document;
  return pane.querySelector(SELECTORS.composer);
}

// Insert as plain text; Slack's composer live-converts the mrkdwn (`>` quote,
// `*bold*`, `[label](url)` link) as if typed.
export function insertIntoComposer(messageEl, quoteText) {
  const composer = findComposerFor(messageEl);
  if (!composer) return false;
  composer.focus();
  const sel = window.getSelection();
  sel.selectAllChildren(composer);
  sel.collapseToEnd();
  // If there's already a draft, start the quote on a fresh line below it.
  const lead = composer.textContent.trim() ? "\n" : "";
  return document.execCommand("insertText", false, lead + quoteText + "\n\n");
}
