const LINK_LABEL = "↗ original";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Plain-text / mrkdwn form — used as the paste event's text/plain arm, which
// Slack's "Format messages with markup" mode (and the on-send parser) honor.
export function formatQuote({ text = "", author = "", permalink = "" }) {
  const lines = text.split("\n");
  if (author) {
    lines[0] = `*${author}:* ${lines[0]}`;
  }
  const quoted = lines.map((line) => `> ${line}`.trimEnd());
  if (permalink) {
    quoted.push(`> <${permalink}|${LINK_LABEL}>`);
  }
  return quoted.join("\n");
}

// HTML form — used as the paste event's text/html arm, which the default
// WYSIWYG composer turns into a real quote block with a clickable link.
export function formatQuoteHtml({ text = "", author = "", permalink = "" }) {
  const body = escapeHtml(text).split("\n").join("<br>");
  const prefix = author ? `<strong>${escapeHtml(author)}:</strong> ` : "";
  const link = permalink
    ? ` <a href="${escapeHtml(permalink)}">${LINK_LABEL}</a>`
    : "";
  return `<blockquote>${prefix}${body}${link}</blockquote>`;
}
