import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { assertOwnedEvent } from "@/src/features/events/ownership";
import { ensureTemplateForEvent } from "@/src/features/certificates/certificates.service";
import { CertificateEditorLazy } from "@/src/features/certificates/components/CertificateEditorLazy";

export default async function MakingTemplate({
  params,
}: {
  params: Promise<{ eventId: string; organizer_id: string }>;
}) {
  const { eventId, organizer_id } = await params;

  const event = await assertOwnedEvent(eventId);
  if (!event) notFound();

  const { hasModuleAccess } = await import("@/src/features/permissions/permissions.service");
  if (!(await hasModuleAccess(organizer_id, "certificates"))) {
    const { LockedModulePanel } =
      await import("@/src/features/permissions/components/LockedModulePanel");
    return <LockedModulePanel moduleKey="certificates" />;
  }

  const template = await ensureTemplateForEvent(eventId, event.organizerId);
  const { listActiveFields } = await import("@/src/features/registration/forms/formFields.service");
  const fields = await listActiveFields(eventId).catch(() => []);
  const formFieldKeys = fields
    .map((f) => f.key)
    .filter((k) => k && k !== "name" && k !== "email" && k !== "phone");

  const backHref = `/organizer/${organizer_id}/events/${eventId}/certificates`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Certificates
        </Link>
        <p className="mb-1 mt-3 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Certificate template
        </p>
        <h2 className="font-display text-xl text-ink">Template editor</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Layout and fields for issued certificates. No dedicated design PNG — shell only.
        </p>
      </div>
      <CertificateEditorLazy eventId={eventId} initial={template} formFieldKeys={formFieldKeys} />
    </div>
  );
}
