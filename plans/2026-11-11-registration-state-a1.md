# Unify registration state (docs/24 A1)

**Status:** done  
**Shipped:** 2026-11-11

Unify event/competition registration window logic into one pure `getRegistrationState` helper, wire public UI + registration API with TZ-correct date-only bounds, rich copy, and regression tests.

## Canonical API

`src/lib/registrationState.ts` → `getRegistrationState({ event, competition?, competitions?, now, timezone, preview? })`  
→ `{ state, opensAt, closesAt, closeInherited, message, ctaLabel, canRegister, reminder? }`

**States:** `unpublished` | `not_open` | `open` | `closing_soon` | `closed` | `full` | `waitlist` | `event_ended` | `preview`

## Shipped

- Core helper + TZ bounds + copy/reminder
- Public DTO / Register card / Competitions / track detail + Add reminder on `not_open`
- Server enforce in `registration.service` + `publicRegistrationEligibility`; legacy wrappers delegate
- Tests: `registrationState.test.ts`; docs/24 + docs/11 + completeContext

## Key files

- `src/lib/registrationState.ts`
- `src/lib/__tests__/registrationState.test.ts`
- `src/features/events/publicEvent.service.ts`
- `src/features/events/components/public/PublicRegisterCard.tsx`
- `src/features/events/components/public/RegistrationReminderButton.tsx`
- `src/features/registration/registration.service.ts`
- `src/features/registration/publicRegistrationEligibility.ts`
- `docs/24-registration-state.md`
