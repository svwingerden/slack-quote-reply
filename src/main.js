import { extractMessage } from "./extractor.js";
import { formatQuote } from "./formatter.js";
import { insertIntoComposer } from "./inserter.js";
import { dismissLinkPreview } from "./preview-remover.js";
import { initSelectionWatcher } from "./selection-watcher.js";
import { initHoverButtons } from "./hover-button.js";
import { showToast } from "./toast.js";

function handleQuote(messageEl, textOverride = null) {
  const info = extractMessage(messageEl);
  const text = textOverride != null ? textOverride : info.text;
  if (!text.trim()) {
    showToast("Couldn't read the message text to quote.");
    return;
  }
  const quote = formatQuote({ ...info, text });
  if (!insertIntoComposer(messageEl, quote)) {
    showToast("Couldn't find the message box to insert the quote.");
    return;
  }
  if (info.author && info.permalink) {
    dismissLinkPreview(messageEl);
  }
}

initSelectionWatcher((messageEl, selectedText) => handleQuote(messageEl, selectedText));
initHoverButtons((messageEl) => handleQuote(messageEl));
console.info("[slack-quote-reply] active (selection + hover)");
