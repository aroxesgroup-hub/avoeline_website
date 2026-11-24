import { getCertsOfEventByRegistration } from "@/src/features/certificates/certificates.service";
import { issueCertificatesAction } from "@/src/features/certificates/actions/issueCertificates.action";
import { emailCertificatesLegacy } from "@/src/features/certificates/actions/emailCertificates.action";
import { rankTeamMembersForCertificates } from "@/src/features/certificates/recipientPresets";
import { RegService } from "@/src/services/registeration.service";
import { UserService } from "@/src/services/user.service";
import CertificateIssuanceClient, { type AttendeeCertProp } from "./certificateClient";
import { DriveHealthBanner } from "@/src/features/files/components/DriveHealthBanner";

export default async function CertificateIssuancePage({
  params,
}: {
  params: Promise<{ organizer_id: string; eventId: string }>;
}) {
  const { organizer_id, eventId } = await params;

  const { hasModuleAccess } = await import("@/src/features/permissions/permissions.service");
  if (!(await hasModuleAccess(organizer_id, "certificates"))) {
    const { LockedModulePanel } =
      await import("@/src/features/permissions/components/LockedModulePanel");
    return <LockedModulePanel moduleKey="certificates" />;
  }

  const regs = await RegService.getRegsOfEvent(eventId);

  let rankByReg = new Map<string, { teamName: string; competitionName?: string; rank: number }>();
  try {
    const { listTeamsOfEvent } = await import("@/src/features/hackathon/hackathon.service");
    const teams = await listTeamsOfEvent(eventId);
    if (teams.length) {
      const trackIds = [...new Set(teams.map((t) => t.trackId).filter(Boolean))];
      const trackNames = new Map<string, string>();
      if (trackIds.length) {
        const { supabaseAdmin } = await import("@/data/supabase");
        const { TABLES } = await import("@/data/collections");
        const { data } = await supabaseAdmin
          .from(TABLES.HACKATHON_TRACKS)
          .select("id, name")
          .in("id", trackIds);
        for (const row of data ?? []) {
          trackNames.set(String(row.id), String(row.name || ""));
        }
      }
      const ranked = rankTeamMembersForCertificates(
        teams.map((t) => ({
          id: t.id,
          name: t.name,
          trackId: t.trackId,
          trackName: trackNames.get(t.trackId) || "",
          scores: t.scores,
          memberRegistrationIds: t.memberRegistrationIds,
          members: t.members,
        })),
      );
      for (const r of ranked) {
        rankByReg.set(r.registrationId, {
          teamName: r.teamName,
          competitionName: r.competitionName,
          rank: r.rank,
        });
      }
    }
  } catch {
    /* non-hackathon or soft-fail */
  }

  let attendeesWithData: AttendeeCertProp[] = [];
  if (regs.length) {
    const [usersById, certByRegistration] = await Promise.all([
      UserService.getUsersByIds(regs.map((r) => r.userId).filter(Boolean)),
      getCertsOfEventByRegistration(eventId),
    ]);

    attendeesWithData = regs
      .filter((r) => r.status !== "cancelled" && r.status !== "rejected")
      .map((r) => {
        const user = usersById.get(String(r.userId));
        const meta = rankByReg.get(r.registrationId);
        const confirmed =
          r.status === "confirmed" ||
          r.status === "checked_in" ||
          r.status === "attended" ||
          !!r.checkIn?.checkedIn;
        return {
          registrationId: r.registrationId,
          name: user?.profile?.fullName || r.attendee?.name || "Attendee",
          email: user?.email || r.attendee?.email || "",
          checkedIn: !!r.checkIn?.checkedIn || r.status === "checked_in" || r.status === "attended",
          confirmed,
          certStatus: certByRegistration.get(r.registrationId) ?? null,
          teamName: meta?.teamName,
          competitionName: meta?.competitionName,
          rank: meta?.rank,
        };
      });
  }

  async function handleGenerateCertificates(
    selectedAttendeeIds: string[],
    roles: Record<string, string> = {},
    opts?: {
      archiveToDrive?: boolean;
      recipientMeta?: Record<
        string,
        { teamName?: string; competitionName?: string; rank?: string }
      >;
    },
  ) {
    "use server";
    const result = await issueCertificatesAction({
      eventId,
      registrationIds: selectedAttendeeIds,
      roles,
      recipientMeta: opts?.recipientMeta,
      archiveToDrive: opts?.archiveToDrive,
    });
    if (!result.ok) {
      return {
        success: false,
        count: 0,
        failedCount: 0,
        message: result.error.message,
        results: [],
      };
    }
    return {
      success: result.data.success,
      count: result.data.count,
      failedCount: result.data.failedCount,
      message: result.data.message,
      results: [...result.data.results],
    };
  }

  async function handleEmailCertificates(
    resend: boolean,
    opts?: {
      includeDriveLink?: boolean;
      acknowledgeDriveShareWarning?: boolean;
      connectionId?: string | null;
    },
  ) {
    "use server";
    return emailCertificatesLegacy(eventId, resend, opts);
  }

  const { listConnections } = await import("@/src/features/connections/server/connections.service");
  const conns = await listConnections({
    ownerType: "user",
    ownerId: organizer_id,
    includeQuota: false,
  });
  const driveConnected = conns.some(
    (c) =>
      c.status === "active" &&
      (c.capabilities || []).some((cap) => cap.capability === "drive.files" && cap.enabled),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-ink-soft">
          Event · Certificates
        </p>
        <h2 className="font-display text-xl text-ink">Certificates</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Issue and email credentials for registrants of this event.
        </p>
      </div>
      <DriveHealthBanner
        organizerId={organizer_id}
        eventId={eventId}
        connectionsHref={`/organizer/${organizer_id}/connections`}
      />
      <CertificateIssuanceClient
        attendees={attendeesWithData}
        eventId={eventId}
        organizerId={organizer_id}
        driveConnected={driveConnected}
        hasScoreboardRanks={rankByReg.size > 0}
        onGenerateCertificates={handleGenerateCertificates}
        onEmailCertificates={handleEmailCertificates}
      />
    </div>
  );
}
