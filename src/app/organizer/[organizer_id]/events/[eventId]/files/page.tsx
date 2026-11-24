import { notFound, redirect } from "next/navigation";
import { AuthService } from "@/src/features/auth/authService";
import { assertOwnedEvent } from "@/src/features/events/ownership";
import { EntityFilesPanel } from "@/src/features/connections/components/EntityFilesPanel";
import { DriveHealthBanner } from "@/src/features/files/components/DriveHealthBanner";
import { EventDriveFoldersPanel } from "@/src/features/files/components/EventDriveFoldersPanel";
import { staffMayOpenTab } from "@/src/features/hackathon/staffEventAccess";
import { Card, CardBody } from "@/src/shared_components/ui/Card";

export default async function EventFilesPage({
  params,
}: {
  params: Promise<{ organizer_id: string; eventId: string }>;
}) {
  const { organizer_id, eventId } = await params;
  const user = await AuthService.getCurrentUser();
  if (!user) redirect(`/auth/signin?next=/organizer/${organizer_id}/events/${eventId}/files`);

  const owned = await assertOwnedEvent(eventId);
  const mayStaff = await staffMayOpenTab(eventId, "files");
  if (!owned && !mayStaff) notFound();

  const connectionsHref = `/organizer/${organizer_id}/connections`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Files
        </p>
        <h2 className="font-display text-xl text-ink">Files & Drive library</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Event folders and linked Docs, Sheets, and Slides in your Google Drive.
        </p>
      </div>
      <DriveHealthBanner
        organizerId={organizer_id}
        eventId={eventId}
        connectionsHref={connectionsHref}
      />
      <Card>
        <CardBody className="space-y-2 text-sm text-ink-soft">
          <p>
            Connect Drive, then open folders or link Docs, Sheets, and Slides. Files stay in your
            Drive under{" "}
            <span className="font-medium text-ink">
              Avoeline / &lt;Event&gt; / Payment proofs · Certificates · Media · Exports ·
              Submissions
            </span>
            .
          </p>
          <p>
            New Docs/Sheets/Slides created here go in the event folder. Payment proofs and
            submissions use the same tree via FileStore. If Google Picker says the API key is
            invalid, see <code className="text-xs">docs/connections-picker-setup.md</code>.
          </p>
        </CardBody>
      </Card>
      <EventDriveFoldersPanel eventId={eventId} connectionsHref={connectionsHref} />
      <EntityFilesPanel
        ownerType="user"
        ownerId={organizer_id}
        entityType="event"
        entityId={eventId}
        connectionsHrefOwnerId={organizer_id}
      />
    </div>
  );
}
