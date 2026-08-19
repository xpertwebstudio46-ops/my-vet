# My Vet — Backend Design Spec

## Overview

Backend API for the My Vet platform — a veterinary practice directory serving three user roles: Pet Owners, Vet Practices, and Admins. The frontend is a Next.js app with 50+ pages, all currently using mock data.

## Tech Stack

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT (access + refresh tokens, httpOnly cookies)
- **File Storage:** Cloudflare R2/CDN (keys to be added later)
- **Payments:** Stripe (subscriptions + featured listing boosts)
- **Real-time:** Socket.io (notifications, appointment updates, review replies)
- **Validation:** Zod

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── server.ts                 # Entry point
│   ├── app.ts                    # Express app setup
│   ├── config/
│   │   ├── env.ts                # Environment variables
│   │   ├── database.ts           # Prisma client singleton
│   │   ├── stripe.ts             # Stripe config
│   │   ├── cloudflare.ts         # Cloudflare R2/CDN config
│   │   └── socket.ts             # Socket.io setup
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── auth.validation.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.validation.ts
│   │   ├── practices/
│   │   │   ├── practices.controller.ts
│   │   │   ├── practices.service.ts
│   │   │   ├── practices.routes.ts
│   │   │   └── practices.validation.ts
│   │   ├── pets/
│   │   │   ├── pets.controller.ts
│   │   │   ├── pets.service.ts
│   │   │   ├── pets.routes.ts
│   │   │   └── pets.validation.ts
│   │   ├── appointments/
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.service.ts
│   │   │   ├── appointments.routes.ts
│   │   │   └── appointments.validation.ts
│   │   ├── reviews/
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   ├── reviews.routes.ts
│   │   │   └── reviews.validation.ts
│   │   ├── services/
│   │   │   ├── services.controller.ts
│   │   │   ├── services.service.ts
│   │   │   ├── services.routes.ts
│   │   │   └── services.validation.ts
│   │   ├── facilities/
│   │   │   ├── facilities.controller.ts
│   │   │   ├── facilities.service.ts
│   │   │   ├── facilities.routes.ts
│   │   │   └── facilities.validation.ts
│   │   ├── team-members/
│   │   │   ├── team-members.controller.ts
│   │   │   ├── team-members.service.ts
│   │   │   ├── team-members.routes.ts
│   │   │   └── team-members.validation.ts
│   │   ├── gallery/
│   │   │   ├── gallery.controller.ts
│   │   │   ├── gallery.service.ts
│   │   │   ├── gallery.routes.ts
│   │   │   └── gallery.validation.ts
│   │   ├── opening-hours/
│   │   │   ├── opening-hours.controller.ts
│   │   │   ├── opening-hours.service.ts
│   │   │   ├── opening-hours.routes.ts
│   │   │   └── opening-hours.validation.ts
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── notifications.validation.ts
│   │   ├── subscriptions/
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   ├── subscriptions.routes.ts
│   │   │   └── subscriptions.validation.ts
│   │   ├── featured-listings/
│   │   │   ├── featured-listings.controller.ts
│   │   │   ├── featured-listings.service.ts
│   │   │   ├── featured-listings.routes.ts
│   │   │   └── featured-listings.validation.ts
│   │   ├── blog/
│   │   │   ├── blog.controller.ts
│   │   │   ├── blog.service.ts
│   │   │   ├── blog.routes.ts
│   │   │   └── blog.validation.ts
│   │   ├── sponsorship/
│   │   │   ├── sponsorship.controller.ts
│   │   │   ├── sponsorship.service.ts
│   │   │   ├── sponsorship.routes.ts
│   │   │   └── sponsorship.validation.ts
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── analytics.validation.ts
│   │   ├── contact-enquiries/
│   │   │   ├── contact-enquiries.controller.ts
│   │   │   ├── contact-enquiries.service.ts
│   │   │   ├── contact-enquiries.routes.ts
│   │   │   └── contact-enquiries.validation.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── admin.routes.ts
│   │       └── admin.validation.ts
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   ├── validate.ts
│   │   │   ├── rate-limiter.ts
│   │   │   └── upload.ts
│   │   ├── utils/
│   │   │   ├── api-error.ts
│   │   │   ├── api-response.ts
│   │   │   ├── pagination.ts
│   │   │   └── slug.ts
│   │   └── types/
│   │       └── index.ts
│   └── socket/
│       ├── index.ts
│       └── handlers/
│           ├── notification.handler.ts
│           └── appointment.handler.ts
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Database Schema

