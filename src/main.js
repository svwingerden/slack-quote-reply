import { extractMessage } from "./extractor.js";
import { formatQuote } from "./formatter.js";
import { insertIntoComposer } from "./inserter.js";
import { initSelectionWatcher } from "./selection-watcher.js";
import { initHoverButtons } from "./hover-button.js";
import { showToast } from "./toast.js";

function handleQuote(messageEl, textOverride = null) {
  const info = extractMessage(messageEl);
  const text = textOverride != null ? textOverride : info.text;
  const quote = formatQuote({ ...info, text });
  if (!insertIntoComposer(messageEl, quote)) {
    showToast("Couldn't find the message box to insert the quote.");
  }
}

initSelectionWatcher((messageEl, selectedText) => handleQuote(messageEl, selectedText));
initHoverButtons((messageEl) => handleQuote(messageEl));
console.info("[slack-quote-reply] active (selection + hover)");
