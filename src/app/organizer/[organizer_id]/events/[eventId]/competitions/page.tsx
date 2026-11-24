import HackathonWorkspace from "@/src/features/hackathon/components/HackathonWorkspace";
import { HackathonTabGate } from "@/src/features/hackathon/components/HackathonTabGate";

export default async function EventCompetitionsPage(props: {
  params: Promise<{ organizer_id: string; eventId: string }>;
  searchParams: Promise<{ edit?: string; e?: string; ok?: string; tab?: string; track?: string }>;
}) {
  const { organizer_id, eventId } = await props.params;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Competitions
        </p>
        <h2 className="font-display text-xl text-ink">Competitions</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Tracks for this hackathon — fees, roster, and configure each competition.
        </p>
      </div>
      <HackathonTabGate organizerId={organizer_id} eventId={eventId}>
        <HackathonWorkspace {...props} view="competitions" />
      </HackathonTabGate>
    </div>
  );
}