### Enums

```
Role: PET_OWNER | VET | ADMIN
PracticeStatus: PENDING | APPROVED | REJECTED | SUSPENDED
AppointmentStatus: PENDING | CONFIRMED | COMPLETED | CANCELLED
ReviewStatus: PENDING | APPROVED | FLAGGED | ARCHIVED
BlogStatus: PUBLISHED | DRAFT | ARCHIVED
EnquiryStatus: NEW | IN_PROGRESS | RESOLVED
MediaType: IMAGE | VIDEO
NotificationCategory: APPOINTMENT | REPLIES | MESSAGES | REMINDERS
```

### Models

**User**
- id: String (cuid)
- email: String (unique)
- passwordHash: String
- role: Role
- firstName: String
- lastName: String
- phone: String?
- address: String?
- avatar: String?
- location: String?
- twoFactorEnabled: Boolean (default false)
- language: String (default "en")
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime? (soft delete)

**RefreshToken**
- id: String (cuid)
- token: String (unique)
- userId: String -> User
- expiresAt: DateTime
- createdAt: DateTime

**Practice**
- id: String (cuid)
- slug: String (unique, auto-generated from name)
- name: String
- description: String?
- veterinaryType: String
- address: String
- phone: String
- email: String
- website: String?
- rating: Float (default 0, computed)
- reviewCount: Int (default 0, computed)
- featured: Boolean (default false)
- status: PracticeStatus (default PENDING)
- ownerId: String -> User
- planId: String? -> SubscriptionPlan
- createdAt: DateTime
- updatedAt: DateTime

**Service**
- id: String (cuid)
- name: String
- description: String?
- price: Decimal
- active: Boolean (default true)
- practiceId: String -> Practice

**AnimalType** (global, admin-managed)
- id: String (cuid)
- name: String (unique)
- active: Boolean (default true)
- createdAt: DateTime

**PracticeAnimalType** (junction)
- practiceId: String -> Practice
- animalTypeId: String -> AnimalType
- (composite PK: practiceId + animalTypeId)

**Facility**
- id: String (cuid)
- name: String
- active: Boolean (default true)
- practiceId: String -> Practice

**TeamMember**
- id: String (cuid)
- name: String
- role: String
- email: String?
- phone: String?
- active: Boolean (default true)
- practiceId: String -> Practice

**OpeningHours**
- id: String (cuid)
- dayOfWeek: Int (0-6, Monday=0)
- openTime: String (HH:mm)
- closeTime: String (HH:mm)
- closed: Boolean (default false)
- practiceId: String -> Practice

**HolidayHours**
- id: String (cuid)
- date: DateTime
- note: String?
- practiceId: String -> Practice

**EmergencyHours**
- id: String (cuid)
- enabled: Boolean (default false)
- details: String?
- practiceId: String -> Practice (unique)

**GalleryMedia**
- id: String (cuid)
- url: String
- key: String (Cloudflare key for deletion)
- type: MediaType
- category: String?
- practiceId: String -> Practice
- createdAt: DateTime

**Pet**
- id: String (cuid)
- name: String
- type: String (Dog, Cat, Horse, etc.)
- breed: String?
- age: String?
- image: String?
- ownerId: String -> User

**Appointment**
- id: String (cuid)
- date: DateTime
- time: String
- status: AppointmentStatus (default PENDING)
- notes: String?
- serviceType: String?
- petId: String -> Pet
- practiceId: String -> Practice
- userId: String -> User
- createdAt: DateTime
- updatedAt: DateTime

