import { SpeakerService } from "@/src/features/event_speakers/types/speakers.service";
import Link from "next/link";
import { SpeakerSearchBar } from "@/src/features/event_speakers/components/SpeakerSearchBar";
import { SpeakerCard } from "@/src/features/event_speakers/components/SpeakerCard";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import { Card, CardBody } from "@/src/shared_components/ui/Card";
import { buttonClass } from "@/src/lib/ui";
import { UserRoundCog, Plus } from "lucide-react";
import { sessionsBySpeakerIds } from "@/src/features/agendas/agendaSpeakers.service";

export default async function SpeakerPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string; organizer_id: string }>;
  searchParams: Promise<{ input_val?: string }>;
}) {
  const { eventId, organizer_id } = await params;
  const resolvedParams = await searchParams;

  const allSpeakers = await SpeakerService.getAllSpeakers(eventId);
  let allSpeaker;

  const needle = String(resolvedParams.input_val || "")
    .trim()
    .toLowerCase();
  allSpeaker = needle
    ? allSpeakers.filter((s) => s.name.toLowerCase().includes(needle))
    : allSpeakers;

  const sessionsBySpeaker = await sessionsBySpeakerIds(allSpeaker.map((s) => s.speakerId));
  const withSessions = allSpeaker.map((speaker) => ({
    speaker,
    sessions: sessionsBySpeaker.get(speaker.speakerId) ?? [],
  }));

  const count_of_speakers = allSpeaker.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
            Event · Speakers
          </p>
          <h2 className="font-display text-xl text-ink">
            Speakers
            <span className="ml-2 text-sm font-normal text-ink-soft tabular-nums">
              {count_of_speakers}
            </span>
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Directory of presenters for this event — profiles, contacts, and session links.
          </p>
        </div>
        <Link
          href={`/organizer/${organizer_id}/events/${eventId}/speakers/create-speaker`}
          className={buttonClass("primary", "sm")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add speaker
        </Link>
      </div>

      <Card>
        <CardBody className="!py-3">
          <SpeakerSearchBar />
        </CardBody>
      </Card>

      {count_of_speakers > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withSessions.map(({ speaker, sessions }) => (
            <SpeakerCard key={speaker.speakerId} speaker={speaker} sessions={sessions} />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<UserRoundCog className="h-5 w-5" />}
              title={resolvedParams.input_val ? "No speakers match that search" : "No speakers yet"}
              description={
                resolvedParams.input_val
                  ? "Try a different name, company or session."
                  : "Add the people presenting at this event so attendees can see who is speaking."
              }
              action={
                resolvedParams.input_val ? undefined : (
                  <Link
                    href={`/organizer/${organizer_id}/events/${eventId}/speakers/create-speaker`}
                    className={buttonClass("primary", "sm")}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add speaker
                  </Link>
                )
              }
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
