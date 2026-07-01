const LINK_LABEL = "↗ original";

export function formatQuote({ text = "", author = "", permalink = "" }) {
  const lines = text.split("\n");
  if (author) {
    lines[0] = `*${author}:* ${lines[0]}`;
  }
  if (permalink) {
    lines[lines.length - 1] += ` [${LINK_LABEL}](${permalink})`;
  }
  return lines.map((line) => `> ${line}`.trimEnd()).join("\n");
}
