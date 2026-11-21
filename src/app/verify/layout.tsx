import { SiteHeader } from "@/src/shared_components/chrome/SiteHeader";
import { AppFooter } from "@/src/shared_components/chrome/AppFooter";

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell flex min-h-full flex-1 flex-col bg-[var(--mkt-canvas)]">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <AppFooter />
    </div>
  );
}
