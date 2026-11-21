import { Users } from "lucide-react";
import type { RegistrationState } from "@/src/lib/registrationState";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import type { EventFormField } from "@/src/features/registration/forms/formFields.types";
import type { PublicEventDto } from "@/src/features/events/types";
import { whatHappensNextLine } from "./publicPage.logic";
import { RegistrationReminderButton } from "./RegistrationReminderButton";
import { PublicRegisterFormBlock } from "./PublicRegisterFormBlock";

type Props = {
  dto: PublicEventDto;
  preview: boolean;
  inviteToken?: string | null;
  accessCode?: string | null;
  attendee?: { name?: string; email?: string } | null;
  initialTrackId?: string | null;
};

function reserveCardTitle(dto: PublicEventDto): string {
  if (dto.isHackathon) return "Register your squad";
  if (/delegate/i.test(dto.title) || /delegate/i.test(dto.admissionLabel)) {
    return "Reserve delegate seat";
  }
  return "Reserve seat";
}

export function PublicRegisterCard({
  dto,
  preview,
  inviteToken = null,
  accessCode = null,
  attendee = null,
  initialTrackId = null,
}: Props) {
  const reg = dto.registration;
  const state = preview ? ("preview" as RegistrationState) : reg.state;
  const formFields = dtoToFormFields(dto);

  return (
    <div className="mkt-card rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-6 shadow-[var(--mkt-card-shadow)]">
      <h2 className="font-display text-xl font-semibold text-[var(--mkt-ink)]">
        {reserveCardTitle(dto)}
      </h2>
      <p className="mt-1 text-sm text-[var(--mkt-muted)]">{dto.admissionLabel}</p>

      <div className="mt-6">
        <RegisterBody
          state={state}
          message={reg.message}
          dto={dto}
          preview={preview}
          formFields={formFields}
          inviteToken={inviteToken}
          accessCode={accessCode}
          attendee={attendee}
          initialTrackId={initialTrackId}
        />
      </div>
    </div>
  );
}

function RegisterBody({
  state,
  message,
  dto,
  preview,
  formFields,
  inviteToken,
  accessCode,
  attendee,
  initialTrackId,
}: {
  state: RegistrationState;
  message: string;
  dto: PublicEventDto;
  preview: boolean;
  formFields: EventFormField[];
  inviteToken: string | null;
  accessCode: string | null;
  attendee: { name?: string; email?: string } | null;
  initialTrackId: string | null;
}) {
  const nextLine = whatHappensNextLine({
    isFree: dto.isFree,
    requiresApproval: dto.requiresApproval,
  });
  const openCompetitions = dto.competitions.filter((c) => c.canRegister);
  const showSkuTierPicker =
    !dto.isHackathon && openCompetitions.length === 0 && dto.pricingTiers.length > 0;

  const formCommon = {
    eventId: dto.id,
    isPaid: !dto.isFree,
    priceLabel: dto.admissionLabel,
    needsApproval: dto.requiresApproval,
    formFields,
    groupRegistration: dto.groupRegistration,
    groupMinSize: dto.groupMinSize,
    groupMaxSize: dto.groupMaxSize,
    attendee,
    publicPromos: dto.publicPromos,
    initialTrackId,
    paymentInstructions: dto.paymentInstructions,
    pricingTiers: dto.pricingTiers,
    currency: dto.currency,
    showSkuTierPicker,
    competitions: openCompetitions.map((c) => competitionChoice(c)),
    tierChoices:
      openCompetitions.length > 0
        ? []
        : dto.allowTierSelfSelect
          ? dto.attendeeTiers.filter((t) => !dto.lockedTiers.includes(t))
          : [],
  };

  if (state === "preview" || preview) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-warning-line bg-warning-soft px-3 py-2 text-sm text-ink">
          {message || "Preview only — registration cannot be submitted from this view."}
        </p>
        <PublicRegisterFormBlock
          {...formCommon}
          inviteToken={null}
          accessCode={null}
          joinsWaitlist={false}
          previewOnly
        />
        <p className="text-xs text-[var(--mkt-muted)]">{nextLine}</p>
      </div>
    );
  }

  if (state === "unpublished") {
    return (
      <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-canvas)] px-3 py-2 text-sm text-[var(--mkt-muted)]">
        {message}
      </p>
    );
  }

  if (state === "event_ended") {
    return (
      <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-canvas)] px-3 py-2 text-sm text-[var(--mkt-muted)]">
        {message}
      </p>
    );
  }

  if (state === "not_open") {
    const reminder = dto.registration.reminder;
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-canvas)] px-3 py-2 text-sm text-[var(--mkt-muted)]">
          {message}
        </p>
        {reminder ? (
          <RegistrationReminderButton
            title={reminder.title}
            startsAt={reminder.startsAt}
            endsAt={reminder.endsAt}
            url={dto.sharePath}
          />
        ) : null}
      </div>
    );
  }

  if (state === "closed") {
    return (
      <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-canvas)] px-3 py-2 text-sm text-[var(--mkt-muted)]">
        {message}
      </p>
    );
  }

  if (state === "full") {
    return (
      <EmptyState
        icon={<Users className="h-5 w-5" />}
        title="Sold out"
        description={message || "Every seat for this event has been taken."}
      />
    );
  }

  if (state === "waitlist" || state === "open" || state === "closing_soon") {
    const needsConnections =
      !dto.isFree ||
      dto.formFields.some((f) => f.type === "file" || f.key === "payment_screenshot") ||
      openCompetitions.length > 0;
    if (needsConnections && !dto.organizerConnectionsReady) {
      return (
        <p className="rounded-lg border border-warning-line bg-warning-soft px-3 py-2 text-sm text-ink">
          {dto.organizerConnectionsMessage ||
            "Registration uploads and confirmation email are not available until the organiser connects Google Drive and Gmail."}
        </p>
      );
    }
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-[var(--mkt-line)] bg-[var(--mkt-canvas)] px-3 py-2 text-sm text-[var(--mkt-muted)]">
          {message}
        </p>
        <PublicRegisterFormBlock
          {...formCommon}
          inviteToken={inviteToken}
          accessCode={accessCode}
          joinsWaitlist={state === "waitlist"}
        />
        <p className="text-xs text-[var(--mkt-muted)]">{nextLine}</p>
      </div>
    );
  }

  return null;
}

function competitionChoice(c: PublicEventDto["competitions"][number]) {
  return {
    id: c.id,
    name: c.name,
    kind: c.kind,
    description: c.description,
    instructions: "",
    policies: "",
    rulesText: c.rulesText,
    fee: c.fee,
    due: c.due,
    currency: c.currency,
    discountPercent: c.discountPercent,
    discountNote: c.discountNote,
    minTeamSize: c.minTeamSize,
    maxTeamSize: c.maxTeamSize,
    submissionDeadline: c.submissionDeadline,
    prizePool: c.prizePool,
    imageUrl: c.imageUrl,
  };
}

function dtoToFormFields(dto: PublicEventDto): EventFormField[] {
  return dto.formFields.map((f, i) => ({
    id: `${dto.id}-${f.key}`,
    eventId: dto.id,
    key: f.key,
    label: f.label,
    type: f.type,
    required: f.required,
    options: f.options,
    helpText: f.help,
    placeholder: f.placeholder,
    validation: {},
    orderIndex: i,
    scope: f.scope,
    isSystem: ["name", "email", "phone", "payment_screenshot"].includes(f.key),
    archivedAt: null,
    createdAt: "",
    updatedAt: "",
  }));
}
