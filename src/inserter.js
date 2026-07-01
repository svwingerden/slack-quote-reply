import { SELECTORS } from "./selectors.js";

export function findComposerFor(messageEl) {
  const pane =
    messageEl.closest(SELECTORS.threadPane) ||
    messageEl.closest(SELECTORS.primaryPane) ||
    document;
  return pane.querySelector(SELECTORS.composer);
}

// Insert via a synthetic paste carrying both text/html (WYSIWYG composer turns
// it into a real quote block with a clickable link) and text/plain (markup mode
// and the on-send parser honor the mrkdwn). The composer takes whichever arm
// its mode understands.
export function insertIntoComposer(messageEl, html, plain) {
  const composer = findComposerFor(messageEl);
  if (!composer) return false;
  composer.focus();
  const sel = window.getSelection();
  sel.selectAllChildren(composer);
  sel.collapseToEnd();

  const data = new DataTransfer();
  data.setData("text/html", html);
  data.setData("text/plain", plain);
  composer.dispatchEvent(
    new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }),
  );
  return true;
}
