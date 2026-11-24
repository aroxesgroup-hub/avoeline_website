import { notFound, redirect } from "next/navigation";
import { Calendar, Users } from "lucide-react";
import { AuthService } from "@/src/features/auth/authService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardBody } from "@/src/shared_components/ui/Card";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import { MetricTile } from "@/src/shared_components/ui/MetricTile";
import { StatusBadge } from "@/src/shared_components/ui/StatusBadge";
import { ThemeToggle } from "@/src/shared_components/ui/ThemeToggle";
import { buttonClass, fieldClass, tableCell, tableHead, tableRow } from "@/src/lib/ui";
import { DesignSystemDemos } from "./DesignSystemDemos";

export const dynamic = "force-dynamic";

const SWATCHES: { name: string; className: string; note?: string }[] = [
  { name: "paper", className: "bg-paper border border-line" },
  { name: "canvas", className: "bg-canvas border border-line" },
  { name: "muted", className: "bg-muted border border-line" },
  { name: "ink", className: "bg-ink" },
  { name: "primary", className: "bg-primary" },
  { name: "accent", className: "bg-accent" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "danger", className: "bg-danger" },
  { name: "series-1", className: "bg-series-1" },
  { name: "series-2", className: "bg-series-2" },
  { name: "series-3", className: "bg-series-3" },
  { name: "rail", className: "bg-[var(--rail-bg)]", note: "Stage 3" },
  { name: "rail-accent", className: "bg-[var(--rail-accent)]", note: "Stage 3" },
];

export default async function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const user = await AuthService.getCurrentUser().catch(() => null);
  const isAdmin = user?.role === "platform_admin" || user?.userType === "admin";
  if (!user) {
    redirect("/auth/signin?next=/dev/design-system");
  }
  if (!isAdmin) {
    redirect("/access-denied?reason=design_system");
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wider text-ink-soft">
            Dev only · platform admin
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Design system</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Living gallery for product tokens (`theme.css`) and shared primitives. See{" "}
            <code className="text-ink">docs/design-system.md</code>.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Color</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {SWATCHES.map((s) => (
            <div key={s.name} className="space-y-1.5">
              <div className={`h-14 rounded-lg ${s.className}`} />
              <p className="text-2xs font-medium uppercase text-ink-soft">
                {s.name}
                {s.note ? ` · ${s.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Typography</h2>
        <p className="font-display text-3xl font-semibold tracking-tight">Display heading</p>
        <p className="text-base text-ink">Body text on canvas — ink.</p>
        <p className="text-sm text-ink-soft">Secondary — ink-soft (AA body).</p>
        <p className="text-xs text-ink-faint">Faint labels — ink-faint.</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Primary sm</Button>
          <Button>Primary</Button>
          <Button size="lg">Primary lg</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger (outlined)</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonClass("primary", "sm")}>
            buttonClass primary
          </button>
          <button type="button" className={buttonClass("secondary")}>
            buttonClass secondary
          </button>
          <button type="button" className={buttonClass("ghost")}>
            buttonClass ghost
          </button>
          <button type="button" className={buttonClass("destructive")}>
            buttonClass destructive
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Cards</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card tone="flat" title="Flat">
            <CardBody>
              <p className="text-sm text-ink-soft">Default hairline card.</p>
            </CardBody>
          </Card>
          <Card tone="raised" title="Raised">
            <CardBody>
              <p className="text-sm text-ink-soft">One lifted card per screen.</p>
            </CardBody>
          </Card>
          <Card tone="panel" title="Panel">
            <CardBody>
              <p className="text-sm opacity-80">Loud ink panel — stays dark.</p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Form fields</h2>
        <div className="grid max-w-xl gap-4">
          <Input label="Email" placeholder="you@example.com" helperText="Uses semantic borders." />
          <Select
            label="Plan"
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro" },
            ]}
          />
          <div>
            <label
              className="mb-1.5 block text-2xs font-medium uppercase text-ink-soft"
              htmlFor="ds-raw"
            >
              Raw fieldClass
            </label>
            <input id="ds-raw" className={fieldClass} placeholder="fieldClass string" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="outline">Outline</Badge>
          <StatusBadge status="confirmed" />
          <StatusBadge status="pending" />
          <StatusBadge status="rejected" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Empty + metric</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            icon={<Calendar className="h-6 w-6" />}
            title="No sessions lined up"
            description="EmptyState uses dashed line-loud — region works and is empty."
            action={<Button size="sm">Create event</Button>}
            size="sm"
          />
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-paper">
            <MetricTile
              label="Registrations"
              value="2"
              sublabel="1 team · 3 people"
              icon={<Users className="h-4 w-4" />}
              iconTone="success"
            />
            <MetricTile label="Active events" value="2" sublabel="Nothing on today" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Table recipe</h2>
        <Card tone="flat">
          <CardBody className="overflow-x-auto p-0 sm:p-0">
            <table className="w-full min-w-[28rem] px-5">
              <thead>
                <tr className="border-b border-line">
                  <th className={`${tableHead} pl-5 pt-4`}>Attendee</th>
                  <th className={`${tableHead} pt-4`}>Status</th>
                  <th className={`${tableHead} pt-4 text-right pr-5`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className={tableRow}>
                  <td className={`${tableCell} pl-5`}>Alex Rivera</td>
                  <td className={tableCell}>
                    <StatusBadge status="confirmed" size="sm" />
                  </td>
                  <td className={`${tableCell} text-right pr-5`}>Rs 100</td>
                </tr>
                <tr className={tableRow}>
                  <td className={`${tableCell} pl-5`}>Sam Chen</td>
                  <td className={tableCell}>
                    <StatusBadge status="pending" size="sm" />
                  </td>
                  <td className={`${tableCell} text-right pr-5`}>Rs 0</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Modal / Confirm</h2>
        <DesignSystemDemos />
      </section>
    </div>
  );
}