**Review**
- id: String (cuid)
- rating: Int (1-5)
- body: String
- status: ReviewStatus (default PENDING)
- helpful: Int (default 0)
- reply: String?
- replyDate: DateTime?
- userId: String -> User
- practiceId: String -> Practice
- createdAt: DateTime
- updatedAt: DateTime

**SubscriptionPlan** (admin-managed)
- id: String (cuid)
- name: String (free, professional, premium)
- price: Decimal
- features: Json
- analyticsEnabled: Boolean (default false)
- featuredBadge: Boolean (default false)
- stripePriceId: String?
- createdAt: DateTime

**Subscription**
- id: String (cuid)
- stripeSubscriptionId: String?
- stripeCustomerId: String?
- status: String (active, cancelled, past_due)
- startDate: DateTime
- renewalDate: DateTime?
- practiceId: String -> Practice (unique)
- planId: String -> SubscriptionPlan
- createdAt: DateTime

**FeaturedListing**
- id: String (cuid)
- tier: String
- startDate: DateTime
- endDate: DateTime
- stripePaymentId: String?
- practiceId: String -> Practice
- createdAt: DateTime

**BlogPost**
- id: String (cuid)
- title: String
- slug: String (unique)
- excerpt: String?
- content: String
- category: String
- status: BlogStatus (default DRAFT)
- views: Int (default 0)
- authorId: String -> User
- createdAt: DateTime
- updatedAt: DateTime

**Sponsorship**
- id: String (cuid)
- name: String
- description: String?
- logo: String?
- url: String?
- active: Boolean (default true)
- createdAt: DateTime

**ContactEnquiry**
- id: String (cuid)
- firstName: String
- lastName: String
- email: String
- phone: String?
- practiceType: String?
- message: String
- status: EnquiryStatus (default NEW)
- reply: String?
- createdAt: DateTime

**Notification**
- id: String (cuid)
- category: NotificationCategory
- title: String
- body: String
- read: Boolean (default false)
- userId: String -> User
- actionUrl: String?
- createdAt: DateTime

**ServiceCategory** (global, admin-managed)
- id: String (cuid)
- name: String (unique)
- active: Boolean (default true)
- createdAt: DateTime

**SavedPractice** (replaces localStorage)
- userId: String -> User
- practiceId: String -> Practice
- createdAt: DateTime
- (composite PK: userId + practiceId)

**ProfileView** (for analytics)
- id: String (cuid)
- practiceId: String -> Practice
- date: DateTime (default now)
- source: String? (directory, search, direct)

**ContactAction** (for analytics)
- id: String (cuid)
- practiceId: String -> Practice
- type: String (phone_click, email_click, website_click, directions)
- date: DateTime (default now)

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | No | Sign up (pet owner or vet) |
| POST | /login | No | Returns access token + sets refresh cookie |
| POST | /refresh | No | Rotate refresh token |
| POST | /logout | Yes | Clear tokens, remove refresh from DB |
| POST | /forgot-password | No | Send password reset email |
| POST | /reset-password | No | Reset password with token |
| GET | /me | Yes | Current user profile |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /me/profile | Yes | Full profile with pets |
| PUT | /me/profile | Yes | Update profile fields |
| PUT | /me/avatar | Yes | Upload profile picture |
| PUT | /me/password | Yes | Change password (requires current) |
| PUT | /me/settings | Yes | Account settings (2FA, language) |
| DELETE | /me | Yes | Soft delete account |

### Practices — `/api/practices`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | No | List with search, filters, sort, pagination |
| GET | /:slug | No | Single practice profile |
| POST | / | Yes (VET) | Register new practice (PENDING status) |
| PUT | /:id | Yes (owner) | Update practice details |
| GET | /:id/reviews | No | Practice reviews with pagination |
| POST | /:id/save | Yes | Save/unsave practice |
| GET | /saved | Yes | User's saved practices |

**Query params for GET /:**
- `search` — name/description text search
- `animalType` — filter by animal type
- `services` — filter by service category
- `minRating` — minimum rating filter
- `sort` — recommended | highest_rated | nearest | most_reviewed | newest
- `page`, `limit` — pagination

