/**
 * Expand user queries the way Google does: fix common typos and add
 * high-signal variants so "bindary holdings" still finds Binary Holdings.
 */

const WORD_FIXES: Record<string, string> = {
  bindary: "binary",
  binery: "binary",
  bynary: "binary",
  bianry: "binary",
  binray: "binary",
  birnary: "binary",
  foundr: "founder",
  foundeer: "founder",
  ceeo: "ceo",
  holdigns: "holdings",
  holdingss: "holdings",
};

/** Levenshtein distance for short tokens. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }
  return dp[m]![n]!;
}

function correctToken(token: string): string {
  const lower = token.toLowerCase();
  if (WORD_FIXES[lower]) return WORD_FIXES[lower]!;

  // Fuzzy: tokens near "binary" (covers bindary/binery/etc.)
  if (lower.length >= 5 && lower.length <= 8) {
    if (editDistance(lower, "binary") <= 2) return "binary";
  }
  if (lower.length >= 6 && lower.length <= 10) {
    if (editDistance(lower, "holdings") <= 2) return "holdings";
    if (editDistance(lower, "founder") <= 2) return "founder";
  }
  return token;
}

/** Apply spelling fixes while preserving original casing style loosely. */
export function correctQueryTypos(query: string): string {
  return query
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      const fixed = correctToken(part.replace(/[^a-zA-Z]/g, ""));
      if (!fixed || fixed === part.replace(/[^a-zA-Z]/g, "").toLowerCase()) {
        // If only punctuation differed, still try word core
        const core = part.match(/[a-zA-Z]+/)?.[0];
        if (!core) return part;
        const correctedCore = correctToken(core);
        if (correctedCore === core.toLowerCase()) return part;
        return part.replace(core, correctedCore);
      }
      const core = part.match(/[a-zA-Z]+/)?.[0];
      if (!core) return part;
      return part.replace(core, fixed);
    })
    .join("");
}

/**
 * Return unique search queries to run, original first then corrected / sharpened.
 */
export function expandSearchQueries(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const corrected = correctQueryTypos(trimmed);
  const variants = [trimmed];

  if (corrected.toLowerCase() !== trimmed.toLowerCase()) {
    variants.push(corrected);
  }

  // Sharpen founder questions once spelling is clean
  const base = corrected || trimmed;
  if (/\bfounder/i.test(base) && /\bholdings?\b/i.test(base)) {
    variants.push(`${base} official company team`);
    variants.push(`${base} founder CEO`);
  }

  // Dedupe case-insensitively, keep order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export function didCorrectTypos(query: string): boolean {
  return correctQueryTypos(query).toLowerCase() !== query.trim().toLowerCase();
}
