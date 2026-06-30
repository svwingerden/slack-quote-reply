import { SELECTORS } from "./selectors.js";

export function richTextToPlain(el) {
  if (!el) return "";
  const sections = el.querySelectorAll(SELECTORS.richSection);
  const blocks = sections.length ? Array.from(sections) : [el];
  return blocks
    .map((block) => {
      let out = "";
      for (const node of block.childNodes) {
        out += node.nodeName === "BR" ? "\n" : node.textContent;
      }
      return out;
    })
    .join("\n")
    .trim();
}

export function findMessageRoot(node) {
  const el = node?.nodeType === 1 ? node : node?.parentElement;
  return el ? el.closest(SELECTORS.message) : null;
}

export function findAuthor(messageEl) {
  const own = messageEl.querySelector(SELECTORS.sender);
  if (own) return own.textContent.trim();
  let item = messageEl.closest(SELECTORS.listItem) || messageEl;
  for (let i = 0; i < 50 && item; i++) {
    item = item.previousElementSibling;
    const sender = item?.querySelector?.(SELECTORS.sender);
    if (sender) return sender.textContent.trim();
  }
  return "";
}

export function getPermalink(messageEl) {
  const href = messageEl.querySelector(SELECTORS.timestamp)?.getAttribute("href");
  if (!href) return "";
  try {
    return new URL(href, window.location.href).href;
  } catch {
    return "";
  }
}

export function extractMessage(messageEl) {
  return {
    text: richTextToPlain(messageEl.querySelector(SELECTORS.body)),
    author: findAuthor(messageEl),
    permalink: getPermalink(messageEl),
  };
}