### Pets — `/api/pets`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Yes | User's pets |
| POST | / | Yes | Add pet |
| PUT | /:id | Yes | Update pet |
| DELETE | /:id | Yes | Remove pet |

### Appointments — `/api/appointments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Yes | User's appointments (filter: upcoming/previous) |
| POST | / | Yes | Book appointment |
| PUT | /:id | Yes | Reschedule |
| PATCH | /:id/cancel | Yes | Cancel appointment |
| PATCH | /:id/confirm | Yes (VET) | Vet confirms appointment |

### Reviews — `/api/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /me | Yes | User's own reviews |
| POST | / | Yes | Submit review |
| PUT | /:id | Yes (author) | Edit review |
| DELETE | /:id | Yes (author) | Delete review |
| POST | /:id/reply | Yes (VET, practice owner) | Reply to review |
| POST | /:id/helpful | Yes | Mark review as helpful |

### Vet Dashboard — `/api/vet`

| Method | Path | Auth (VET) | Description |
|--------|------|------------|-------------|
| GET | /dashboard | Yes | Stats overview |
| GET | /services | Yes | Practice services |
| POST | /services | Yes | Add service |
| PUT | /services/:id | Yes | Update service |
| DELETE | /services/:id | Yes | Delete service |
| GET | /facilities | Yes | Practice facilities |
| POST | /facilities | Yes | Add facility |
| DELETE | /facilities/:id | Yes | Remove facility |
| GET | /animal-types | Yes | Practice animal types |
| POST | /animal-types | Yes | Add animal type |
| DELETE | /animal-types/:id | Yes | Remove animal type |
| GET | /team-members | Yes | Team list |
| POST | /team-members | Yes | Add member |
| PUT | /team-members/:id | Yes | Update member |
| DELETE | /team-members/:id | Yes | Remove member |
| GET | /opening-hours | Yes | Get hours |
| PUT | /opening-hours | Yes | Bulk update hours |
| GET | /holiday-hours | Yes | Get holidays |
| POST | /holiday-hours | Yes | Add holiday |
| DELETE | /holiday-hours/:id | Yes | Remove holiday |
| GET | /gallery | Yes | Gallery media |
| POST | /gallery | Yes | Upload media |
| DELETE | /gallery/:id | Yes | Remove media |
| GET | /analytics | Yes | Analytics data |
| POST | /featured | Yes | Purchase featured listing |

### Subscriptions — `/api/subscriptions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /plans | No | Available plans |
| POST | /checkout | Yes (VET) | Create Stripe checkout session |
| POST | /webhook | No (Stripe sig) | Stripe webhook handler |
| GET | /me | Yes (VET) | Current subscription |
| POST | /cancel | Yes (VET) | Cancel subscription |
| GET | /billing-history | Yes (VET) | Invoices from Stripe |

### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | Yes | User's notifications (filter by category) |
| PATCH | /read-all | Yes | Mark all as read |
| PATCH | /:id/read | Yes | Mark single as read |
| DELETE | /:id | Yes | Delete notification |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /image | Yes | Upload image to Cloudflare R2, return CDN URL |
| POST | /images | Yes | Batch upload |
| DELETE | /:key | Yes | Remove from Cloudflare |

### Admin — `/api/admin`

| Method | Path | Auth (ADMIN) | Description |
|--------|------|--------------|-------------|
| GET | /dashboard | Yes | Platform stats |
| GET | /pending-approvals | Yes | Pending practices |
| PATCH | /pending-approvals/:id | Yes | Approve/reject practice |
| GET | /reviews | Yes | Reviews for moderation |
| PATCH | /reviews/:id | Yes | Approve/flag/archive review |
| CRUD | /animal-types | Yes | Manage global animal types |
| CRUD | /service-categories | Yes | Manage global service categories |
| CRUD | /blog | Yes | Blog post management |
| CRUD | /sponsorships | Yes | Sponsorship management |
| GET | /contact-enquiries | Yes | Contact submissions |
| PATCH | /contact-enquiries/:id | Yes | Reply/update status |
| GET | /pet-owners | Yes | All pet owners |
| PATCH | /pet-owners/:id | Yes | Deactivate/manage user |
| GET | /practices | Yes | All practices |
| PATCH | /practices/:id | Yes | Suspend/manage practice |
| CRUD | /subscription-plans | Yes | Manage plans |
| CRUD | /featured-listings | Yes | Manage featured tiers |
| GET | /analytics | Yes | Platform-wide reports |
| GET | /settings | Yes | System settings |
| PUT | /settings | Yes | Update system settings |

