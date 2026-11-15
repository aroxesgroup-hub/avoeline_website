# 24 — Registration state (A1)

**Status:** shipped  
**Canonical module:** `src/lib/registrationState.ts`  
**Tests:** `src/lib/__tests__/registrationState.test.ts`

One pure helper owns registration open / close / full / waitlist / preview for public UI, competition pages, registration API, and eligibility. Nowhere else invents window math.

## API

```ts
getRegistrationState({
  event,
  competition?,   // single track scope
  competitions?,  // hackathon aggregate when no track selected
  now?,
  timezone?,
  preview?,
  eventTitle?,
}) -> {
  state, opensAt, closesAt, closeInherited,
  message, ctaLabel, canRegister, reminder?
}
```

### States (only these)

| State | Meaning |
| --- | --- |
| `unpublished` | Draft (non-preview) |
| `not_open` | Before registration open |
| `open` | Accepting registrations |
| `closing_soon` | Open and `closesAt - now ≤ 48h` |
| `closed` | After close (or all competitions closed/full after open) |
| `full` | Seats 0, waitlist off |
| `waitlist` | Seats 0, waitlist on |
| `event_ended` | Completed / cancelled / archived |
| `preview` | Staff preview (`canRegister: false`) |

`canRegister` is true only for `open` | `closing_soon` | `waitlist`.

### Locked rules

1. **Open** = event registration open date-time; date-only → `00:00:00` in **event** TZ via `fromEventLocalInput` / `registrationBoundInstant`.
2. **Close** = competition `registrationClosesAt` if set, else event close; date-only → `23:59:59` in event TZ. Missing competition close **inherits** event close — never means closed by itself (`closeInherited: true`).
3. Before open → `not_open` (never `closed`).
4. Draft / unpublished (non-preview) → `unpublished`. Staff preview → `preview`.
5. Completed / cancelled / archived → `event_ended`.
6. After open, seats 0 → `waitlist` if enabled else `full`.
7. **`closing_soon`:** otherwise open and ≤ 48h to close (`CLOSING_SOON_MS`).
8. **Hackathon without `competition`:** before event open → `not_open`. After open, if every competition is `closed` or `full` → `closed`; else seat/waitlist/open/`closing_soon` against the **earliest** effective competition close still accepting (or event close if no tracks).
9. Server re-check (S2): `createPublicRegistration` / `assertPublicRegistrationEvent` call `getRegistrationState` with server `now` and refuse when `!canRegister`.

### Copy table

| State | Message pattern | CTA |
| --- | --- | --- |
| `not_open` | `Registration opens 12 Nov, 10:00 AM (in 1 day)` | none; **Add reminder** (Google + .ics) |
| `open` / `closing_soon` | `Closes 27 Nov (in 16 days)` + `(event deadline)` when inherited | Register |
| `closed` | `Registration closed on 27 Nov` | none |
| `full` | `Sold out` | none |
| `waitlist` | `Join the waitlist` | Join the waitlist |
| `event_ended` | `This event has ended` | none |
| `preview` | Preview-only copy | none |
| `unpublished` | Not published yet | none |

Reminder payload (`reminder`) is set only for `not_open` when `opensAt` is known. UI: `RegistrationReminderButton` reuses calendar builders from `addToCalendar.ts`.

## Consumers

| Surface | Path |
| --- | --- |
| Public DTO | `publicEvent.service.ts` → `PublicEventDto.registration` + per-competition `registerState` / `canRegister` / close fields |
| Register card | `PublicRegisterCard.tsx` |
| Competitions list | `PublicCompetitions.tsx` |
| Track detail | `app/events/[eventId]/tracks/[trackId]/page.tsx` |
| Submit | `registration.service.ts` |
| Eligibility / proof | `publicRegistrationEligibility.ts` |

Legacy wrappers (`isWithinRegistrationDates`, `competitionRegisterState`, `resolveRegisterButtonState`) delegate into `getRegistrationState` or map its states — do not add new call sites to them.

## Related

- Spec cross-links: `docs/11-events-and-hackathon-complete-spec.md` (Public page, Competitions, Registration)
- Engineering: `docs/ENGINEERING_RULES.md` (C3 datetime, C12 tests, C13 docs, S2 server re-check)
