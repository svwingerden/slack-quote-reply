import { findMessageRoot } from "./extractor.js";

let btn = null;

function ensureButton() {
  if (btn) return btn;
  btn = document.createElement("button");
  btn.className = "sqr-quote-btn";
  btn.type = "button";
  btn.textContent = "⤷ Reply";
  document.body.appendChild(btn);
  return btn;
}

function hide() {
  if (btn) btn.style.display = "none";
}

export function initSelectionWatcher(onQuote) {
  document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (!text || sel.rangeCount === 0) return hide();
    const messageEl = findMessageRoot(sel.anchorNode);
    if (!messageEl) return hide();

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const b = ensureButton();
    b.onmousedown = (e) => {
      // mousedown + preventDefault so the page selection isn't cleared first
      e.preventDefault();
      e.stopPropagation();
      const current = window.getSelection().toString().trim() || text;
      hide();
      onQuote(messageEl, current);
    };
    b.style.display = "block";
    b.style.top = `${window.scrollY + rect.top - 36}px`;
    b.style.left = `${window.scrollX + rect.left}px`;
  });
  document.addEventListener("scroll", hide, true);
}
