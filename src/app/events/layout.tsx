import { SiteHeader } from "@/src/shared_components/chrome/SiteHeader";
import { AppFooter } from "@/src/shared_components/chrome/AppFooter";

/**
 * Public events browse + event detail share marketing dual-theme chrome
 * (same 6-link nav as home/plans — not the short public Support set).
 * Compete / ticket deep routes keep their own inner UI inside this shell.
 */
export default function EventsPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell flex min-h-full flex-1 flex-col bg-[var(--mkt-canvas)]">
      <SiteHeader variant="marketing" />
      <div className="flex flex-1 flex-col">{children}</div>
      <AppFooter />
    </div>
  );
}
