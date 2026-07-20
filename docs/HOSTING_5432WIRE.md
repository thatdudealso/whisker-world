# Hosting on 5432wire (planned)

**Document only.** Do not provision AWS, Cognito apps, or databases from this scaffold unless the captain explicitly orders it. Do not modify the 5432wire monorepo as part of Whisker World Phase 0.

## Public path

| Item | Value |
|------|-------|
| Host | `5432wire.com` |
| Path | `/whisker-world` |
| Full URL | `https://5432wire.com/whisker-world` |
| Vite prod `base` | `/whisker-world/` |

Static (or SPA) assets for the game client are expected to be served under that path. Exact deploy plumbing lives with 5432wire ops later.

## Cognito - identity only

- Cognito authenticates **who the player is** (login, session, account id).
- Cognito is **not** the game save store, inventory DB, or leaderboard store.
- Tokens may authorize API calls to the Whisker World backend; game state still lives in the game DB.

## Database isolation

| Item | Value |
|------|-------|
| Engine | Postgres (planned) |
| Database name | `whisker_world` |
| Isolation | Separate DB from other 5432wire products |

Rationale: avoid coupling game schemas / migrations / backups to unrelated apps. Connection strings and secrets stay out of this public client repo.

## Client vs services

- This repo: browser client (Vite + Three.js) + docs + future `services/api` stubs.
- Server APIs, IAM, and DB provisioning: later, under explicit ops tasks - not Phase 0.