### Contact — `/api/contact`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | / | No | Submit contact form |

## Auth Flow

1. **Register** — password hashed with bcrypt (12 rounds), user created in DB
2. **Login** — verify email + password, issue:
   - Access token (JWT, 15min expiry, contains userId + role)
   - Refresh token (random string, 7 days, stored in DB + httpOnly cookie)
3. **Request auth** — `auth.middleware` reads Authorization header (`Bearer <token>`), verifies JWT, attaches user to `req.user`
4. **Token refresh** — client sends refresh cookie to `/refresh`, old token deleted, new pair issued (rotation)
5. **Role guard** — `requireRole('VET')` middleware checks `req.user.role`
6. **Logout** — delete refresh token from DB, clear cookie

## Real-time (Socket.io)

### Connection
- Client connects with access token as auth handshake
- Server verifies token, joins user to room `user:${userId}`

### Events (Server -> Client)
- `notification:new` — new notification created
- `appointment:updated` — appointment status changed
- `appointment:new` — new appointment booked (to vet)
- `review:new` — new review on practice (to vet)
- `review:reply` — vet replied to review (to pet owner)

### Triggers
- Appointment booked/confirmed/cancelled -> emit to both parties + persist notification
- Review submitted -> emit to practice owner + persist notification
- Review replied -> emit to review author + persist notification
- Admin approves/rejects practice -> emit to practice owner + persist notification

## Computed Fields

**Practice.rating** — average of all APPROVED reviews, recalculated on:
- Review created (status = APPROVED)
- Review updated (rating changed)
- Review deleted
- Review status changed by admin

**Practice.reviewCount** — count of APPROVED reviews, same triggers.

## Key Behaviors

- **Practice registration** — creates with PENDING status, admin must approve before visible in directory
- **Reviews** — created with PENDING status for admin moderation (can be configured to auto-approve)
- **Saved practices** — stored in DB (replaces current localStorage), synced across devices
- **Soft deletes** — users set `deletedAt`, practices set status to SUSPENDED
- **Slug generation** — auto-generated from practice name, ensure uniqueness with suffix
- **Pagination** — offset-based (`page` + `limit` params), return `{ data, total, page, totalPages }`
- **Rate limiting** — auth endpoints: 5 req/min, review submission: 3 req/min, general: 100 req/min

## Environment Variables

```
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myvet

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_CDN_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# CORS
FRONTEND_URL=http://localhost:3000
```

## Dependencies

```json
{
  "dependencies": {
    "express": "^5",
    "@prisma/client": "^6",
    "bcryptjs": "^3",
    "jsonwebtoken": "^9",
    "zod": "^3",
    "socket.io": "^4",
    "stripe": "^17",
    "@aws-sdk/client-s3": "^3",
    "multer": "^2",
    "cors": "^2",
    "helmet": "^8",
    "express-rate-limit": "^7",
    "cookie-parser": "^1",
    "morgan": "^1",
    "uuid": "^11"
  },
  "devDependencies": {
    "typescript": "^5",
    "prisma": "^6",
    "tsx": "^4",
    "nodemon": "^3",
    "@types/express": "^5",
    "@types/bcryptjs": "^3",
    "@types/jsonwebtoken": "^9",
    "@types/cookie-parser": "^1",
    "@types/morgan": "^1",
    "@types/multer": "^2",
    "@types/cors": "^2"
  }
}
```
