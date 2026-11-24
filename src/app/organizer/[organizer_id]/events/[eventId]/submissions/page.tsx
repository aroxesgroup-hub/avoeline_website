import HackathonWorkspace from "@/src/features/hackathon/components/HackathonWorkspace";
import { HackathonTabGate } from "@/src/features/hackathon/components/HackathonTabGate";
import { DriveHealthBanner } from "@/src/features/files/components/DriveHealthBanner";

export default async function EventSubmissionsPage(props: {
  params: Promise<{ organizer_id: string; eventId: string }>;
  searchParams: Promise<{ edit?: string; e?: string; ok?: string; tab?: string; track?: string }>;
}) {
  const { organizer_id, eventId } = await props.params;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Submissions
        </p>
        <h2 className="font-display text-xl text-ink">Submissions</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Review task and final project submissions from competing teams.
        </p>
      </div>
      <HackathonTabGate organizerId={organizer_id} eventId={eventId}>
        <DriveHealthBanner
          organizerId={organizer_id}
          eventId={eventId}
          connectionsHref={`/organizer/${organizer_id}/connections`}
        />
        <HackathonWorkspace {...props} view="submissions" />
      </HackathonTabGate>
    </div>
  );
}
