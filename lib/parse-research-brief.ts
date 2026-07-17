export type ResearchBriefSections = {
  isBrief: boolean;
  title: string;
  executiveSummary: string;
  keyFindings: string;
  detailedAnalysis: string;
  areasOfUncertainty: string;
  sources: string;
  /** @deprecated legacy Headline/Analysis format */
  headline: string;
  analysis: string;
};

const SECTION_ALIASES: Record<string, keyof Omit<ResearchBriefSections, "isBrief">> = {
  title: "title",
  headline: "headline",
  "executive summary": "executiveSummary",
  "key findings": "keyFindings",
  "detailed analysis": "detailedAnalysis",
  analysis: "analysis",
  "areas of uncertainty": "areasOfUncertainty",
  sources: "sources",
};

const SECTION_RE =
  /\*\*(Title|Headline|Executive Summary|Key Findings|Detailed Analysis|Analysis|Areas of Uncertainty|Sources):?\*\*[ \t]*/gi;

export function parseResearchBrief(text: string): ResearchBriefSections {
  const empty: ResearchBriefSections = {
    isBrief: false,
    title: "",
    executiveSummary: "",
    keyFindings: "",
    detailedAnalysis: "",
    areasOfUncertainty: "",
    sources: "",
    headline: "",
    analysis: "",
  };

  const hasSection = SECTION_RE.test(text);
  SECTION_RE.lastIndex = 0;
  if (!hasSection) return empty;

  const parts: { key: keyof Omit<ResearchBriefSections, "isBrief">; bodyStart: number; start: number }[] =
    [];
  let match: RegExpExecArray | null;
  while ((match = SECTION_RE.exec(text)) !== null) {
    const label = match[1]!.toLowerCase();
    const key = SECTION_ALIASES[label];
    if (!key) continue;
    parts.push({
      key,
      start: match.index,
      bodyStart: match.index + match[0].length,
    });
  }

  if (parts.length === 0) return empty;

  const sections: Partial<ResearchBriefSections> = {};
  for (let i = 0; i < parts.length; i++) {
    const current = parts[i]!;
    const end = parts[i + 1]?.start ?? text.length;
    sections[current.key] = text.slice(current.bodyStart, end).trim();
  }

  return {
    isBrief: true,
    title: sections.title ?? "",
    executiveSummary: sections.executiveSummary ?? "",
    keyFindings: sections.keyFindings ?? "",
    detailedAnalysis: sections.detailedAnalysis ?? "",
    areasOfUncertainty: sections.areasOfUncertainty ?? "",
    sources: sections.sources ?? "",
    headline: sections.headline ?? "",
    analysis: sections.analysis ?? "",
  };
}

export type SourceLink = {
  title: string;
  url?: string;
  raw: string;
};

const MD_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/i;
const BARE_URL_RE = /(https?:\/\/[^\s)<>]+)/i;

export function parseSourceLinks(sourcesBody: string): SourceLink[] {
  const trimmed = sourcesBody.trim();
  if (!trimmed) return [];

  if (/no external sources/i.test(trimmed)) {
    return [{ title: trimmed.replace(/^[-*]\s*/, ""), raw: trimmed }];
  }

  const lines = trimmed
    .split(/\n+/)
    .map((line) =>
      line.replace(/^\s*\d+[.)]\s*/, "").replace(/^[-*]\s*/, "").trim(),
    )
    .filter(Boolean);

  return lines.map((line) => {
    const md = line.match(MD_LINK_RE);
    if (md) {
      return { title: md[1]!, url: md[2], raw: line };
    }
    const bare = line.match(BARE_URL_RE);
    if (bare) {
      const url = bare[1]!.replace(/[.,;:]+$/, "");
      const title =
        line.replace(bare[1]!, "").replace(/[\s—–-]+$/, "").trim() || url;
      return { title, url, raw: line };
    }
    return { title: line, raw: line };
  });
}
