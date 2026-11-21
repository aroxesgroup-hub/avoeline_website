export type LegalTocItem = {
  id: string;
  text: string;
  level: 2;
};

export type LegalCalloutKind = "NOTE" | "WARNING" | "GUARANTEE" | "SPLIT";

export type LegalMarkdownSegment =
  | { type: "markdown"; content: string }
  | { type: "callout"; kind: Exclude<LegalCalloutKind, "SPLIT">; content: string }
  | { type: "callout"; kind: "SPLIT"; left: string; right: string };

/** Slugify a heading for in-page anchors. */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Strip script/style tags and raw HTML so markdown never injects executable markup.
 * react-markdown should also be used without rehype-raw.
 */
export function sanitizeLegalMarkdown(md: string): string {
  let out = String(md ?? "");
  // Remove script/style blocks (including attributes / case variants).
  out = out.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  // Strip remaining HTML tags (keep text content).
  out = out.replace(/<\/?[a-zA-Z][^>]*>/g, "");
  // Neutralize obvious javascript: URLs in markdown links.
  out = out.replace(/\((?:\s*)javascript:[^)]*\)/gi, "(#)");
  return out;
}

/** Extract a TOC from `##` headings after sanitization. */
export function extractLegalToc(md: string): LegalTocItem[] {
  const safe = sanitizeLegalMarkdown(md);
  const toc: LegalTocItem[] = [];
  const seen = new Map<string, number>();
  for (const line of safe.split(/\r?\n/)) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[1].trim();
    if (!text) continue;
    let id = slugifyHeading(text) || "section";
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    toc.push({ id, text, level: 2 });
  }
  return toc;
}

const CALLOUT_START = /^>\s*\[!(NOTE|WARNING|GUARANTEE|SPLIT)\]\s*$/i;

function unwrapBlockquoteLine(line: string): string {
  if (/^>\s?/.test(line)) return line.replace(/^>\s?/, "");
  return line;
}

/**
 * Split sanitized markdown into plain markdown chunks and admonition callouts.
 * Callout syntax (GFM-style):
 *
 * > [!NOTE]
 * > Body text…
 *
 * > [!SPLIT]
 * > Left column
 * > ---
 * > Right column
 */
export function parseLegalSegments(md: string): LegalMarkdownSegment[] {
  const safe = sanitizeLegalMarkdown(md);
  const lines = safe.split(/\r?\n/);
  const segments: LegalMarkdownSegment[] = [];
  let buffer: string[] = [];

  function flushMarkdown() {
    const content = buffer.join("\n").trim();
    buffer = [];
    if (content) segments.push({ type: "markdown", content });
  }

  let i = 0;
  while (i < lines.length) {
    const start = CALLOUT_START.exec(lines[i]);
    if (!start) {
      buffer.push(lines[i]);
      i += 1;
      continue;
    }

    flushMarkdown();
    const kind = start[1].toUpperCase() as LegalCalloutKind;
    i += 1;
    const bodyLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") {
        // Allow a blank line inside the callout only if next line continues as blockquote.
        if (i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) {
          bodyLines.push("");
          i += 1;
          continue;
        }
        break;
      }
      if (!/^>/.test(line)) break;
      if (CALLOUT_START.test(line)) break;
      bodyLines.push(unwrapBlockquoteLine(line));
      i += 1;
    }

    if (kind === "SPLIT") {
      const sep = bodyLines.findIndex((l) => /^---+\s*$/.test(l.trim()));
      const left = (sep >= 0 ? bodyLines.slice(0, sep) : bodyLines).join("\n").trim();
      const right = (sep >= 0 ? bodyLines.slice(sep + 1) : []).join("\n").trim();
      segments.push({ type: "callout", kind: "SPLIT", left, right });
    } else {
      segments.push({ type: "callout", kind, content: bodyLines.join("\n").trim() });
    }
  }

  flushMarkdown();
  return segments;
}

export type PreparedLegalDoc = {
  body: string;
  toc: LegalTocItem[];
  segments: LegalMarkdownSegment[];
};

export function prepareLegalMarkdown(md: string): PreparedLegalDoc {
  const body = sanitizeLegalMarkdown(md);
  return { body, toc: extractLegalToc(body), segments: parseLegalSegments(body) };
}
