import { SELECTORS } from "./selectors.js";
import { findMessageRoot } from "./extractor.js";

const MARK = "data-sqr-injected";

function makeButton(messageEl, onQuote) {
  const b = document.createElement("button");
  b.className = "sqr-hover-btn";
  b.type = "button";
  b.title = "Reply";
  b.textContent = "⤷";
  b.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuote(messageEl);
  });
  return b;
}

function inject(root, onQuote) {
  root.querySelectorAll?.(SELECTORS.hoverActions).forEach((bar) => {
    if (bar.hasAttribute(MARK)) return;
    const messageEl = findMessageRoot(bar);
    if (!messageEl) return;
    bar.setAttribute(MARK, "1");
    bar.prepend(makeButton(messageEl, onQuote));
  });
}

export function initHoverButtons(onQuote) {
  inject(document, onQuote);
  new MutationObserver((muts) => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) inject(node, onQuote);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}
