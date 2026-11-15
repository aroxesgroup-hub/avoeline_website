import { Users } from "lucide-react";
import { formatDateMedium } from "@/src/lib/datetime";
import { formatCurrency } from "@/src/lib/money";
import type { RegistrationState } from "@/src/lib/registrationState";
import { EmptyState } from "@/src/shared_components/ui/EmptyState";
import { RegistrationForm } from "@/src/features/registration/components/RegistrationForm";
import type { EventFormField } from "@/src/features/registration/forms/formFields.types";
import type { PublicEventDto } from "@/src/features/events/types";
import { whatHappensNextLine } from "./publicPage.logic";
import { RegistrationReminderButton } from "./RegistrationReminderButton";

type Props = {
  dto: PublicEventDto;
  preview: boolean;
  inviteToken?: string | null;
  accessCode?: string | null;
  attendee?: { name?: string; email?: string } | null;
  initialTrackId?: string | null;
};

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
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
      <p className="text-2xs font-medium uppercase text-ink-soft">
        {dto.isHackathon ? "Ticket" : "Admission"}
      </p>
      <p className="mt-1 font-display text-2xl text-ink">{dto.admissionLabel}</p>

      {dto.pricingTiers.length > 0 && !dto.isHackathon ? (
        <ul className="mt-4 space-y-2 border-t border-line pt-4">
          {dto.pricingTiers.map((t) => (
            <li key={t.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="break-words text-ink">
                {t.name}
                {t.availableUntil ? (
                  <span className="ml-1 text-2xs text-ink-soft">
                    until {formatDateMedium(t.availableUntil)}
                  </span>
                ) : null}
                {t.seatsLeft != null ? (
                  <span className="ml-1 text-2xs text-ink-soft">{t.seatsLeft} left</span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums text-ink-soft">
                {formatCurrency(t.price, dto.currency, "Free")}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

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

  if (state === "preview" || preview) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-warning-line bg-warning-soft px-3 py-2 text-sm text-ink">
          {message || "Preview only — registration cannot be submitted from this view."}
        </p>
        <RegistrationForm
          eventId={dto.id}
          isPaid={!dto.isFree}
          priceLabel={dto.admissionLabel}
          inviteToken={null}
          accessCode={null}
          joinsWaitlist={false}
          needsApproval={dto.requiresApproval}
          formFields={formFields}
          competitions={openCompetitions.map((c) => competitionChoice(c))}
          groupRegistration={dto.groupRegistration}
          groupMinSize={dto.groupMinSize}
          groupMaxSize={dto.groupMaxSize}
          attendee={attendee}
          tierChoices={[]}
          previewOnly
          paymentInstructions={dto.paymentInstructions}
          publicPromos={dto.publicPromos}
          initialTrackId={initialTrackId}
        />
        <p className="text-xs text-ink-soft">{nextLine}</p>
      </div>
    );
  }

  if (state === "unpublished") {
    return (
      <p className="rounded-lg border border-line bg-muted px-3 py-2 text-sm text-ink-soft">
        {message}
      </p>
    );
  }

  if (state === "event_ended") {
    return (
      <p className="rounded-lg border border-line bg-muted px-3 py-2 text-sm text-ink-soft">
        {message}
      </p>
    );
  }

  if (state === "not_open") {
    const reminder = dto.registration.reminder;
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-line bg-muted px-3 py-2 text-sm text-ink-soft">
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
      <p className="rounded-lg border border-line bg-muted px-3 py-2 text-sm text-ink-soft">
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
        <p className="rounded-lg border border-line bg-muted px-3 py-2 text-sm text-ink-soft">
          {message}
        </p>
        <RegistrationForm
          eventId={dto.id}
          isPaid={!dto.isFree}
          priceLabel={dto.admissionLabel}
          inviteToken={inviteToken}
          accessCode={accessCode}
          joinsWaitlist={state === "waitlist"}
          needsApproval={dto.requiresApproval}
          formFields={formFields}
          competitions={openCompetitions.map((c) => competitionChoice(c))}
          groupRegistration={dto.groupRegistration}
          groupMinSize={dto.groupMinSize}
          groupMaxSize={dto.groupMaxSize}
          attendee={attendee}
          publicPromos={dto.publicPromos}
          initialTrackId={initialTrackId}
          tierChoices={
            openCompetitions.length
              ? []
              : dto.allowTierSelfSelect
                ? dto.attendeeTiers.filter((t) => !dto.lockedTiers.includes(t))
                : []
          }
          paymentInstructions={dto.paymentInstructions}
        />
        <p className="text-xs text-ink-soft">{nextLine}</p>
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
