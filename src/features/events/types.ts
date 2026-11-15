/**
 * Client-safe public event shapes. Do not put secrets, contacts, or raw EventModel here.
 */

import type {
  FormFieldScope,
  FormFieldType,
} from "@/src/features/registration/forms/formFields.types";
import type { HackathonKind } from "@/src/features/hackathon/kinds";
import type { EventLifecycle } from "@/src/lib/eventState";
import type { RegistrationState } from "@/src/lib/registrationState";
import type { EventFormat, EventStatus, EventVisibility } from "@/src/services/models/event.model";

export type { RegistrationState };

export type PublicOrganizerChip = {
  name: string;
  logoUrl?: string | null;
};

export type PublicOrgCredit = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  tier: string;
  type: "sponsor" | "collaborator" | "partner";
  /** Partner type label or collaborator contribution kind — public-safe only. */
  kindLabel?: string;
  trackId?: string;
};

export type PublicFormField = {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options: string[];
  help: string | null;
  placeholder: string | null;
  scope: FormFieldScope;
};

export type PublicPricingTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  availableUntil: string | null;
  seatsAvailable: number | null;
  /** max(0, seatsAvailable - seatsSold) when seats are tracked; else null. */
  seatsLeft: number | null;
};

export type PublicDiscount = {
  kind: "student" | "group";
  percentage: number;
  minGroupSize?: number;
  requiresVerification?: boolean;
};

export type PublicAgendaSpeaker = {
  id: string;
  name: string;
  photoUrl: string;
};

export type PublicAgendaItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  speakerNames: string[];
  speakers: PublicAgendaSpeaker[];
  trackName?: string | null;
};

export type PublicSpeaker = {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
};

export type PublicCompetitionPrize = {
  positionLabel: string;
  amount: string;
  description: string;
};

/** @deprecated Use RegistrationState from registrationState.ts */
export type CompetitionRegisterState = RegistrationState;

export type PublicCompetition = {
  id: string;
  name: string;
  kind: HackathonKind;
  description: string;
  /** Merged rules & instructions (public-safe). */
  rulesText: string;
  imageUrl: string;
  fee: number;
  due: number;
  currency: string;
  discountPercent: number;
  discountNote: string;
  discountExpiresAt: string;
  minTeamSize: number;
  maxTeamSize: number;
  submissionDeadline: string;
  /** Track-only close if set (raw). */
  registrationClosesAt: string;
  /** Track close or event close fallback (ISO). Never null when event has a close. */
  effectiveRegistrationClosesAt: string | null;
  /** True when effective close came from the event deadline. */
  closeInherited: boolean;
  prizePool: string;
  /** Structured prizes from hackathon_track_prizes (public-safe). */
  prizes: PublicCompetitionPrize[];
  registrationOpen: boolean;
  registerState: RegistrationState;
  registrationMessage: string;
  registrationCtaLabel: string | null;
  canRegister: boolean;
  sponsorLogoUrl?: string | null;
  sponsorName?: string | null;
};

export type PublicSchedule = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  /** Physical / virtual / hybrid — never meeting link or password. */
  formatLabel: string;
};

export type PublicLocation = {
  venueName: string;
  address: string;
  city: string;
  mapsUrl: string;
};

/** @deprecated Prefer RegistrationState on PublicEventDto.registration.state */
export type RegisterButtonState = RegistrationState;

/** @deprecated Legacy CTA labels from resolveRegisterButtonState only. */
export type LegacyRegisterButtonState =
  | "open"
  | "admin_preview"
  | "no_registration"
  | "ended"
  | "opens_at"
  | "competitions_closed"
  | "closed"
  | "waitlist"
  | "sold_out";

export type PublicEventDto = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  bannerImage: string;
  galleryImages: string[];
  promoVideoUrl: string;
  status: EventStatus;
  visibility: EventVisibility;
  lifecycle: EventLifecycle;
  timezone: string;
  tags: string[];
  categoryLabel: string | null;
  formatLabel: string | null;
  schedule: PublicSchedule;
  location: PublicLocation;
  registrationOpenDate: string;
  registrationCloseDate: string;
  requiresRegistration: boolean;
  waitlistEnabled: boolean;
  requiresApproval: boolean;
  seats: { total: number; taken: number; left: number | null };
  isFree: boolean;
  currency: string;
  pricingTiers: PublicPricingTier[];
  discounts: PublicDiscount[];
  /** Opted-in public promo chips only — never private codes. */
  publicPromos: Array<{
    id: string;
    label: string;
    discountSummary: string;
    trackId: string | null;
  }>;
  showSponsors: boolean;
  showCollaborators: boolean;
  showPartners: boolean;
  /** Tier order for public sponsor logo sizing — matches `EventModel.sponsorTiers`. */
  sponsorTiers: string[];
  organizerChip: PublicOrganizerChip;
  sponsors: PublicOrgCredit[];
  collaborators: PublicOrgCredit[];
  partners: PublicOrgCredit[];
  formFields: PublicFormField[];
  agenda: PublicAgendaItem[];
  speakers: PublicSpeaker[];
  competitions: PublicCompetition[];
  isHackathon: boolean;
  groupRegistration: boolean;
  groupMinSize: number;
  groupMaxSize: number;
  allowTierSelfSelect: boolean;
  attendeeTiers: string[];
  lockedTiers: string[];
  /** Canonical registration window (docs/24 A1). */
  registration: {
    state: RegistrationState;
    opensAt: string | null;
    closesAt: string | null;
    closeInherited: boolean;
    message: string;
    ctaLabel: string | null;
    canRegister: boolean;
    reminder: { startsAt: string; endsAt: string; title: string } | null;
  };
  /** @deprecated Use registration.state */
  registerState: RegisterButtonState;
  registerOpensAt: string | null;
  admissionLabel: string;
  sharePath: string;
  /** Phase A: organizer has active Drive + Gmail for proofs / registration mail. */
  organizerConnectionsReady: boolean;
  organizerConnectionsMessage: string | null;
  /** Paid events only — organizer bank/wallet/reference text for the register card. */
  paymentInstructions: string | null;
};

export type PublicEventGateReason =
  | "needs_code"
  | "bad_code"
  | "needs_invite"
  | "invite_expired"
  | "invite_used"
  | "not_whitelisted"
  | "not_found"
  | "closed"
  | "rate_limited";

export type PublicEventView =
  | { kind: "unavailable" }
  | {
      kind: "gated";
      title: string;
      eventId: string;
      reason: PublicEventGateReason;
      inviteToken?: string;
      meta?: {
        organizerName?: string;
        hasCode?: boolean;
        hasWhitelist?: boolean;
        whitelistEmailVerify?: boolean;
      };
    }
  | {
      kind: "full";
      dto: PublicEventDto;
      preview: boolean;
      gate?: { reason: PublicEventGateReason; inviteToken?: string };
    };

export type PublicEventAttempt = {
  token?: string | null;
  code?: string | null;
  email?: string | null;
  unlockToken?: string | null;
};

export type PublicEventViewer = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  userType?: string | null;
  managedOrgIds?: string[];
  presidentOfOrgIds?: string[];
};
