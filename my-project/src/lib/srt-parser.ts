export function parseSrt(content: string): string {
  const blocks = content.trim().split(/\n\s*\n/);
  const textLines: string[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    // Skip index (line 0) and timestamp (line 1), take text (lines 2+)
    const text = lines.slice(2).join(" ").trim();
    if (text) textLines.push(text);
  }

  return textLines.join(" ");
}

export function chunkText(text: string, maxWords = 3000): string[] {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    let end = Math.min(start + maxWords, words.length);

    // Try to cut at sentence boundary (period followed by space)
    if (end < words.length) {
      for (let i = end; i > start + maxWords * 0.8; i--) {
        if (words[i - 1].endsWith(".")) {
          end = i;
          break;
        }
      }
    }

    chunks.push(words.slice(start, end).join(" "));
    start = end;
  }

  return chunks;
}
