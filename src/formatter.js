export function formatQuote({ text = "", author = "", permalink = "" }) {
  const lines = text.split("\n");
  if (author) {
    lines[0] = `*${author}:* ${lines[0]}`;
  }
  const quoted = lines.map((line) => `> ${line}`.trimEnd());
  if (permalink) {
    quoted.push(`> ${permalink}`);
  }
  return quoted.join("\n");
}
