# My Vet Backend and Frontend Integration Implementation Plan

> Revised 2026-08-19 after architecture, security, compatibility, and frontend-coverage review.
>
> This document is the implementation source of truth. Complete tasks in order, check every acceptance criterion, and do not copy code from the superseded draft.

## Goal

Build a production-oriented Express + TypeScript API for the existing My Vet Next.js application, connect the current UI to real data, and verify the result with automated tests and smoke tests.

## Repository layout

- The existing Next.js 16 frontend remains at the repository root.
- The API lives in `backend/` with its own `package.json` and lockfile.
- The repository is **not** converted to a `frontend/` workspace. Root scripts use `npm --prefix backend` to run the API.
- PostgreSQL development and test databases run through root `docker-compose.yml`.

## Fixed architecture decisions

- Node.js: `>=20`
- Express: `^5`
- TypeScript: strict ESM (`"type": "module"`, `NodeNext`)
- Prisma ORM and Client: `^7`
- PostgreSQL driver: `pg` through `@prisma/adapter-pg`
- Zod: `^4`
- Stripe Node SDK: `^19`; use the SDK's default API version
- Tests: Vitest + Supertest against an isolated PostgreSQL test database
- One `VET` user owns at most one `Practice`; enforce this in the database
- IDs: CUID strings
- Money: Prisma `Decimal` plus ISO currency code; serialize money as strings at the API boundary
- Dates: UTC timestamps. Appointment display timezone belongs to the practice and is stored as an IANA timezone
- Access tokens live in memory in the browser, never `localStorage`
- Refresh tokens are opaque, hashed in the database, rotated, and delivered only through an HttpOnly cookie
- Backend authorization is the security boundary. Frontend redirects and Next.js Proxy checks are optimistic UX checks only
- All mutations that update related or denormalized records use transactions

## Global API contract

Every JSON response uses one envelope:

```ts
type ApiEnvelope<T> = {
  success: boolean
  data: T | null
  message: string | null
  error: {
    code: string
    details?: Record<string, string[]>
    requestId?: string
  } | null
}
```

Paginated payloads use:

