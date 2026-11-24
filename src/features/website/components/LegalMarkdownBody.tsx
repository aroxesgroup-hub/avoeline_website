import ReactMarkdown from "react-markdown";
import { parseLegalSegments, prepareLegalMarkdown, type LegalCalloutKind } from "../legalMarkdown";

const calloutShell: Record<Exclude<LegalCalloutKind, "SPLIT">, string> = {
  NOTE: "border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)]",
  WARNING: "border-accent-line bg-accent-soft",
  GUARANTEE: "border-accent-line bg-primary-soft",
};

function MarkdownChunk({ content }: { content: string }) {
  const { toc } = prepareLegalMarkdown(content);
  return (
    <ReactMarkdown
      skipHtml
      components={{
        h1: () => null,
        h2: ({ children }) => {
          const text = String(children ?? "");
          const match = toc.find((t) => t.text === text);
          const id = match?.id ?? text.toLowerCase().replace(/\s+/g, "-");
          return (
            <h2
              id={id}
              className="scroll-mt-28 pt-2 font-display text-xl tracking-tight text-[var(--mkt-ink)] sm:text-2xl"
            >
              {children}
            </h2>
          );
        },
        h3: ({ children }) => (
          <h3 className="pt-1 text-base font-semibold text-[var(--mkt-ink)]">{children}</h3>
        ),
        a: ({ href, children }) => {
          const safe = href && !/^javascript:/i.test(href) ? href : "#";
          return (
            <a href={safe} className="underline underline-offset-2" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
        ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--mkt-ink)]">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function LegalMarkdownBody({ bodyMd }: { bodyMd: string }) {
  const segments = parseLegalSegments(bodyMd);

  return (
    <div className="prose-marketing max-w-none space-y-4 text-base leading-relaxed text-[var(--mkt-text)]">
      {segments.map((seg, idx) => {
        if (seg.type === "markdown") {
          return <MarkdownChunk key={`md-${idx}`} content={seg.content} />;
        }
        if (seg.kind === "SPLIT") {
          return (
            <div
              key={`split-${idx}`}
              className="grid gap-4 rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-accent-tint)] p-4 sm:grid-cols-2 sm:gap-6"
            >
              <div className="space-y-2 text-sm">
                <MarkdownChunk content={seg.left} />
              </div>
              <div className="space-y-2 border-t border-[var(--mkt-line)] pt-4 text-sm sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <MarkdownChunk content={seg.right} />
              </div>
            </div>
          );
        }
        return (
          <aside
            key={`callout-${idx}`}
            className={`rounded-2xl border p-4 text-sm ${calloutShell[seg.kind]}`}
          >
            <MarkdownChunk content={seg.content} />
          </aside>
        );
      })}
    </div>
  );
}
