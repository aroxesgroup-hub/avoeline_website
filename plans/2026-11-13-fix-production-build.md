# Restore modules blocking next build

Status: done

## What shipped

- `src/lib/registrationState.ts` — `getRegistrationState` and `registrationBoundInstant` (docs/24).
- `src/lib/email/emailTestGuard.ts` — `decideEmailRoute` and `sendViaMailpit` (docs/25).
- Further compile gaps: `agendaSort`, client `PublicSponsorsStrip`, `JudgeInviteRespondForm`, and `fitCenter`.
- `npm run build` completes and writes `.next`.

## Next

Start the production server with `APP_ENV=local`, then run `npm run test:load:reads` with a published `EVENT_ID`.
