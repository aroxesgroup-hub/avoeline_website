import Image from "next/image";
import Link from "next/link";
import type { BlockDataMap } from "../schemas";
import { hasText } from "./shared";

/** Sidebar stack for the Contact desk (used beside the inquiry form). */
export function ContactHubRenderer({ data }: { data: BlockDataMap["contact_hub"] }) {
  const hasHub =
    hasText(data.title) ||
    hasText(data.address) ||
    hasText(data.mapImageUrl) ||
    hasText(data.emergencyTitle);
  if (!hasHub) return null;

  return (
    <div className="space-y-5">
      <div className="mkt-card overflow-hidden rounded-2xl">
        {hasText(data.mapImageUrl) ? (
          <div className="relative aspect-[16/10] w-full bg-[var(--mkt-surface)]">
            <Image
              src={data.mapImageUrl.trim()}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 360px"
            />
          </div>
        ) : hasText(data.mapEmbedUrl) ? (
          <iframe
            title={hasText(data.title) ? data.title.trim() : "Map"}
            src={data.mapEmbedUrl.trim()}
            className="aspect-[16/10] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : null}
        <div className="p-5">
          {hasText(data.title) ? (
            <h3 className="font-display text-lg font-semibold text-[var(--mkt-ink)]">
              {data.title.trim()}
            </h3>
          ) : null}
          {hasText(data.address) ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-muted)] whitespace-pre-line">
              {data.address.trim()}
            </p>
          ) : null}
          {hasText(data.hours) ? (
            <p className="mt-3 text-sm font-medium text-[var(--mkt-ink)]">{data.hours.trim()}</p>
          ) : null}
          {hasText(data.emergencyLine) ? (
            <p className="mt-1 text-xs text-[var(--mkt-muted)]">{data.emergencyLine.trim()}</p>
          ) : null}
        </div>
      </div>

      {hasText(data.emergencyTitle) || hasText(data.emergencyBody) ? (
        <div className="rounded-2xl bg-[var(--mkt-accent-deep)] p-5 text-white">
          {hasText(data.emergencyTitle) ? (
            <h3 className="font-display text-lg font-semibold">{data.emergencyTitle.trim()}</h3>
          ) : null}
          {hasText(data.emergencyBody) ? (
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {data.emergencyBody.trim()}
            </p>
          ) : null}
          {hasText(data.emergencyCtaLabel) && hasText(data.emergencyCtaHref) ? (
            <Link
              href={data.emergencyCtaHref.trim()}
              className="mt-4 inline-flex text-sm font-semibold text-[var(--mkt-accent-soft)] underline-offset-2 hover:underline"
            >
              {data.emergencyCtaLabel.trim()}
            </Link>
          ) : null}
        </div>
      ) : null}

      {hasText(data.communityLabel) && hasText(data.communityHref) ? (
        <Link
          href={data.communityHref.trim()}
          className="mkt-card flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)]"
        >
          <span>{data.communityLabel.trim()}</span>
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
