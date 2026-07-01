// The author's name becomes the clickable link to the original message, bolded.
// With no permalink, fall back to a bold name; with no author, no prefix.
export function formatQuote({ text = "", author = "", permalink = "" }) {
  const lines = text.split("\n");
  const prefix = author
    ? permalink
      ? `*[${author}](${permalink}):* `
      : `*${author}:* `
    : "";
  lines[0] = `${prefix}${lines[0]}`;
  return lines.map((line) => `> ${line}`.trimEnd()).join("\n");
}
