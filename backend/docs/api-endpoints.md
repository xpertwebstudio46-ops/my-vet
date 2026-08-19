# API endpoint inventory

All JSON endpoints use the shared `{ success, data, message, error }` envelope. `PET_OWNER`, `VET`, and `ADMIN` denote required roles; `user` means any authenticated account.

| Area | Method and path | Access |
| --- | --- | --- |
| Service | `GET /api/health`, `GET /api/readiness` | Public |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` | Public/rate-limited |
| Auth | `POST /api/auth/refresh`, `POST /api/auth/logout` | Refresh cookie + trusted Origin |
| Auth | `GET /api/auth/me` | User |
| Account | `GET/PUT /api/users/me/profile`, `PUT /api/users/me/password`, `PUT /api/users/me/preferences`, `DELETE /api/users/me` | User |
| Practices | `GET /api/practices`, `GET /api/practices/:slug` | Public approved records |
| Practices | `GET /api/practices/saved`, `POST /api/practices/:id/save` | User |
| Practices | `POST /api/practices`, `PUT /api/practices/:id` | VET/owner |
| Analytics write | `POST /api/practices/:id/contact-action` | Public/rate-limited |
| Pets | `GET/POST /api/pets`, `PUT/DELETE /api/pets/:id` | PET_OWNER/owner |
| Appointments | `GET/POST /api/appointments`, `PUT /api/appointments/:id`, `PATCH /api/appointments/:id/cancel` | PET_OWNER/owner; cancellation also owning VET |
| Appointments | `GET /api/appointments/vet`, `PATCH /api/appointments/:id/confirm`, `PATCH /api/appointments/:id/complete` | VET/own practice |
| Reviews | `GET /api/reviews/practice/:practiceId` | Public approved reviews |
| Reviews | `GET /api/reviews/me`, `POST /api/reviews`, `PUT/DELETE /api/reviews/:id` | PET_OWNER/author |
| Reviews | `POST /api/reviews/:id/reply` | VET/own practice |
| Reviews | `POST/DELETE /api/reviews/:id/helpful` | User |
| Vet dashboard | `GET /api/vet/dashboard` | VET |
| Vet content | CRUD under `/api/vet/services`, `/facilities`, `/team-members`, `/pricing` | VET/own practice |
| Vet hours | `GET/PUT /api/vet/opening-hours`, `POST/DELETE /api/vet/holiday-hours[/:id]`, `PUT /api/vet/emergency-hours` | VET/own practice |
| Vet taxonomy | `GET /api/vet/animal-types`, `POST /api/vet/animal-types/:animalTypeId/toggle` | VET/own practice |
| Vet gallery | `GET/POST /api/vet/gallery`, `DELETE /api/vet/gallery/:id` | VET/own practice |
| Featured | `GET /api/vet/featured-listing[/plans|/stats]`, `POST /api/vet/featured-listing/checkout` | VET |
| Uploads | `POST /api/upload/image`, `POST /api/upload/images`, `DELETE /api/upload/*key` | User + purpose/ownership checks |
| Notifications | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read`, `DELETE /api/notifications/:id` | User/owner |
| Billing | `GET /api/subscriptions/plans` | Public |
| Billing | `POST /api/subscriptions/checkout`, `GET /api/subscriptions/me`, `POST /api/subscriptions/cancel` | VET |
| Billing webhook | `POST /api/subscriptions/webhook` | Raw body + Stripe signature |
| Contact | `POST /api/contact` | Public/rate-limited |
| Public content | `GET /api/blog`, `GET /api/blog/:slug`, `GET /api/sponsorships` | Public published/active records |
| Analytics | `GET /api/analytics/vet` | VET/own practice |
| Admin | `/api/admin/dashboard`, `/practices`, `/reviews`, `/users`, moderation/status mutations | ADMIN |
| Admin content | CRUD under `/api/admin/animal-types`, `/service-categories`, `/blog`, `/sponsorships`, `/enquiries` | ADMIN |
| Admin plans | CRUD-style management under `/api/admin/subscription-plans` and `/featured-listing-plans` | ADMIN |
| Admin settings/reports | `GET/PUT /api/admin/settings`, `GET /api/admin/reports/overview`, `GET /api/admin/reports/export.csv` | ADMIN |

Socket.IO clients authenticate with an access token in `handshake.auth.token`. The server joins only the authenticated `user:{id}` room and emits `notification:new` after persisted domain transactions commit.
