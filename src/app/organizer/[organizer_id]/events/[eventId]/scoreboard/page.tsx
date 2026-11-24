import HackathonWorkspace from "@/src/features/hackathon/components/HackathonWorkspace";
import { HackathonTabGate } from "@/src/features/hackathon/components/HackathonTabGate";

export default async function EventScoreboardPage(props: {
  params: Promise<{ organizer_id: string; eventId: string }>;
  searchParams: Promise<{ edit?: string; e?: string; ok?: string; tab?: string; track?: string }>;
}) {
  const { organizer_id, eventId } = await props.params;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Scoreboard
        </p>
        <h2 className="font-display text-xl text-ink">Live scoreboard</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Rankings from task completions — refreshes every 15s while this tab is open.
        </p>
      </div>
      <HackathonTabGate organizerId={organizer_id} eventId={eventId}>
        <HackathonWorkspace {...props} view="scoreboard" />
      </HackathonTabGate>
    </div>
  );
}
