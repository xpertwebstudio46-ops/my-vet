# My Vet API

Express 5, strict TypeScript, Prisma 7/PostgreSQL, Socket.IO, Stripe, and Cloudflare R2.

## Railway

Set the Railway service root directory to `/backend`. The checked-in `railway.json` performs:

1. `npm run build`
2. `npm run db:migrate:deploy` before traffic switches to the new deployment
3. `npm start`
4. `/api/health` deployment health check

`/api/readiness` also verifies database connectivity. Never run `prisma migrate reset`, the development seed, or integration tests against the production `DATABASE_URL`.

## Environment

| Variable | Required | Secret | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | No | `development`, `test`, or `production` |
| `PORT` | Railway supplies it | No | HTTP port |
| `DATABASE_URL` | Yes | Yes | Railway PostgreSQL connection URL |
| `DATABASE_URL_TEST` | Tests only | Yes | Separate disposable integration-test database |
| `TRUST_PROXY` | Yes in production | No | Express proxy hop count, normally `1` on Railway |
| `FRONTEND_URL` | Yes | No | Allowed browser origin; comma-separate multiple origins |
| `JWT_ACCESS_SECRET` | Yes | Yes | Access-token signing secret, at least 32 characters |
| `JWT_REFRESH_SECRET` | Yes | Yes | Reserved independent refresh-session secret, at least 32 characters |
| `JWT_ACCESS_EXPIRY` | Yes | No | Compact duration such as `15m` |
| `JWT_REFRESH_EXPIRY` | Yes | No | Compact duration such as `30d` |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Yes | No | JWT boundary identifiers |
| `REFRESH_COOKIE_NAME` | Yes | No | HttpOnly refresh-cookie name |
| `COOKIE_DOMAIN` | Topology dependent | No | Shared cookie domain; leave empty when not needed |
| `COOKIE_SECURE` | Yes in production | No | Must be `true` for HTTPS production |
| `COOKIE_SAME_SITE` | Yes | No | `lax`, `strict`, or `none`; `none` requires secure cookies |
| `MAIL_FROM` | Yes | No | Sender address used by the mail boundary |
| `PASSWORD_RESET_URL` | Yes | No | Frontend reset-password URL |
| `STRIPE_ENABLED` | Yes | No | Enables billing and signed webhook processing |
| `STRIPE_SECRET_KEY` | When Stripe enabled | Yes | Stripe server API key |
| `STRIPE_WEBHOOK_SECRET` | When Stripe enabled | Yes | Stripe endpoint signing secret |
| `R2_ENABLED` | Yes | No | Enables uploads |
| `CLOUDFLARE_ACCOUNT_ID` | When R2 enabled | Yes | R2 account identifier |
| `CLOUDFLARE_R2_ACCESS_KEY` | When R2 enabled | Yes | R2 access key |
| `CLOUDFLARE_R2_SECRET_KEY` | When R2 enabled | Yes | R2 secret key |
| `CLOUDFLARE_R2_BUCKET` | When R2 enabled | No | Bucket name |
| `CLOUDFLARE_CDN_URL` | When R2 enabled | No | Public asset base URL |

Production cookie guidance: use `COOKIE_SECURE=true`. Use `COOKIE_SAME_SITE=none` only when the frontend and API are truly cross-site; configure the exact frontend origin and cookie domain together.

## Commands

```powershell
npm ci
npm run db:validate
npm run typecheck
npm run lint
npm test
npm run build
```

Database commands:

```powershell
npm run db:migrate:deploy  # production-safe committed migrations
npm run db:migrate         # development schema work only
npm run db:seed            # non-production development data only
```

External-service notes:

- Configure the Stripe webhook URL as `https://YOUR_API/api/subscriptions/webhook` and subscribe to Checkout Session, Subscription, and Invoice events used by the API.
- Use a private R2 bucket behind the configured public CDN/custom domain. The API owns object keys and validates image magic bytes.
- The included rate limiter is process-local. Use a shared store before running more than one API replica.
- Socket.IO is also single-instance. Add a shared adapter before horizontal scaling.
- `MailService` is an explicit integration boundary; connect a production mail provider before relying on password-reset delivery.
