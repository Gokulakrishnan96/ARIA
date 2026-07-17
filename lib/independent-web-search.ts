export type SearchHit = {
  title: string;
  url: string;
  snippet: string;
};

export type IndependentResearch = {
  findings: string;
  sources: { title: string; url: string }[];
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function decodeDuckUrl(raw: string): string | null {
  try {
    const decoded = decodeURIComponent(raw);
    if (!/^https?:\/\//i.test(decoded)) return null;
    if (/duckduckgo\.com/i.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function extractUrlsFromHtml(html: string): SearchHit[] {
  const hits: SearchHit[] = [];
  const seen = new Set<string>();

  const patterns = [
    /uddg=([^&"'\s]+)/gi,
    /href="(https?:\/\/[^"]+)"/gi,
  ];

  for (const re of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null) {
      const raw = match[1]!;
      const url = raw.startsWith("http") ? raw : decodeDuckUrl(raw);
      if (!url) continue;
      if (/duckduckgo\.com|bing\.com\/ck|javascript:|microsoft\.com|msn\.com/i.test(url)) {
        continue;
      }
      if (seen.has(url)) continue;
      seen.add(url);
      hits.push({ title: url, url, snippet: "" });
      if (hits.length >= 10) return hits;
    }
    if (hits.length > 0) break;
  }

  return hits;
}

/** Build likely official pages from the query (works even when search engines block datacenter IPs). */
function candidateOfficialUrls(query: string): SearchHit[] {
  const cleaned = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(
      /\b(who|is|are|the|a|an|of|founder|founders|ceo|cofounder|co|founder|company|about|tell|me|what)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  const compact = cleaned.replace(/\s+/g, "");
  const dashed = cleaned.replace(/\s+/g, "-");
  const hosts = [
    `${compact}.com`,
    `the${compact}.com`,
    `${dashed}.com`,
    `www.${compact}.com`,
    `www.the${compact}.com`,
  ];

  const paths = ["/team", "/about", "/leadership", "/company", "/"];
  const hits: SearchHit[] = [];
  const seen = new Set<string>();

  for (const host of hosts) {
    for (const path of paths) {
      const url = `https://${host.replace(/^www\./, "www.")}${path}`.replace(
        "https://www.www.",
        "https://www.",
      );
      // normalize host without double www
      const normalized = url
        .replace("https://www.www.", "https://www.")
        .replace("https://thethe", "https://the");
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      hits.push({ title: normalized, url: normalized, snippet: "" });
    }
  }

  // Explicit high-value guess for common "The X" company names
  if (compact.length >= 6) {
    hits.unshift({
      title: `https://www.${compact}.com/team`,
      url: `https://www.${compact}.com/team`,
      snippet: "",
    });
    hits.unshift({
      title: `https://www.the${compact}.com/team`,
      url: `https://www.the${compact}.com/team`,
      snippet: "",
    });
  }

  return hits;
}

async function searchEngineHits(query: string): Promise<SearchHit[]> {
  const endpoints = [
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
    `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const html = await res.text();
      const hits = extractUrlsFromHtml(html);
      if (hits.length > 0) return hits;
    } catch {
      // try next
    }
  }
  return [];
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x2014;/gi, "—")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractTitle(html: string, fallback: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() || fallback;
}

async function readPageText(
  pageUrl: string,
): Promise<{ title: string; body: string } | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const title = extractTitle(html, pageUrl);
    const body = htmlToText(html).slice(0, 7000);
    if (!body || body.length < 80) return null;
    if (
      /sign up \| linkedin|agree & join linkedin|enable javascript|access denied|captcha|domain for sale|is for sale|hugedomains|godaddy|parked free|buy this domain/i.test(
        `${title}\n${body}`,
      )
    ) {
      return null;
    }
    return { title, body };
  } catch {
    return null;
  }
}

function buildFindings(
  query: string,
  pages: { url: string; title: string; body: string }[],
) {
  const blocks = pages.map((page, i) => {
    return [
      `### Source ${i + 1}: ${page.title}`,
      `URL: ${page.url}`,
      page.body,
    ].join("\n");
  });

  return [
    `Search query: ${query}`,
    "The following are live web extracts. Treat them as the only evidence.",
    "",
    ...blocks,
  ].join("\n");
}

function scoreUrl(url: string, query: string): number {
  let s = 0;
  const q = query.toLowerCase();
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const token of host.split(/[.-]/).filter((t) => t.length > 3)) {
      if (q.includes(token)) s += 6;
    }
  } catch {
    // ignore
  }
  if (/\/team|\/about|\/leadership|\/company|\/founders?/i.test(url)) s += 5;
  if (/crunchbase\.com|thecompanycheck\.com|preqin\.com/i.test(url)) s += 3;
  if (/linkedin\.com/i.test(url)) s -= 2;
  return s;
}

/**
 * Independent web research that does NOT use Gemini Google Search grounding.
 * Works on Vercel by combining search engines with official-URL candidates + direct fetches.
 */
export async function independentWebResearch(
  query: string,
  conversationHint = "",
): Promise<IndependentResearch | null> {
  const searchQuery = conversationHint
    ? `${query} ${conversationHint.replace(/\n/g, " ").slice(0, 160)}`
    : query;

  const engineHits = await searchEngineHits(searchQuery);
  const officialHits = candidateOfficialUrls(query);
  const merged = [...officialHits, ...engineHits];

  const seen = new Set<string>();
  const hits = merged.filter((hit) => {
    if (seen.has(hit.url)) return false;
    seen.add(hit.url);
    return true;
  });

  hits.sort((a, b) => scoreUrl(b.url, query) - scoreUrl(a.url, query));
  const selected = hits.slice(0, 8);
  if (selected.length === 0) return null;

  const pages: { url: string; title: string; body: string }[] = [];
  // Fetch in small parallel batches for serverless time limits
  for (let i = 0; i < selected.length && pages.length < 4; i += 3) {
    const batch = selected.slice(i, i + 3);
    const results = await Promise.all(
      batch.map(async (hit) => {
        const page = await readPageText(hit.url);
        if (!page) return null;
        return { url: hit.url, title: page.title, body: page.body };
      }),
    );
    for (const page of results) {
      if (page) pages.push(page);
      if (pages.length >= 4) break;
    }
  }

  pages.sort((a, b) => scoreUrl(b.url, query) - scoreUrl(a.url, query));

  if (pages.length === 0) return null;

  return {
    findings: buildFindings(query, pages.slice(0, 4)),
    sources: pages.slice(0, 4).map((p) => ({ title: p.title, url: p.url })),
  };
}