```ts
type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

Additional global rules:

- Prefix all API routes with `/api`.
- Validate body, query, and route parameters before controllers.
- Controllers consume `req.validatedBody`, `req.validatedQuery`, and `req.validatedParams`; they do not read unvalidated input.
- Never return password hashes, token hashes, Stripe secrets, R2 credentials, or raw Prisma errors.
- Map known Prisma, Zod, Multer, JWT, and Stripe failures to stable error codes.
- Apply ownership checks at the service/data layer, not only in the UI.
- Commit generated migrations, but do not commit `.env`, generated Prisma Client output, test artifacts, or uploaded files.
- Each task must pass `npm run typecheck`, relevant tests, and `npm run lint` before its commit.

---

## Task 0: Architecture, tooling, and local infrastructure

**Files**

- Create `docker-compose.yml`
- Create `backend/package.json`
- Create `backend/package-lock.json`
- Create `backend/tsconfig.json`
- Create `backend/tsconfig.build.json`
- Create `backend/vitest.config.ts`
- Create `backend/eslint.config.js`
- Create `backend/prisma.config.ts`
- Create `backend/prisma/schema.prisma` with the Prisma 7 generator and provider-only datasource skeleton
- Create `backend/.env.example`
- Create `backend/.env.test.example`
- Create `backend/.gitignore`
- Create `backend/src/test/setup.ts`
- Create `backend/src/test/tooling.unit.test.ts`

### Steps

- [ ] Add two PostgreSQL services:
  - `postgres` on host port `5432`, database `myvet`
  - `postgres-test` on host port `5433`, database `myvet_test`
  - Add health checks, named volumes, explicit users/passwords for local development, and no production assumptions.
- [ ] Initialize the backend as an ESM package with:

```json
{
  "type": "module",
  "engines": { "node": ">=20" }
}
```

- [ ] Pin compatible major ranges and commit the lockfile.

Runtime dependencies:

```txt
express@^5 cors helmet cookie-parser morgan express-rate-limit
zod@^4 dotenv bcryptjs jsonwebtoken
@prisma/client@^7 @prisma/adapter-pg@^7 pg
socket.io stripe@^19
@aws-sdk/client-s3 multer file-type
```

Development dependencies:

```txt
typescript tsx prisma@^7 vitest supertest cross-env
eslint @eslint/js typescript-eslint
@types/node @types/express @types/cors @types/cookie-parser
@types/morgan @types/jsonwebtoken @types/multer @types/supertest @types/pg
```

- [ ] Configure scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src prisma --max-warnings=0",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run src/**/*.unit.test.ts",
    "test:integration": "vitest run src/**/*.integration.test.ts",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

- [ ] Configure strict TypeScript with `target: ES2022` and `module/moduleResolution: NodeNext`.
  - `tsconfig.json` typechecks `src/`, tests, config, and `prisma/seed.ts` with `noEmit`.
  - `tsconfig.build.json` compiles production `src/` only with `rootDir: src` and `outDir: dist`, so `npm start` correctly runs `dist/server.js`.
- [ ] Configure ESLint for strict TypeScript and ignore `dist/`, coverage, and generated Prisma Client output.
- [ ] Keep `dotenv`. Prisma 7's `import "dotenv/config"` imports the `dotenv` package; Prisma does not replace it.
- [ ] Add `backend/prisma.config.ts`:

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

- [ ] Add the initial `schema.prisma` skeleton with `provider = "prisma-client"`, required generated-client output, and `datasource db { provider = "postgresql" }`; Task 3 adds the product models.

- [ ] Configure Vitest to run unit tests without a database and integration tests serially against `DATABASE_URL_TEST`. Tests must fail fast if the test URL is missing or points at the development database. Add one tooling smoke test so `vitest run` never relies on a no-tests-success option.
- [ ] Document startup commands in the root README: start Docker, copy env examples, migrate, seed, then run both apps.

### Acceptance criteria

- `docker compose up -d` reports both databases healthy.
- `npm install` in `backend/` produces a reproducible lockfile.
- `npm run typecheck` and an empty `npm test` invocation succeed.
- Prisma config resolves `DATABASE_URL` without a datasource URL inside `schema.prisma`.

### Commit

```bash
git commit -m "chore: add backend architecture and local database tooling"
```

---

## Task 1: Express scaffolding and configuration

**Files**

- Create `backend/src/app.ts`
- Create `backend/src/server.ts`
- Create `backend/src/config/env.ts`
- Create `backend/src/config/database.ts`
- Create `backend/src/config/stripe.ts`
- Create `backend/src/modules/subscriptions/webhook.routes.ts`
- Create a minimal `backend/src/shared/middleware/request-id.ts`
- Create a minimal `backend/src/shared/middleware/error-handler.ts`

### Steps

- [ ] Parse and validate environment variables with Zod. Non-null assertions are not validation.
- [ ] Include at least:

```txt
PORT NODE_ENV DATABASE_URL DATABASE_URL_TEST
JWT_ACCESS_SECRET JWT_REFRESH_SECRET JWT_ACCESS_EXPIRY JWT_REFRESH_EXPIRY
FRONTEND_URL COOKIE_DOMAIN COOKIE_SECURE COOKIE_SAME_SITE
CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_R2_ACCESS_KEY CLOUDFLARE_R2_SECRET_KEY
CLOUDFLARE_R2_BUCKET CLOUDFLARE_CDN_URL
STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
```

- [ ] Require strong JWT secrets outside tests. Allow Stripe/R2 placeholders only when their feature is disabled in development or tests.
- [ ] Generate Prisma Client to `backend/src/generated/prisma` with the Prisma 7 `prisma-client` generator.
- [ ] Instantiate Prisma 7 using `PrismaPg` and the generated client:

```ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
```

- [ ] Retain the development singleton guard so watch-mode reloads do not create extra pools.
- [ ] Create the Stripe client lazily and do not set `apiVersion`; the pinned SDK supplies it.
- [ ] Establish middleware in this exact order. Task 1 uses minimal request-ID/error middleware and reserves the rate-limiter slot; Task 2 expands the middleware without changing ordering:
  1. request ID
  2. security headers, CORS, structured logging
  3. `POST /api/subscriptions/webhook` with `express.raw({ type: 'application/json' })`
  4. `express.json()` and `express.urlencoded()`
  5. cookie parser and general rate limiter
  6. health/readiness and feature routers
  7. not-found handler
  8. centralized error handler
- [ ] The Task 1 webhook router may return `501 WEBHOOK_NOT_CONFIGURED`; Task 13 replaces its handler without moving the route below JSON parsing.
- [ ] Add `/api/health` and `/api/readiness`. Readiness performs a lightweight database query.
- [ ] Configure `trust proxy` from an explicit environment value before IP-based rate limiting.
- [ ] Start with `http.createServer(app)` so Socket.IO can attach later.
- [ ] Handle `SIGTERM` and `SIGINT`: stop accepting traffic, close Socket.IO/HTTP, disconnect Prisma, then exit with a timeout fallback.

### Acceptance criteria

- Health returns the standard envelope.
- Readiness returns 503 when PostgreSQL is unavailable.
- A raw-body test proves the webhook route receives a `Buffer`.
- Server shutdown closes the database pool.

### Commit

```bash
git commit -m "feat: scaffold Express API with Prisma 7 configuration"
```

---

## Task 2: Shared request validation, errors, pagination, and security middleware

**Files**

- Create `backend/src/shared/types/express.d.ts`
- Create `backend/src/shared/utils/api-error.ts`
- Create `backend/src/shared/utils/api-response.ts`
- Create `backend/src/shared/utils/pagination.ts`
- Create `backend/src/shared/utils/slug.ts`
- Create `backend/src/shared/middleware/validate.ts`
- Expand `backend/src/shared/middleware/error-handler.ts`
- Create `backend/src/shared/middleware/rate-limiter.ts`
- Expand `backend/src/shared/middleware/request-id.ts`
- Create `backend/src/shared/middleware/origin-check.ts`

### Steps

- [ ] Augment Express `Request` with:

```ts
interface Request {
  user?: { userId: string; role: 'PET_OWNER' | 'VET' | 'ADMIN' }
  validatedBody?: unknown
  validatedQuery?: unknown
  validatedParams?: unknown
  requestId: string
}
```

- [ ] Implement generic typed helpers or narrow types in controllers; avoid `any` casts.
- [ ] Implement `validateBody`, `validateQuery`, and `validateParams` with Zod 4.
  - Use `error.issues`, not removed `error.errors`.
  - Store parsed results on validated request properties.
  - Never assign to Express 5's read-only `req.query`.
- [ ] Normalize Zod issues into the global error envelope.
- [ ] Handle Prisma unique, foreign-key, not-found, and validation failures with stable codes.
- [ ] Handle malformed JSON, upload limits, unsupported media, JWT errors, and unknown failures.
- [ ] Add pagination that rejects non-numeric input and caps limits at 100.
- [ ] Add route-specific rate limits for auth, password reset, reviews, uploads, contact submissions, and public analytics writes.
- [ ] Keep the in-memory limiter for local/single-instance development and document that production multi-instance deployment requires a shared store.
- [ ] Add strict Origin validation for cookie-authenticated refresh/logout routes, especially if `SameSite=None` is configured.
- [ ] For Express 5 wildcard parameters use named syntax such as `/*key`; wildcard values are arrays and must be normalized safely.

### Tests

- Validation stores transformed values and strips unknown fields.
- Invalid query input does not mutate `req.query`.
- Prisma errors and Zod errors produce the same envelope shape.
- Rate-limit responses include the same envelope.

### Commit

```bash
git commit -m "feat: add validated request and API middleware foundation"
```

---

## Task 3: Prisma 7 schema and initial migration

**Files**

- Expand `backend/prisma/schema.prisma`
- Generate `backend/prisma/migrations/*_init/`

### Prisma 7 configuration

- [ ] Use the required generated-client output:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

The datasource block remains because it declares the provider. Only the connection URL moves to `prisma.config.ts`.

### Models and invariants

- [ ] Define explicit enums for role, practice/appointment/review/blog/enquiry/subscription/featured-listing statuses, media type, notification category, contact-action type, pricing kind, and upload purpose.
- [ ] Define the complete product model inventory; do not rely on an external or superseded schema:
  - `User`: identity, password hash, role, contact/profile fields, preferences, soft-delete timestamp, relations.
  - `RefreshToken` and `PasswordResetToken`: hashed authentication artifacts and lifecycle metadata.
  - `Practice`: public profile, moderation state, contact details, timezone, owner, rating aggregates, featured state, timestamps.
  - `Service` and `ServiceCategory`: practice services, description, Decimal price/currency, active state, optional global category.
  - `AnimalType` and `PracticeAnimalType`: active global taxonomy and practice many-to-many assignment.
  - `Facility`, `TeamMember`, `OpeningHours`, `HolidayHours`, and `EmergencyHours`: practice-owned operational data.
  - `UploadedAsset` and `GalleryMedia`: owned R2 objects and attached public gallery records.
  - `Pricing`: service-price sections and health packages used by the current vet pricing screen.
  - `Pet` and `Appointment`: pet-owner records and the appointment lifecycle.
  - `Review` and `HelpfulVote`: moderated reviews, replies, and per-user helpful votes.
  - `SubscriptionPlan`, `Subscription`, `SubscriptionInvoice`, and `ProcessedStripeEvent`: billing catalog, current state, paid revenue records, and webhook deduplication.
  - `FeaturedListingPlan` and `FeaturedListing`: boost catalog, purchases, active periods, and Stripe references.
  - `BlogPost`, `Sponsorship`, and `ContactEnquiry`: managed public/admin content.
  - `Notification`: persistent user notification, category, action URL, read state, timestamps.
  - `SavedPractice`: unique user/practice join with creation timestamp.
  - `ProfileView` and `ContactAction`: practice analytics events with source/type and timestamps.
  - `AdminSettings`: one-to-one persisted admin preferences.
- [ ] Every practice-owned child has a required `practiceId` relation and an ownership/index strategy. Every mutable model has `createdAt`/`updatedAt` unless it is an immutable event row.
- [ ] `User`:
  - normalized unique email
  - optional one-to-one `practice`
  - `deletedAt`
  - retain `twoFactorEnabled` only as a future-facing field; no API may claim 2FA is active
- [ ] `Practice`:
  - `ownerId @unique` to enforce one practice per vet account
  - `timezone String @default("Europe/London")`
  - indexes on `status`, `rating`, `createdAt`
- [ ] `RefreshToken`:
  - `hashedToken String @unique`
  - `family String`
  - `expiresAt`, `usedAt?`, `revokedAt?`, `replacedById?`, `createdAt`
  - indexes on `userId`, `family`, `expiresAt`
- [ ] `PasswordResetToken`:
  - `hashedToken String @unique`, `userId`, `expiresAt`, `usedAt?`, `createdAt`
- [ ] `Review`:
  - `@@unique([userId, practiceId])`
  - indexes on `status`, `practiceId`, `createdAt`
  - relation to `HelpfulVote[]`
- [ ] `HelpfulVote`:
  - `userId`, `reviewId`, `createdAt`
  - `@@id([userId, reviewId])`
  - cascade on review/user deletion
- [ ] `Appointment`:
  - keep UTC `date` and canonical `time`
  - `@@unique([practiceId, date, time])` for the MVP single-slot model
  - explicit indexes on `Appointment.userId`, `Appointment.practiceId`, `status`, and `date`
  - document that multi-clinician capacity requires a future `staffMemberId`/slot model
- [ ] `Pricing`:
  - `id`, `practiceId`, `kind` (`SERVICE` or `HEALTH_PACKAGE`), `section`, `name`, `description?`, `price Decimal`, `currency`, `billingPeriod?`, `sortOrder`, `active`, timestamps
  - index on `(practiceId, kind, active)`
- [ ] `GalleryMedia`: unique R2 `key`, practice relation, media metadata and timestamps.
- [ ] `UploadedAsset`: unique R2 key, URL, detected MIME type, byte size, purpose, owner user/practice, optional attachment timestamp, and indexes for ownership/cleanup.
- [ ] `ProcessedStripeEvent`: Stripe event ID primary key, type, processed timestamp.
- [ ] `SubscriptionInvoice`: unique Stripe invoice ID, subscription/practice relation, amount paid, currency, period dates, paid timestamp.
- [ ] `FeaturedListingPlan`: name, tier, duration, price, currency, Stripe price ID, active.
- [ ] `FeaturedListing`: add status and plan relation; retain period and Stripe payment/session references.
- [ ] `AdminSettings`: one-to-one admin user relation, backup email, locale, notification preferences, timestamps.
- [ ] Add indexes to `Notification.userId`, `ProfileView.practiceId/date`, `ContactAction.practiceId/date`, saved practices, and all commonly filtered foreign keys.
- [ ] Add appropriate `onDelete` behavior. Financial/audit records must not disappear through accidental cascades.
- [ ] Add `updatedAt` to mutable models.
- [ ] Use enums for subscription, featured-listing, contact-action, and pricing statuses/types instead of free-form strings.

### Migration verification

- [ ] Generate and apply the migration to both development and test databases.
- [ ] Run `prisma validate`, `prisma generate`, and `npm run typecheck`.
- [ ] Add a schema integration test for all required uniqueness constraints.

### Commit

```bash
git commit -m "feat: add Prisma 7 schema with security and integrity constraints"
```

---

## Task 4: Authentication and session security

**Files**

- Create `backend/src/modules/auth/auth.validation.ts`
- Create `backend/src/modules/auth/auth.service.ts`
- Create `backend/src/modules/auth/auth.controller.ts`
- Create `backend/src/modules/auth/auth.middleware.ts`
- Create `backend/src/modules/auth/auth.routes.ts`
- Create `backend/src/modules/auth/token.service.ts`
- Create `backend/src/modules/auth/user-auth-cache.ts`
- Create `backend/src/shared/services/mail.service.ts`

### Endpoints

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Steps

- [ ] Normalize email with `trim().toLowerCase()` in registration, login, and password-reset flows.
- [ ] Keep public registration roles limited to `PET_OWNER` and `VET`.
- [ ] Hash passwords with bcrypt cost 12 and enforce a minimum password policy in Zod.
- [ ] Use short-lived signed access tokens containing only user ID, role, issuer, audience, issued time, and expiry.
- [ ] Generate refresh tokens from cryptographically random bytes. Return raw tokens only in an HttpOnly cookie.
- [ ] Store only SHA-256 refresh-token hashes.
- [ ] Token format must expose a non-secret family identifier so a reused rotated token can revoke its entire family.
- [ ] Calculate refresh expiry from parsed `JWT_REFRESH_EXPIRY`; do not hardcode seven days. Cookie lifetime uses the same value.
- [ ] Rotate refresh tokens in one transaction:
  1. lock/find the stored hash
  2. reject expired/revoked/deleted-user tokens
  3. mark old token used/revoked
  4. insert its replacement in the same family
  5. return the new raw value
- [ ] If a used token is presented again, revoke every active token in that family and return `TOKEN_REUSE_DETECTED`.
- [ ] Refresh and logout routes use Origin checking and do not require a still-valid access token.
- [ ] `authenticate` verifies signature/issuer/audience, then checks a 60-second user cache backed by the database. Reject missing, deleted, or role-mismatched users.
- [ ] Role changes, password resets, password changes, soft deletion, and admin deactivation revoke all refresh tokens and invalidate the user cache.
- [ ] Implement forgot-password without account enumeration. Store only a hashed, single-use, short-lived reset token.
- [ ] Mail delivery goes through `MailService`; development may log a reset URL, but production responses never return the token.
- [ ] Remove the 2FA settings endpoint. Keep the field documented as future work until enrollment and challenge flows exist.
- [ ] Configure cookie name/path/domain/secure/same-site from validated environment settings. Use `Path=/` so Next.js Proxy can perform an optimistic presence check.

### Tests

- Register, normalized duplicate rejection, login, refresh rotation, logout.
- Concurrent/reused refresh token revokes the family.
- Deleted user and changed role are rejected.
- Forgot-password does not reveal account existence; reset is one-time and revokes sessions.
- Cookie and Origin behavior is correct.

### Commit

```bash
git commit -m "feat: add secure authentication and refresh-token rotation"
```

---

## Task 5: Users and account settings

**Files**

- Create `backend/src/modules/users/users.validation.ts`
- Create `backend/src/modules/users/users.service.ts`
- Create `backend/src/modules/users/users.controller.ts`
- Create `backend/src/modules/users/users.routes.ts`

### Endpoints

```txt
GET    /api/users/me/profile
PUT    /api/users/me/profile
PUT    /api/users/me/password
PUT    /api/users/me/preferences
DELETE /api/users/me
```

### Steps

- [ ] All controllers consume validated request properties.
- [ ] Select only safe profile fields; never spread a Prisma user into a response.
- [ ] Password change verifies the old password, updates the hash, revokes refresh tokens, and clears the auth cache transactionally.
- [ ] Preferences support language and notification preferences. Do not expose a working 2FA toggle.
- [ ] Soft deletion revokes sessions immediately and marks owned practice non-public according to an explicit product rule.
- [ ] Document GDPR/data-retention follow-up for appointments, reviews, analytics, and financial records.

### Tests

- Ownership, safe DTO fields, password/session revocation, and deleted-account behavior.

### Commit

```bash
git commit -m "feat: add user profile and account management"
```

---

## Task 6: Practices, directory search, and saved practices

**Files**

- Create `backend/src/modules/practices/practices.validation.ts`
- Create `backend/src/modules/practices/practices.service.ts`
- Create `backend/src/modules/practices/practices.controller.ts`
- Create `backend/src/modules/practices/practices.routes.ts`

### Endpoints

```txt
GET  /api/practices
GET  /api/practices/saved
GET  /api/practices/:slug
POST /api/practices
PUT  /api/practices/:id
POST /api/practices/:id/save
POST /api/practices/:id/contact-action
```

### Steps

- [ ] Validate and use parsed search, filters, sorting, and pagination.
- [ ] Public reads return only approved, non-deleted practices.
- [ ] Enforce one practice per vet with the schema constraint and map the conflict cleanly.
- [ ] Generate slugs, then rely on the unique constraint; retry a bounded number of times on collision.
- [ ] Owner updates cannot set moderation, rating, review count, featured, subscription, or owner fields.
- [ ] Saved-practice toggles validate that the target practice is public.
- [ ] Record profile views asynchronously or after the response; rate-limit and deduplicate obvious bot/reload traffic.
- [ ] Validate contact-action type with an enum, verify the practice exists, rate-limit, and avoid returning internal analytics data.
- [ ] Serialize Decimal prices and normalize nested response DTOs for the current frontend.

### Tests

- Filters/sorts/pagination, non-public visibility, ownership, save uniqueness, slug collision, and analytics validation.

### Commit

```bash
git commit -m "feat: add practice directory and saved-practice APIs"
```

---

## Task 7: Pets

**Files**

- Create `backend/src/modules/pets/pets.validation.ts`
- Create `backend/src/modules/pets/pets.service.ts`
- Create `backend/src/modules/pets/pets.controller.ts`
- Create `backend/src/modules/pets/pets.routes.ts`

### Endpoints

```txt
GET    /api/pets
POST   /api/pets
PUT    /api/pets/:id
DELETE /api/pets/:id
```

### Steps

- [ ] Restrict the module to pet owners unless an explicit admin pathway is added.
- [ ] Consume validated inputs and enforce ownership in every mutation.
- [ ] Validate animal type against active global types or document why free text is retained.
- [ ] Prevent deletion when future appointments reference the pet; return a conflict or cancel through an explicit workflow.
- [ ] Image values must reference an owned uploaded asset.

### Tests

- CRUD, ownership isolation, referenced-pet deletion, and invalid images/types.

### Commit

```bash
git commit -m "feat: add pet management APIs"
```

---

## Task 8: Appointments and appointment notifications

**Files**

- Create `backend/src/modules/appointments/appointments.validation.ts`
- Create `backend/src/modules/appointments/appointments.service.ts`
- Create `backend/src/modules/appointments/appointments.controller.ts`
- Create `backend/src/modules/appointments/appointments.routes.ts`
- Create `backend/src/shared/services/notification.service.ts` as the durable notification writer used by domain modules; Task 12 adds Socket.IO delivery.

### Endpoints

```txt
GET   /api/appointments
GET   /api/appointments/vet
POST  /api/appointments
PUT   /api/appointments/:id
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/confirm
PATCH /api/appointments/:id/complete
```

### Steps

- [ ] Parse appointment input using the practice's IANA timezone and store the canonical UTC timestamp.
- [ ] Reject invalid or past appointment times.
- [ ] Verify pet ownership and approved-practice status.
- [ ] Enforce the MVP unique slot constraint and map races to `APPOINTMENT_SLOT_TAKEN`; a query-only check is insufficient.
- [ ] Define an explicit status transition table. Reject cancel/confirm/reschedule/complete transitions that are not allowed.
- [ ] Use `prisma.$transaction` for booking/status changes and durable notification creation through the shared notification writer.
- [ ] Emit notifications after commit:
  - booked: vet/practice owner
  - confirmed/cancelled/rescheduled: affected pet owner and vet as appropriate
- [ ] Pagination and upcoming/previous filters use validated inputs and the full UTC timestamp, not a separate date comparison that ignores time.

### Tests

- Past-date rejection, timezone conversion, double-booking race, pet ownership, transition rules, and notification persistence.

### Commit

```bash
git commit -m "feat: add safe appointment booking and lifecycle"
```

---

## Task 9: Reviews, helpful votes, replies, and rating integrity

**Files**

- Create `backend/src/modules/reviews/reviews.validation.ts`
- Create `backend/src/modules/reviews/reviews.service.ts`
- Create `backend/src/modules/reviews/reviews.controller.ts`
- Create `backend/src/modules/reviews/reviews.routes.ts`
- Create `backend/src/modules/reviews/review-rating.service.ts`

### Endpoints

```txt
GET    /api/reviews/me
GET    /api/reviews/practice/:practiceId
POST   /api/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/reply
POST   /api/reviews/:id/helpful
DELETE /api/reviews/:id/helpful
```

### Steps

- [ ] Rely on `@@unique([userId, practiceId])` and map duplicate races to a conflict.
- [ ] Decide whether reviews require a completed appointment; implement that rule explicitly rather than leaving it implicit.
- [ ] Default new reviews to `PENDING` if admin moderation is required. Do not leave an `auto-approve for now` branch in production code.
- [ ] Recalculate rating and review count from approved reviews in the same transaction as create/update/delete/moderation.
- [ ] Implement helpful/unhelpful with `HelpfulVote`; the denormalized helpful count, if retained, must update transactionally.
- [ ] Vet replies require ownership of the reviewed practice and notify the review author after commit.
- [ ] New review submissions notify the practice owner.
- [ ] Reuse the durable notification writer introduced in Task 8; do not import a Socket.IO transport directly into review transactions.
- [ ] Admin moderation calls the shared rating service after every status change.

### Tests

- Duplicate race, rating recalculation, moderation recalculation, one helpful vote per user, ownership, and notifications.

### Commit

```bash
git commit -m "feat: add transactional reviews and helpful votes"
```

---

## Task 10: Vet dashboard, pricing, and featured listings

**Files**

- Create `backend/src/modules/vet/vet.routes.ts`
- Create `backend/src/modules/vet/helpers.ts`
- Create service/controller/validation files for:
  - dashboard
  - services
  - facilities
  - team members
  - opening and holiday hours
  - emergency hours
  - animal types
  - gallery
  - pricing
  - featured listings

### Endpoints

```txt
GET    /api/vet/dashboard
GET    /api/vet/services
POST   /api/vet/services
PUT    /api/vet/services/:id
DELETE /api/vet/services/:id
GET    /api/vet/facilities
POST   /api/vet/facilities
PUT    /api/vet/facilities/:id
DELETE /api/vet/facilities/:id
GET    /api/vet/team-members
POST   /api/vet/team-members
PUT    /api/vet/team-members/:id
DELETE /api/vet/team-members/:id
GET    /api/vet/opening-hours
PUT    /api/vet/opening-hours
POST   /api/vet/holiday-hours
DELETE /api/vet/holiday-hours/:id
PUT    /api/vet/emergency-hours
GET    /api/vet/animal-types
POST   /api/vet/animal-types/:animalTypeId/toggle
GET    /api/vet/gallery
POST   /api/vet/gallery
DELETE /api/vet/gallery/:id
GET    /api/vet/pricing
POST   /api/vet/pricing
PUT    /api/vet/pricing/:id
DELETE /api/vet/pricing/:id
GET    /api/vet/featured-listing
GET    /api/vet/featured-listing/plans
GET    /api/vet/featured-listing/stats
POST   /api/vet/featured-listing/checkout
```

### Steps

- [ ] Protect the router with `authenticate` and `requireRole('VET')`.
- [ ] Look up the practice with the unique `ownerId`; never use an ambiguous `findFirst()`.
- [ ] Validate every identifier and body through validated request properties.
- [ ] Check practice ownership on every child entity before update/delete.
- [ ] Add missing facility update support so the API matches the UI.
- [ ] Wrap opening-hours replacement in one transaction. Validate all seven days, duplicate days, `HH:mm` format, and open-before-close for non-closed days.
- [ ] Make holiday dates unique per practice and validate them in the practice timezone.
- [ ] Validate referenced animal types as active before toggling.
- [ ] Gallery creation accepts an owned uploaded-asset ID, not arbitrary client-supplied URL/key pairs.
- [ ] Gallery deletion removes the database record and R2 object with retry/compensation behavior; never leave the existing R2 deletion TODO.
- [ ] Implement pricing CRUD for service pricing sections and health packages. Serialize Decimal prices as strings and default currency to GBP.
- [ ] Featured listing checkout validates an active plan, practice ownership, and overlapping active boosts. Create a Stripe Checkout session with practice/plan metadata.
- [ ] Featured stats return impressions, clicks, click-through rate, and enquiries for the purchased period.
- [ ] Dashboard queries run in parallel, use indexed ranges, and return DTOs shaped for the existing vet dashboard.

### Tests

- Child-entity ownership, hours transaction rollback, duplicate holidays, pricing CRUD, gallery asset ownership, featured plan eligibility, and stats calculations.

### Commit

```bash
git commit -m "feat: add vet dashboard pricing and featured listings"
```

---

## Task 11: Secure Cloudflare R2 uploads

**Files**

- Create `backend/src/config/cloudflare.ts`
- Create `backend/src/shared/middleware/upload.ts`
- Create `backend/src/modules/upload/upload.validation.ts`
- Create `backend/src/modules/upload/upload.service.ts`
- Create `backend/src/modules/upload/upload.controller.ts`
- Create `backend/src/modules/upload/upload.routes.ts`

### Endpoints

```txt
POST   /api/upload/image
POST   /api/upload/images
DELETE /api/upload/*key
```

### Steps

- [ ] Use Express 5 named wildcard syntax `/*key`, not `/:key(*)`.
- [ ] Normalize `req.params.key` safely because an Express 5 wildcard value is an array of path segments.
- [ ] Allow only declared upload purposes such as `avatar`, `pet`, `practice-logo`, and `gallery`.
- [ ] Authenticate uploads and enforce role/purpose rules.
- [ ] Limit request count, per-file size, total request size, image dimensions, and allowed media types.
- [ ] Inspect magic bytes with `file-type`; never trust `file.mimetype` or filename extension alone.
- [ ] Generate server-owned R2 keys under a user/practice namespace. Ignore path components from the original filename.
- [ ] Persist each upload as an `UploadedAsset` record containing owner user/practice, purpose, R2 key, URL, detected MIME type, size, and timestamps.
- [ ] The delete endpoint looks up the exact asset/key, checks user or practice ownership, verifies no protected record still references it, then deletes R2 and the database record.
- [ ] For gallery media, additionally verify the `GalleryMedia.practiceId` belongs to the current vet.
- [ ] Batch uploads use bounded concurrency. If any upload fails, delete every R2 object created by that request and do not persist partial database records.
- [ ] Return stable upload error codes without leaking R2 details.

### Tests

- Spoofed MIME rejection, oversized payloads, key traversal, cross-practice deletion denial, partial-batch cleanup, and valid image upload with an R2 test double.

### Commit

```bash
git commit -m "feat: add owned and validated R2 uploads"
```

---

## Task 12: Persistent real-time notifications

**Files**

- Create `backend/src/config/socket.ts`
- Create `backend/src/socket/index.ts`
- Create `backend/src/modules/notifications/notifications.validation.ts`
- Create `backend/src/modules/notifications/notifications.service.ts`
- Create `backend/src/modules/notifications/notifications.controller.ts`
- Create `backend/src/modules/notifications/notifications.routes.ts`
- Modify `backend/src/server.ts`

### Endpoints and events

```txt
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id

Socket event: notification:new
```

### Steps

- [ ] Attach Socket.IO to the existing HTTP server.
- [ ] Authenticate socket connections with the access token and the same issuer/audience/user-state checks as HTTP authentication.
- [ ] Join each connection to a server-controlled `user:{id}` room; never accept room names from the client.
- [ ] Persist notifications transactionally with the domain event, then emit only after commit.
- [ ] Emission failures must not roll back committed business data; offline users retrieve persisted notifications later.
- [ ] Add pagination and validated category filters.
- [ ] Update only notifications owned by the authenticated user.
- [ ] Wire notification creation for:
  - appointment booked, confirmed, rescheduled, cancelled, and completed
  - review submitted, moderated when relevant, and replied to
  - practice approved, rejected, or suspended
  - subscription created, changed, payment failed, renewed, or cancelled
  - featured listing activated or expired
- [ ] Document that horizontal Socket.IO scaling requires a shared adapter before multi-instance production deployment.

### Tests

- Socket authentication, room isolation, persisted offline notifications, ownership, unread counts, and representative domain-event emissions.

### Commit

```bash
git commit -m "feat: add persistent Socket.IO notifications"
```

---

## Task 13: Stripe subscriptions, invoices, and webhook idempotency

**Files**

- Create `backend/src/modules/subscriptions/subscriptions.validation.ts`
- Create `backend/src/modules/subscriptions/subscriptions.service.ts`
- Create `backend/src/modules/subscriptions/subscriptions.controller.ts`
- Complete `backend/src/modules/subscriptions/webhook.routes.ts`
- Create `backend/src/modules/subscriptions/stripe-event.service.ts`

### Endpoints

```txt
GET  /api/subscriptions/plans
POST /api/subscriptions/checkout
POST /api/subscriptions/webhook
GET  /api/subscriptions/me
POST /api/subscriptions/cancel
```

### Steps

- [ ] Do not hardcode `apiVersion`; use the default from the pinned Stripe SDK.
- [ ] Validate checkout plan IDs and require a configured Stripe price ID for paid plans.
- [ ] Reuse or create Stripe customers safely and store their IDs.
- [ ] Add idempotency keys to Stripe mutation calls initiated by the API.
- [ ] Keep the webhook route above `express.json()` and verify the signature against the raw `Buffer`.
- [ ] Type webhook input as `Stripe.Event`; narrow each `data.object` by event type.
- [ ] Process these events at minimum:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] Process featured-listing Checkout metadata as well as recurring subscriptions.
- [ ] In one transaction:
  1. insert `ProcessedStripeEvent` by event ID
  2. no-op if the event already exists
  3. update subscription/featured-listing state
  4. upsert invoice/payment records where applicable
  5. create notifications
- [ ] Source renewal and period dates from the Stripe subscription/invoice object. Never approximate them with `Date.now() + 30 days`.
- [ ] Persist Stripe status values through mapped application enums and retain unknown event logging.
- [ ] Define cancellation semantics explicitly (`cancel_at_period_end` versus immediate) and reflect the effective date in API responses.
- [ ] Seeded free plans are activated without Stripe through a dedicated, transaction-safe path.

### Tests

- Signature verification with a raw body, duplicate-event idempotency, out-of-order updates, invoice persistence, renewal dates, cancellation, and subscription notifications.

### Commit

```bash
git commit -m "feat: add idempotent Stripe subscription processing"
```

---

## Task 14: Admin management, moderation, settings, and reports

**Files**

- Create `backend/src/modules/admin/admin.validation.ts`
- Create `backend/src/modules/admin/admin.service.ts`
- Create `backend/src/modules/admin/admin.controller.ts`
- Create `backend/src/modules/admin/admin.routes.ts`
- Create `backend/src/modules/admin/admin-analytics.service.ts`
- Create `backend/src/modules/admin/admin-settings.service.ts`

### Required capability groups

- Dashboard totals and recent activity
- Practice approval/rejection/suspension/reactivation with reasons
- Review moderation with validated statuses and rating recalculation
- Animal-type and service-category management
- Blog and sponsorship management
- Contact-enquiry management
- Pet-owner and practice management
- Subscription and featured-listing plan management
- Admin account settings persistence
- Reports: monthly signups, revenue, traffic/searches, top practices, and CSV export

### Steps

- [ ] Protect all admin routes with current database-backed role verification.
- [ ] Validate all query/body/parameter values; remove string-to-enum `as any` casts.
- [ ] Practice moderation changes state, records a reason/audit entry, and creates a notification transactionally.
- [ ] Review moderation invokes the shared rating recalculation in the same transaction.
- [ ] Group monthly data with PostgreSQL month buckets, not Prisma grouping by exact `createdAt` timestamps.
- [ ] Calculate revenue from persisted paid invoices, not subscription-plan list prices.
- [ ] Track traffic/search events in a form that can supply the existing report charts.
- [ ] Implement bounded date ranges and CSV export without loading unbounded datasets into memory.
- [ ] Persist admin backup email, locale, and notification preferences through `AdminSettings`.
- [ ] Do not expose a functional 2FA toggle until Task 4's future 2FA project exists.
- [ ] Admin deactivation/role changes revoke refresh tokens and invalidate the auth cache.
- [ ] Prefer deactivate/archive when referenced records prevent safe deletion.

### Tests

- Role denial, validated moderation, rating updates, month grouping, invoice revenue, CSV authorization, settings persistence, and session revocation.

### Commit

```bash
git commit -m "feat: add admin moderation reports and settings"
```

---

## Task 15: Contact, analytics, and public content APIs

**Files**

- Create `backend/src/modules/contact/*`
- Create `backend/src/modules/analytics/*`
- Create `backend/src/modules/public-content/*`

### Endpoints

```txt
POST /api/contact
GET  /api/analytics/vet
POST /api/practices/:id/contact-action
GET  /api/blog
GET  /api/blog/:slug
GET  /api/sponsorships
```

### Steps

- [ ] Validate and rate-limit the public contact form; add a bot-protection extension point and payload length limits.
- [ ] Persist the enquiry, then send staff notification/email through `MailService` without blocking the response on a slow provider.
- [ ] Contact replies store reply/status/repliedAt/repliedBy and send email through the same abstraction.
- [ ] Validate contact-action types and rate-limit/deduplicate obvious replay traffic.
- [ ] Vet analytics verifies practice ownership and subscription entitlements.
- [ ] Use parameterized Prisma SQL or supported group-by queries for monthly buckets.
- [ ] Return zero-filled month buckets so charts do not need to infer missing months.
- [ ] Public blog endpoints return only `PUBLISHED` posts and safe author DTOs.
- [ ] Public sponsorship endpoint returns active sponsors only.
- [ ] Add pagination and cache-control appropriate to public content.

### Tests

- Contact validation/rate limit, analytics ownership and date buckets, unpublished blog exclusion, and inactive sponsorship exclusion.

### Commit

```bash
git commit -m "feat: add contact analytics and public content APIs"
```

---

## Task 16: Fully idempotent development seed

**Files**

- Create `backend/prisma/seed.ts`

### Steps

- [ ] Refuse to run known development credentials in production.
- [ ] Seed admin, pet owner, vet, one approved practice, animal types, service categories, plans, pricing, hours, pets, appointments, reviews, and settings.
- [ ] Hash development passwords with the same production helper.
- [ ] Use stable IDs or real unique keys and `upsert` every record.
- [ ] Do not use `createMany({ skipDuplicates: true })` where no matching unique constraint exists.
- [ ] Upsert services individually or add a deliberate unique `(practiceId, name)` constraint.
- [ ] Seed one five-star review and set/recalculate `rating = 5.0`, `reviewCount = 1` from the same rating service logic.
- [ ] Seed Stripe price IDs as null/placeholders unless test fixtures explicitly mock Stripe.
- [ ] Print development accounts only in non-production environments.

### Acceptance criteria

- Running the seed twice produces identical row counts and values.
- Seeded ratings match approved review aggregates.
- `npm run db:seed` succeeds after a clean migration reset.

### Commit

```bash
git commit -m "feat: add idempotent development seed"
```

---

## Task 17: Automated unit and integration test suite

**Files**

- Create `backend/src/test/factories/*`
- Create `backend/src/test/helpers/*`
- Add colocated `*.unit.test.ts` and `*.integration.test.ts` files
- Create `backend/scripts/reset-test-db.ts`

### Test database rules

- [ ] Use only `DATABASE_URL_TEST` and fail if it equals `DATABASE_URL`.
- [ ] Reset/migrate the isolated test database before the integration suite.
- [ ] Run integration files serially or isolate data per worker.
- [ ] Use factories with unique values; do not depend on the development seed.
- [ ] Mock only external boundaries: Stripe, R2, email, and Socket transport. Use real Express, Prisma, and PostgreSQL for integration tests.

### Required suites

- [ ] Authentication flow: register -> login -> protected route -> refresh rotation -> logout.
- [ ] Refresh reuse detection and family revocation.
- [ ] Password reset and account/role session revocation.
- [ ] Role matrix: pet owner cannot use vet/admin routes; vet cannot use admin routes; users cannot access another user's records.
- [ ] Stripe webhook raw-body signature verification and processed-event idempotency.
- [ ] Review create/update/delete/moderation rating recalculation.
- [ ] Helpful vote uniqueness.
- [ ] Appointment past-date and concurrent double-booking rejection.
- [ ] Opening-hours transaction rollback.
- [ ] Upload magic-byte and ownership checks.
- [ ] Public/private practice and blog visibility.
- [ ] Notification persistence and socket room isolation.
- [ ] Seed idempotency.
- [ ] Global response-envelope contract and error mapping.

### Quality gate

- [ ] Set a meaningful coverage threshold for services and shared middleware; do not chase coverage through generated files.
- [ ] CI-equivalent command runs typecheck, lint, unit tests, integration tests, Prisma validation, and build.

### Commit

```bash
git commit -m "test: add backend unit and integration coverage"
```

---

## Task 18: Next.js 16 frontend integration

The existing frontend is at the repository root. Follow the installed Next.js 16 guides: use Server Components for public server-side fetching where practical, Client Components for interactive dashboard state, and `proxy.ts` only for optimistic cookie-presence redirects. Backend authorization remains mandatory.

**Files**

- Create `lib/api/types.ts`
- Create `lib/api/server.ts`
- Create `lib/api/client.ts`
- Create `lib/auth/access-token.ts`
- Create `components/auth/AuthProvider.tsx`
- Create `components/auth/RequireAuth.tsx`
- Create `lib/socket.ts`
- Create root `proxy.ts`
- Create `.env.example` entries for `NEXT_PUBLIC_API_URL` and server API URL if needed
- Create login, registration, forgot-password, and reset-password pages
- Modify root `package.json`
- Modify existing pages/components to replace mock data

### Authentication and API-client rules

- [ ] Store the access token in a module-level in-memory store only; never use localStorage or expose the refresh token to JavaScript.
- [ ] Send `credentials: 'include'` on cookie-relevant API requests.
- [ ] On startup, `AuthProvider` calls refresh, stores the returned access token in memory, then loads `/api/auth/me`.
- [ ] Implement one single-flight refresh promise so concurrent 401 responses trigger one refresh, then retry each original request once.
- [ ] If refresh fails, clear auth state, disconnect Socket.IO, and redirect protected UI to `/login`.
- [ ] Prevent infinite refresh loops and never retry non-auth failures automatically.
- [ ] `lib/api/server.ts` is marked `server-only` and is used for public Server Component fetching. It never imports browser token state.
- [ ] `lib/api/client.ts` is client-only and owns authenticated browser requests.
- [ ] Keep the AuthProvider boundary as deep as practical rather than converting the whole component tree to client rendering.
- [ ] Add `proxy.ts` matchers for pet-owner, vet, and admin dashboards. Proxy checks only for refresh-cookie presence and performs optimistic redirects; page/API authorization still verifies the backend session and role.
- [ ] Add role-aware client guards for dashboard UX and unauthorized-role redirects.
- [ ] Socket.IO authenticates with the current access token and reconnects after a successful refresh.

### Data integration order

- [ ] Public: directory/search, practice profile, contact, sponsorships, and published blog content.
- [ ] Pet owner: profile/pets, saved/favourite practices, reviews, appointments, notifications, and account settings.
- [ ] Vet: dashboard, practice profile/information, services, facilities, team, animal types, pricing, hours, gallery, reviews, analytics, featured listing, subscription, notifications, and settings.
- [ ] Admin: dashboard, practice approvals, users/practices, review moderation, taxonomy, blog, sponsorship, contact enquiries, plans, featured listings, notifications, reports, and settings.
- [ ] Preserve loading skeletons, empty states, error states, optimistic updates, and accessible form errors.
- [ ] Remove mock arrays/imports from each integrated page and add a test or explicit acceptance check before moving on.

### Root development scripts

The root is the frontend, so do not add a nonexistent `frontend` workspace. Install `concurrently` at the root and use:

```json
{
  "scripts": {
    "dev": "concurrently -k -n frontend,backend \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "next dev",
    "dev:backend": "npm --prefix backend run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "next build",
    "build:backend": "npm --prefix backend run build",
    "test:backend": "npm --prefix backend test"
  }
}
```

### Tests and acceptance

- Login persists through a browser refresh by rotating the HttpOnly refresh cookie.
- Protected pages redirect unauthenticated users and enforce role UX.
- Access tokens never appear in local/session storage.
- A representative public, pet-owner, vet, and admin workflow uses real API data.
- Socket notifications update the UI and remain available after reconnect.
- Existing Next.js lint and build checks still pass.

### Commit

```bash
git commit -m "feat: connect Next frontend to the backend API"
```

---

## Task 19: Final assembly, documentation, and release smoke test

**Files**

- Finalize `backend/src/app.ts`
- Finalize root and backend README sections
- Create `backend/docs/api-endpoints.md`
- Create `backend/scripts/smoke-test.ts`

### Assembly checklist

- [ ] Confirm the Stripe webhook is still mounted before JSON parsing.
- [ ] Mount every router once under the documented path.
- [ ] Confirm 404 and error handlers are last.
- [ ] Confirm general and route-specific rate limits do not double-apply unintentionally.
- [ ] Confirm CORS, cookies, Proxy, frontend URL, and API URL work in local and intended production topology.
- [ ] Document every environment variable, including whether it is required, secret, and environment-specific.
- [ ] Document migrations, deploy migrations, seed restrictions, R2 configuration, Stripe CLI webhook testing, and test database reset.
- [ ] Generate an endpoint inventory with auth role, validation schema, request shape, response DTO, and emitted notifications.
- [ ] Add production notes for shared rate-limit storage, Socket.IO scaling adapter, backups, log redaction, HTTPS, mail provider, and observability.

### Final verification

- [ ] `docker compose up -d`
- [ ] Clean install at root and in `backend/`
- [ ] `prisma validate`, generate, migrate reset on test DB, and deploy migration on a clean development DB
- [ ] Backend typecheck, lint, unit tests, integration tests, and build
- [ ] Frontend lint and production build
- [ ] Seed twice and confirm idempotency
- [ ] Run smoke flows for:
  - register/login/refresh/logout/password reset
  - public search and practice detail
  - save practice, pet CRUD, appointment booking, review submission
  - vet service/pricing/hours/gallery management
  - admin approval and review moderation
  - Stripe test checkout and signed webhook replay
  - notification persistence and Socket.IO delivery
- [ ] Confirm local dev command starts frontend and backend together.
- [ ] Confirm no secrets, test database URLs, generated client output, or upload artifacts are staged.

### Final commit

```bash
git commit -m "feat: complete backend integration and release verification"
```

---

## Definition of done

The backend project is complete only when:

- All Task 0-19 checkboxes and task-level acceptance criteria pass.
- The API is secured by backend ownership and role checks.
- Stripe and refresh-token processing are retry-safe and idempotent.
- Database constraints protect the invariants that services assume.
- The isolated automated suite passes from a clean checkout.
- The current frontend's key public, pet-owner, vet, and admin workflows use real API data.
- Both production builds succeed and the documented smoke test passes.
