function getPlainText(body: string): string {
  const withoutFrontmatter = body
    .replace(/\r\n?/g, "\n")
    .replace(/^\uFEFF?---[ \t]*\n[\s\S]*?\n---[ \t]*(?:\n|$)/, "");

  // Track fences so longer closing fences and unfinished blocks also work.
  let fence = "";
  const withoutCode = withoutFrontmatter
    .split("\n")
    .map(line => {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (fence) {
        if (
          marker &&
          marker[1][0] === fence[0] &&
          marker[1].length >= fence.length &&
          line.trim() === marker[1]
        ) {
          fence = "";
        }
        return "";
      }
      if (marker) {
        fence = marker[1];
        return "";
      }
      return /^(?: {4}|\t)/.test(line) ? "" : line;
    })
    .join("\n");

  return withoutCode
    .replace(/<!--[^]*?-->/g, " ")
    .replace(/<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/(`+)[\s\S]*?\1(?!`)/g, " ")
    .replace(/^import\s[^\n]*(?:\n|$)/gm, " ")
    .replace(/^ {0,3}\[[^\]]+\]:[^\n]*(?:\n|$)/gm, " ")
    .replace(/!\[[^\]]*\](?:\((?:[^()]|\([^()]*\))*\)|\[[^\]]*\])?/g, " ")
    .replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>{}\[\]，。！？；：“”‘’（）]+/gi, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]+);/gi, " ")
    .replace(/^ {0,3}(?:[-+*]|\d+[.)])\s+(?:\[[ xX]\]\s*)?/gm, " ")
    .replace(/[*_~#>|\\]/g, " ");
}

/** Shared body count: each Han character, Latin word and number counts once. */
export function getReadingStats(body: string, wordsPerMinute = 200) {
  const plainText = getPlainText(body);
  const chineseCharacters = plainText.match(/\p{Script=Han}/gu)?.length ?? 0;
  const englishWords =
    plainText.match(/\p{Script=Latin}+(?:['’]\p{Script=Latin}+)*/gu)?.length ?? 0;
  const numbers = plainText.match(/\d+(?:[.,]\d+)*/g)?.length ?? 0;
  const englishSpeed =
    Number.isFinite(wordsPerMinute) && wordsPerMinute > 0 ? wordsPerMinute : 200;
  const minutes = Math.ceil(
    chineseCharacters / 300 + (englishWords + numbers) / englishSpeed
  );

  return {
    wordCount: chineseCharacters + englishWords + numbers,
    readingTime: minutes < 1 ? "少于 1 分钟" : `约 ${minutes} 分钟`,
  };
}

/** Keep the existing API and its optional English reading-speed argument. */
export function getReadingTime(body: string, wordsPerMinute = 200): string {
  return getReadingStats(body, wordsPerMinute).readingTime;
}
