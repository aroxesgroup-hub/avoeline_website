"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Store,
  LifeBuoy,
  FolderTree,
  ShieldCheck,
  KeyRound,
  CreditCard,
  ScrollText,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/src/shared_components/ui/BrandMark";

export type AdminRailItem = { label: string; href: string; icon: AdminRailIcon };

export type AdminRailIcon =
  | "dashboard"
  | "orgs"
  | "organizers"
  | "events"
  | "vendors"
  | "support"
  | "categories"
  | "admins"
  | "tenants"
  | "plans"
  | "website"
  | "audit";

const ICONS: Record<AdminRailIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  orgs: Building2,
  organizers: Users,
  events: CalendarDays,
  vendors: Store,
  support: LifeBuoy,
  categories: FolderTree,
  admins: ShieldCheck,
  tenants: KeyRound,
  plans: CreditCard,
  website: Globe,
  audit: ScrollText,
};

/** Paths that should light up a different rail href (detail routes outside the list prefix). */
const ACTIVE_ALIASES: Record<string, string[]> = {
  "/admin/orgs": ["/admin/departments", "/admin/clubs"],
};

function pathMatchesHref(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  const aliases = ACTIVE_ALIASES[href];
  if (!aliases) return false;
  return aliases.some((a) => pathname === a || pathname.startsWith(`${a}/`));
}

export function AdminRail({ items }: { items: AdminRailItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeHref = items
    .filter((i) => pathMatchesHref(pathname, i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const links = (onRail: boolean) =>
    items.map((item) => {
      const Icon = ICONS[item.icon];
      const active = item.href === activeHref;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
            onRail
              ? active
                ? "bg-rail-active font-semibold text-rail-fg"
                : "text-rail-muted hover:bg-rail-active/60 hover:text-rail-fg"
              : active
                ? "bg-muted font-semibold text-ink"
                : "text-ink-soft hover:bg-muted hover:text-ink"
          }`}
        >
          {onRail && active ? (
            <span
              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-rail-accent"
              aria-hidden="true"
            />
          ) : null}
          <Icon
            size={14}
            className={`shrink-0 ${onRail && active ? "text-rail-accent" : ""}`}
            aria-hidden
          />
          {item.label}
        </Link>
      );
    });

  return (
    <>
      {/* Forest chrome via --rail-* (Stage 5 Batch 3; mirrors DashboardNav) */}
      <aside className="on-ink fixed inset-y-0 left-0 z-30 hidden w-48 flex-col bg-rail text-rail-fg shadow-[inset_-1px_0_0_color-mix(in_srgb,var(--rail-fg)_10%,transparent)] md:flex">
        <Link href="/admin" className="flex h-12 shrink-0 items-center gap-2 px-3">
          <BrandMark inverted className="h-6 w-auto shrink-0" />
          <span className="font-display text-sm tracking-tight text-rail-fg">Admin</span>
        </Link>
        <p className="px-3 pb-1 text-2xs font-medium uppercase tracking-wider text-rail-muted">
          Platform
        </p>
        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4"
          aria-label="Admin sections"
        >
          {links(true)}
        </nav>
      </aside>

      <div className="sticky top-0 z-20 border-b border-line bg-paper md:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Sections
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        {open ? (
          <nav
            className="flex flex-col gap-0.5 border-t border-line px-3 py-3"
            aria-label="Admin sections"
          >
            {links(false)}
          </nav>
        ) : null}
      </div>
    </>
  );
}
