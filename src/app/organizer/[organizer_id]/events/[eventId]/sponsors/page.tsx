import { notFound } from "next/navigation";
import { assertOwnedEvent } from "@/src/features/events/ownership";
import { eventIsHackathon, listTracks } from "@/src/features/hackathon/hackathon.service";
import {
  getEventOrganizations,
  listPartnerTypes,
} from "@/src/features/organizations/organizations.service";
import { publicOrder } from "@/src/features/organizations/types";
import { SponsorsBoard } from "@/src/features/organizations/components/SponsorsBoard";

export default async function EventSponsorsPage({
  params,
}: {
  params: Promise<{ organizer_id: string; eventId: string }>;
}) {
  const { organizer_id, eventId } = await params;
  const event = await assertOwnedEvent(eventId);
  if (!event) notFound();

  const isHackathon = await eventIsHackathon(event);
  const tracks = isHackathon ? await listTracks(eventId) : [];
  const [orgsRaw, partnerTypes] = await Promise.all([
    getEventOrganizations(eventId),
    listPartnerTypes(event.organizerId),
  ]);
  const orgs = publicOrder(orgsRaw, event.sponsorTiers);
  const currency = event.pricing?.currency || "PKR";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Sponsors
        </p>
        <h2 className="font-display text-xl text-ink">Sponsors & partners</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Organizations supporting this event — tiers, benefits, and public visibility.
        </p>
      </div>
      <SponsorsBoard
        eventId={eventId}
        organizerId={organizer_id}
        orgs={orgs}
        sponsorTiers={event.sponsorTiers}
        tracks={tracks.map((t) => ({ id: t.id, name: t.name }))}
        isHackathon={isHackathon}
        partnerTypes={partnerTypes}
        showSponsors={!!event.showSponsors}
        showCollaborators={!!event.showCollaborators}
        showPartners={!!event.showPartners}
        currency={currency}
      />
    </div>
  );
}
