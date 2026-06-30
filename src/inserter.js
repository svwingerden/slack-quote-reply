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
