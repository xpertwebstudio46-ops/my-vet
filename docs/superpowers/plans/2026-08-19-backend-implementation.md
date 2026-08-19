# My Vet Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Express + TypeScript backend API for the My Vet platform, serving pet owners, vet practices, and admins.

**Architecture:** Modular Express app with feature-based folder structure. Each module (auth, practices, reviews, etc.) is self-contained with its own controller, service, routes, and validation. Prisma ORM for PostgreSQL, JWT auth with refresh token rotation, Socket.io for real-time notifications, Stripe for subscriptions, Cloudflare R2 for file uploads.

**Tech Stack:** Node.js, Express 5, TypeScript, Prisma 6, PostgreSQL, Zod, Socket.io, Stripe, @aws-sdk/client-s3 (for Cloudflare R2), bcryptjs, jsonwebtoken, multer

## Global Constraints

- TypeScript strict mode enabled
- All request bodies validated with Zod before reaching controllers
- All API responses use consistent `{ success, data, message, error }` envelope
- All routes prefixed with `/api`
- Environment variables loaded from `.env` via `dotenv`
- CORS configured to allow `FRONTEND_URL` origin
- Express 5 (async error handling built-in)
- Prisma client instantiated as singleton
- All IDs are cuid strings
- Pagination: `{ data, total, page, limit, totalPages }`
- Dates stored as ISO 8601 in UTC

---

### Task 1: Project Scaffolding & Express App

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nodemon.json`
- Create: `backend/.env.example`
- Create: `backend/.gitignore`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/config/env.ts`
- Create: `backend/src/config/database.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `app.ts` exports `createApp(): Express`
  - `server.ts` starts the server on `env.PORT`
  - `env` object with typed env vars from `config/env.ts`
  - `prisma` singleton client from `config/database.ts`

- [ ] **Step 1: Initialize the project**

```bash
cd backend
npm init -y
npm install express cors helmet cookie-parser morgan dotenv @prisma/client bcryptjs jsonwebtoken zod socket.io stripe @aws-sdk/client-s3 multer express-rate-limit uuid
npm install -D typescript prisma tsx nodemon @types/express @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/morgan @types/multer @types/cors @types/uuid
npx tsc --init
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create nodemon.json**

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "tsx src/server.ts"
}
```

- [ ] **Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

- [ ] **Step 5: Create .env.example**

```
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/myvet

JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_CDN_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 6: Create .gitignore**

```
node_modules
dist
.env
*.log
```

- [ ] **Step 7: Create config/env.ts**

```typescript
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "",
  CLOUDFLARE_R2_ACCESS_KEY: process.env.CLOUDFLARE_R2_ACCESS_KEY || "",
  CLOUDFLARE_R2_SECRET_KEY: process.env.CLOUDFLARE_R2_SECRET_KEY || "",
  CLOUDFLARE_R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET || "",
  CLOUDFLARE_CDN_URL: process.env.CLOUDFLARE_CDN_URL || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
} as const;
```

- [ ] **Step 8: Create config/database.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 9: Create src/app.ts**

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./shared/middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "My Vet API is running" });
  });

  // Routes will be mounted here in later tasks

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 10: Create src/server.ts**

```typescript
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
```

- [ ] **Step 11: Verify the server starts**

```bash
cp .env.example .env
# Edit .env with a valid DATABASE_URL if you have Postgres running
npx tsx src/server.ts
```

Expected: `Server running on port 5000 in development mode`
Hit `GET http://localhost:5000/api/health` and expect `{ success: true, message: "My Vet API is running" }`

- [ ] **Step 12: Commit**

```bash
git add backend/
git commit -m "feat: scaffold backend project with Express + TypeScript"
```

---

### Task 2: Shared Utilities & Middleware

**Files:**
- Create: `backend/src/shared/utils/api-error.ts`
- Create: `backend/src/shared/utils/api-response.ts`
- Create: `backend/src/shared/utils/pagination.ts`
- Create: `backend/src/shared/utils/slug.ts`
- Create: `backend/src/shared/middleware/error-handler.ts`
- Create: `backend/src/shared/middleware/validate.ts`
- Create: `backend/src/shared/middleware/rate-limiter.ts`
- Create: `backend/src/shared/types/index.ts`

**Interfaces:**
- Consumes: Express types
- Produces:
  - `ApiError` class with `statusCode`, `message`, `errors?` fields
  - `apiResponse(res, statusCode, data?, message?)` helper
  - `paginate(page, limit)` returns `{ skip, take }` + `paginatedResponse(data, total, page, limit)` returns `{ data, total, page, limit, totalPages }`
  - `generateSlug(name: string): string` and `ensureUniqueSlug(name: string, checkExists: (slug: string) => Promise<boolean>): Promise<string>`
  - `validate(schema: ZodSchema)` middleware
  - `errorHandler` Express error middleware
  - `authLimiter`, `generalLimiter` rate limiters
  - `AuthRequest` type extending Express Request with `user: { userId: string, role: Role }`

- [ ] **Step 1: Create shared/types/index.ts**

```typescript
import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "PET_OWNER" | "VET" | "ADMIN";
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

- [ ] **Step 2: Create shared/utils/api-error.ts**

```typescript
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}
```

- [ ] **Step 3: Create shared/utils/api-response.ts**

```typescript
import { Response } from "express";

export function apiResponse<T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string
) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    data: data ?? null,
    message: message ?? null,
  });
}
```

- [ ] **Step 4: Create shared/utils/pagination.ts**

```typescript
import type { PaginatedResponse } from "../types/index.js";

export function paginate(page?: string | number, limit?: string | number) {
  const p = Math.max(1, parseInt(String(page || "1"), 10));
  const l = Math.min(100, Math.max(1, parseInt(String(limit || "10"), 10)));
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

- [ ] **Step 5: Create shared/utils/slug.ts**

```typescript
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = generateSlug(name);
  let counter = 0;

  while (await checkExists(slug)) {
    counter++;
    slug = `${generateSlug(name)}-${counter}`;
  }

  return slug;
}
```

- [ ] **Step 6: Create shared/middleware/error-handler.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? null,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}
```

- [ ] **Step 7: Create shared/middleware/validate.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
          const key = e.path.join(".");
          if (!errors[key]) errors[key] = [];
          errors[key].push(e.message);
        });
        throw ApiError.badRequest("Validation failed", errors);
      }
      next(err);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
          const key = e.path.join(".");
          if (!errors[key]) errors[key] = [];
          errors[key].push(e.message);
        });
        throw ApiError.badRequest("Invalid query parameters", errors);
      }
      next(err);
    }
  };
}
```

- [ ] **Step 8: Create shared/middleware/rate-limiter.ts**

```typescript
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, message: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many reviews, slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});
```

- [ ] **Step 9: Commit**

```bash
git add backend/src/shared/
git commit -m "feat: add shared utilities, types, and middleware"
```

---

### Task 3: Prisma Schema & Migration

**Files:**
- Create: `backend/prisma/schema.prisma`

**Interfaces:**
- Consumes: nothing
- Produces: All Prisma models and enums as defined in the design spec. Generated client available via `@prisma/client`.

- [ ] **Step 1: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────

enum Role {
  PET_OWNER
  VET
  ADMIN
}

enum PracticeStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum ReviewStatus {
  PENDING
  APPROVED
  FLAGGED
  ARCHIVED
}

enum BlogStatus {
  PUBLISHED
  DRAFT
  ARCHIVED
}

enum EnquiryStatus {
  NEW
  IN_PROGRESS
  RESOLVED
}

enum MediaType {
  IMAGE
  VIDEO
}

enum NotificationCategory {
  APPOINTMENT
  REPLIES
  MESSAGES
  REMINDERS
}

// ─── Auth ────────────────────────────────────────────

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  role              Role
  firstName         String
  lastName          String
  phone             String?
  address           String?
  avatar            String?
  location          String?
  twoFactorEnabled  Boolean   @default(false)
  language          String    @default("en")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?

  refreshTokens     RefreshToken[]
  practices         Practice[]
  pets              Pet[]
  appointments      Appointment[]
  reviews           Review[]
  notifications     Notification[]
  savedPractices    SavedPractice[]
  blogPosts         BlogPost[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// ─── Practices ───────────────────────────────────────

model Practice {
  id              String          @id @default(cuid())
  slug            String          @unique
  name            String
  description     String?
  veterinaryType  String
  address         String
  phone           String
  email           String
  website         String?
  rating          Float           @default(0)
  reviewCount     Int             @default(0)
  featured        Boolean         @default(false)
  status          PracticeStatus  @default(PENDING)
  ownerId         String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  owner             User                @relation(fields: [ownerId], references: [id])
  services          Service[]
  facilities        Facility[]
  practiceAnimals   PracticeAnimalType[]
  teamMembers       TeamMember[]
  openingHours      OpeningHours[]
  holidayHours      HolidayHours[]
  emergencyHours    EmergencyHours?
  gallery           GalleryMedia[]
  appointments      Appointment[]
  reviews           Review[]
  subscription      Subscription?
  featuredListings  FeaturedListing[]
  savedBy           SavedPractice[]
  profileViews      ProfileView[]
  contactActions    ContactAction[]

  @@map("practices")
}

model Service {
  id          String  @id @default(cuid())
  name        String
  description String?
  price       Decimal
  active      Boolean @default(true)
  practiceId  String

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("services")
}

model AnimalType {
  id        String   @id @default(cuid())
  name      String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  practices PracticeAnimalType[]

  @@map("animal_types")
}

model PracticeAnimalType {
  practiceId   String
  animalTypeId String

  practice   Practice   @relation(fields: [practiceId], references: [id], onDelete: Cascade)
  animalType AnimalType @relation(fields: [animalTypeId], references: [id], onDelete: Cascade)

  @@id([practiceId, animalTypeId])
  @@map("practice_animal_types")
}

model Facility {
  id         String  @id @default(cuid())
  name       String
  active     Boolean @default(true)
  practiceId String

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("facilities")
}

model TeamMember {
  id         String  @id @default(cuid())
  name       String
  role       String
  email      String?
  phone      String?
  active     Boolean @default(true)
  practiceId String

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("team_members")
}

model OpeningHours {
  id         String  @id @default(cuid())
  dayOfWeek  Int     // 0=Monday, 6=Sunday
  openTime   String  // HH:mm
  closeTime  String  // HH:mm
  closed     Boolean @default(false)
  practiceId String

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@unique([practiceId, dayOfWeek])
  @@map("opening_hours")
}

model HolidayHours {
  id         String   @id @default(cuid())
  date       DateTime
  note       String?
  practiceId String

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("holiday_hours")
}

model EmergencyHours {
  id         String  @id @default(cuid())
  enabled    Boolean @default(false)
  details    String?
  practiceId String  @unique

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("emergency_hours")
}

model GalleryMedia {
  id         String    @id @default(cuid())
  url        String
  key        String
  type       MediaType
  category   String?
  practiceId String
  createdAt  DateTime  @default(now())

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("gallery_media")
}

// ─── Pets & Appointments ─────────────────────────────

model Pet {
  id      String  @id @default(cuid())
  name    String
  type    String
  breed   String?
  age     String?
  image   String?
  ownerId String

  owner        User          @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  appointments Appointment[]

  @@map("pets")
}

model Appointment {
  id          String            @id @default(cuid())
  date        DateTime
  time        String
  status      AppointmentStatus @default(PENDING)
  notes       String?
  serviceType String?
  petId       String
  practiceId  String
  userId      String
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  pet      Pet      @relation(fields: [petId], references: [id])
  practice Practice @relation(fields: [practiceId], references: [id])
  user     User     @relation(fields: [userId], references: [id])

  @@map("appointments")
}

// ─── Reviews ─────────────────────────────────────────

model Review {
  id         String       @id @default(cuid())
  rating     Int
  body       String
  status     ReviewStatus @default(PENDING)
  helpful    Int          @default(0)
  reply      String?
  replyDate  DateTime?
  userId     String
  practiceId String
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  user     User     @relation(fields: [userId], references: [id])
  practice Practice @relation(fields: [practiceId], references: [id])

  @@map("reviews")
}

// ─── Subscriptions & Payments ────────────────────────

model SubscriptionPlan {
  id               String   @id @default(cuid())
  name             String
  price            Decimal
  features         Json
  analyticsEnabled Boolean  @default(false)
  featuredBadge    Boolean  @default(false)
  stripePriceId    String?
  createdAt        DateTime @default(now())

  subscriptions Subscription[]

  @@map("subscription_plans")
}

model Subscription {
  id                   String   @id @default(cuid())
  stripeSubscriptionId String?
  stripeCustomerId     String?
  status               String   @default("active")
  startDate            DateTime @default(now())
  renewalDate          DateTime?
  practiceId           String   @unique
  planId               String
  createdAt            DateTime @default(now())

  practice Practice         @relation(fields: [practiceId], references: [id])
  plan     SubscriptionPlan @relation(fields: [planId], references: [id])

  @@map("subscriptions")
}

model FeaturedListing {
  id              String   @id @default(cuid())
  tier            String
  startDate       DateTime
  endDate         DateTime
  stripePaymentId String?
  practiceId      String
  createdAt       DateTime @default(now())

  practice Practice @relation(fields: [practiceId], references: [id])

  @@map("featured_listings")
}

// ─── Content & Admin ─────────────────────────────────

model BlogPost {
  id        String     @id @default(cuid())
  title     String
  slug      String     @unique
  excerpt   String?
  content   String
  category  String
  status    BlogStatus @default(DRAFT)
  views     Int        @default(0)
  authorId  String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  author User @relation(fields: [authorId], references: [id])

  @@map("blog_posts")
}

model Sponsorship {
  id          String   @id @default(cuid())
  name        String
  description String?
  logo        String?
  url         String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@map("sponsorships")
}

model ContactEnquiry {
  id           String        @id @default(cuid())
  firstName    String
  lastName     String
  email        String
  phone        String?
  practiceType String?
  message      String
  status       EnquiryStatus @default(NEW)
  reply        String?
  createdAt    DateTime      @default(now())

  @@map("contact_enquiries")
}

model Notification {
  id        String               @id @default(cuid())
  category  NotificationCategory
  title     String
  body      String
  read      Boolean              @default(false)
  userId    String
  actionUrl String?
  createdAt DateTime             @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model ServiceCategory {
  id        String   @id @default(cuid())
  name      String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  @@map("service_categories")
}

model SavedPractice {
  userId     String
  practiceId String
  createdAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@id([userId, practiceId])
  @@map("saved_practices")
}

// ─── Analytics ───────────────────────────────────────

model ProfileView {
  id         String   @id @default(cuid())
  practiceId String
  source     String?
  date       DateTime @default(now())

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("profile_views")
}

model ContactAction {
  id         String   @id @default(cuid())
  practiceId String
  type       String
  date       DateTime @default(now())

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@map("contact_actions")
}
```

- [ ] **Step 2: Run Prisma generate and migration**

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Expected: Migration created and applied, Prisma Client generated.

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/
git commit -m "feat: add Prisma schema with all models and initial migration"
```

---

### Task 4: Auth Module

**Files:**
- Create: `backend/src/modules/auth/auth.validation.ts`
- Create: `backend/src/modules/auth/auth.service.ts`
- Create: `backend/src/modules/auth/auth.controller.ts`
- Create: `backend/src/modules/auth/auth.middleware.ts`
- Create: `backend/src/modules/auth/auth.routes.ts`
- Modify: `backend/src/app.ts` — mount auth routes

**Interfaces:**
- Consumes: `prisma`, `env`, `ApiError`, `apiResponse`, `AuthRequest`
- Produces:
  - `authenticate` middleware — verifies JWT, sets `req.user`
  - `requireRole(...roles: Role[])` middleware — checks `req.user.role`
  - POST `/api/auth/register` — `{ email, password, firstName, lastName, role, phone? }`
  - POST `/api/auth/login` — `{ email, password }` → `{ accessToken, user }`
  - POST `/api/auth/refresh` — reads cookie → new token pair
  - POST `/api/auth/logout` — clears tokens
  - GET `/api/auth/me` — returns current user

- [ ] **Step 1: Create auth.validation.ts**

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["PET_OWNER", "VET"]),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 2: Create auth.service.ts**

```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../shared/utils/api-error.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw ApiError.conflict("Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      phone: input.phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || user.deletedAt) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(oldToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  // Rotate: delete old, create new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const accessToken = generateAccessToken(stored.user.id, stored.user.role);
  const refreshToken = await createRefreshToken(stored.user.id);

  return {
    user: {
      id: stored.user.id,
      email: stored.user.email,
      firstName: stored.user.firstName,
      lastName: stored.user.lastName,
      role: stored.user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshTokenValue },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      address: true,
      avatar: true,
      location: true,
      twoFactorEnabled: true,
      language: true,
      createdAt: true,
    },
  });

  if (!user) throw ApiError.notFound("User not found");
  return user;
}
```

- [ ] **Step 3: Create auth.middleware.ts**

```typescript
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../shared/utils/api-error.js";
import type { AuthRequest } from "../../shared/types/index.js";
import type { Role } from "@prisma/client";

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No token provided");
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      role: Role;
    };
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role as Role)) {
      throw ApiError.forbidden("You do not have permission for this action");
    }
    next();
  };
}
```

- [ ] **Step 4: Create auth.controller.ts**

```typescript
import { Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth",
};

export async function register(req: AuthRequest, res: Response) {
  const result = await authService.register(req.body);
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
  return apiResponse(res, 201, {
    user: result.user,
    accessToken: result.accessToken,
  }, "Registration successful");
}

export async function login(req: AuthRequest, res: Response) {
  const result = await authService.login(req.body);
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
  return apiResponse(res, 200, {
    user: result.user,
    accessToken: result.accessToken,
  }, "Login successful");
}

export async function refresh(req: AuthRequest, res: Response) {
  const oldToken = req.cookies?.refreshToken;
  if (!oldToken) {
    return apiResponse(res, 401, null, "No refresh token");
  }

  const result = await authService.refresh(oldToken);
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
  return apiResponse(res, 200, {
    user: result.user,
    accessToken: result.accessToken,
  });
}

export async function logout(req: AuthRequest, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  return apiResponse(res, 200, null, "Logged out");
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await authService.getMe(req.user!.userId);
  return apiResponse(res, 200, user);
}
```

- [ ] **Step 5: Create auth.routes.ts**

```typescript
import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { authLimiter } from "../../shared/middleware/rate-limiter.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
```

- [ ] **Step 6: Mount auth routes in app.ts**

Add to `src/app.ts` after the health check:

```typescript
import authRoutes from "./modules/auth/auth.routes.js";

// Inside createApp(), after health check:
app.use("/api/auth", authRoutes);
```

- [ ] **Step 7: Test manually**

```bash
# Start server
npm run dev

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","firstName":"John","lastName":"Doe","role":"PET_OWNER"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Use the accessToken from login response:
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/modules/auth/ backend/src/app.ts
git commit -m "feat: add auth module with register, login, refresh, logout, JWT middleware"
```

---

### Task 5: Users Module

**Files:**
- Create: `backend/src/modules/users/users.validation.ts`
- Create: `backend/src/modules/users/users.service.ts`
- Create: `backend/src/modules/users/users.controller.ts`
- Create: `backend/src/modules/users/users.routes.ts`
- Modify: `backend/src/app.ts` — mount users routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `ApiError`, `apiResponse`, `AuthRequest`
- Produces:
  - GET `/api/users/me/profile` → user with pets
  - PUT `/api/users/me/profile` — update firstName, lastName, phone, address, location
  - PUT `/api/users/me/password` — change password (requires currentPassword)
  - PUT `/api/users/me/settings` — update twoFactorEnabled, language
  - DELETE `/api/users/me` — soft delete (set deletedAt)

- [ ] **Step 1: Create users.validation.ts**

```typescript
import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const updateSettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  language: z.string().optional(),
});
```

- [ ] **Step 2: Create users.service.ts**

```typescript
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      avatar: true,
      location: true,
      twoFactorEnabled: true,
      language: true,
      createdAt: true,
      pets: {
        select: { id: true, name: true, type: true, breed: true, age: true, image: true },
      },
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateProfile(userId: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      avatar: true,
      location: true,
    },
  });
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: { id: true, avatar: true },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.badRequest("Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function updateSettings(userId: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, twoFactorEnabled: true, language: true },
  });
}

export async function deleteAccount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
}
```

- [ ] **Step 3: Create users.controller.ts**

```typescript
import { Response } from "express";
import * as usersService from "./users.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await usersService.getProfile(req.user!.userId);
  return apiResponse(res, 200, user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const user = await usersService.updateProfile(req.user!.userId, req.body);
  return apiResponse(res, 200, user, "Profile updated");
}

export async function changePassword(req: AuthRequest, res: Response) {
  await usersService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
  return apiResponse(res, 200, null, "Password changed");
}

export async function updateSettings(req: AuthRequest, res: Response) {
  const settings = await usersService.updateSettings(req.user!.userId, req.body);
  return apiResponse(res, 200, settings, "Settings updated");
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  await usersService.deleteAccount(req.user!.userId);
  return apiResponse(res, 200, null, "Account deleted");
}
```

- [ ] **Step 4: Create users.routes.ts**

```typescript
import { Router } from "express";
import * as usersController from "./users.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { updateProfileSchema, changePasswordSchema, updateSettingsSchema } from "./users.validation.js";

const router = Router();

router.use(authenticate);

router.get("/me/profile", usersController.getProfile);
router.put("/me/profile", validate(updateProfileSchema), usersController.updateProfile);
router.put("/me/password", validate(changePasswordSchema), usersController.changePassword);
router.put("/me/settings", validate(updateSettingsSchema), usersController.updateSettings);
router.delete("/me", usersController.deleteAccount);

export default router;
```

- [ ] **Step 5: Mount in app.ts**

```typescript
import usersRoutes from "./modules/users/users.routes.js";
app.use("/api/users", usersRoutes);
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/users/ backend/src/app.ts
git commit -m "feat: add users module with profile, password, settings, and account deletion"
```

---

### Task 6: Practices Module

**Files:**
- Create: `backend/src/modules/practices/practices.validation.ts`
- Create: `backend/src/modules/practices/practices.service.ts`
- Create: `backend/src/modules/practices/practices.controller.ts`
- Create: `backend/src/modules/practices/practices.routes.ts`
- Modify: `backend/src/app.ts` — mount practices routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole`, `ApiError`, `apiResponse`, `paginate`, `paginatedResponse`, `ensureUniqueSlug`
- Produces:
  - GET `/api/practices` — list with search, filter by animalType/services/minRating, sort, paginate
  - GET `/api/practices/:slug` — single practice with all relations
  - POST `/api/practices` — register new practice (VET only, status=PENDING)
  - PUT `/api/practices/:id` — update practice (owner only)
  - POST `/api/practices/:id/save` — toggle save/unsave
  - GET `/api/practices/saved` — user's saved practices

- [ ] **Step 1: Create practices.validation.ts**

```typescript
import { z } from "zod";

export const createPracticeSchema = z.object({
  name: z.string().min(1, "Practice name is required"),
  veterinaryType: z.string().min(1, "Veterinary type is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const updatePracticeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  veterinaryType: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export const practiceQuerySchema = z.object({
  search: z.string().optional(),
  animalType: z.string().optional(),
  services: z.string().optional(),
  minRating: z.string().optional(),
  sort: z.enum(["recommended", "highest_rated", "nearest", "most_reviewed", "newest"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
```

- [ ] **Step 2: Create practices.service.ts**

```typescript
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";
import { paginate, paginatedResponse } from "../../shared/utils/pagination.js";
import { ensureUniqueSlug } from "../../shared/utils/slug.js";

interface PracticeQuery {
  search?: string;
  animalType?: string;
  services?: string;
  minRating?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export async function listPractices(query: PracticeQuery) {
  const { skip, take, page, limit } = paginate(query.page, query.limit);

  const where: Prisma.PracticeWhereInput = {
    status: "APPROVED",
  };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.animalType) {
    where.practiceAnimals = {
      some: { animalType: { name: { equals: query.animalType, mode: "insensitive" } } },
    };
  }

  if (query.services) {
    where.services = {
      some: { name: { contains: query.services, mode: "insensitive" }, active: true },
    };
  }

  if (query.minRating) {
    where.rating = { gte: parseFloat(query.minRating) };
  }

  let orderBy: Prisma.PracticeOrderByWithRelationInput = { createdAt: "desc" };
  switch (query.sort) {
    case "highest_rated":
      orderBy = { rating: "desc" };
      break;
    case "most_reviewed":
      orderBy = { reviewCount: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "recommended":
    default:
      orderBy = { rating: "desc" };
      break;
  }

  const [practices, total] = await Promise.all([
    prisma.practice.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        rating: true,
        reviewCount: true,
        featured: true,
        veterinaryType: true,
        practiceAnimals: { select: { animalType: { select: { name: true } } } },
        services: { where: { active: true }, select: { name: true } },
        openingHours: true,
      },
    }),
    prisma.practice.count({ where }),
  ]);

  const mapped = practices.map((p) => ({
    ...p,
    tags: [
      ...p.practiceAnimals.map((pa) => pa.animalType.name),
      ...p.services.map((s) => s.name),
    ],
    practiceAnimals: undefined,
    services: undefined,
  }));

  return paginatedResponse(mapped, total, page, limit);
}

export async function getPracticeBySlug(slug: string) {
  const practice = await prisma.practice.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true } },
      facilities: { where: { active: true } },
      practiceAnimals: { include: { animalType: true } },
      teamMembers: { where: { active: true } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      emergencyHours: true,
      gallery: { orderBy: { createdAt: "desc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      },
      owner: { select: { firstName: true, lastName: true } },
    },
  });

  if (!practice || practice.status !== "APPROVED") {
    throw ApiError.notFound("Practice not found");
  }

  return practice;
}

export async function createPractice(ownerId: string, data: Record<string, unknown>) {
  const slug = await ensureUniqueSlug(data.name as string, async (s) => {
    const exists = await prisma.practice.findUnique({ where: { slug: s } });
    return !!exists;
  });

  return prisma.practice.create({
    data: {
      ...(data as any),
      slug,
      ownerId,
      status: "PENDING",
    },
  });
}

export async function updatePractice(practiceId: string, ownerId: string, data: Record<string, unknown>) {
  const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
  if (!practice) throw ApiError.notFound("Practice not found");
  if (practice.ownerId !== ownerId) throw ApiError.forbidden("Not your practice");

  // If name changed, regenerate slug
  if (data.name && data.name !== practice.name) {
    const slug = await ensureUniqueSlug(data.name as string, async (s) => {
      const exists = await prisma.practice.findFirst({
        where: { slug: s, id: { not: practiceId } },
      });
      return !!exists;
    });
    (data as any).slug = slug;
  }

  return prisma.practice.update({
    where: { id: practiceId },
    data: data as any,
  });
}

export async function toggleSave(userId: string, practiceId: string) {
  const existing = await prisma.savedPractice.findUnique({
    where: { userId_practiceId: { userId, practiceId } },
  });

  if (existing) {
    await prisma.savedPractice.delete({
      where: { userId_practiceId: { userId, practiceId } },
    });
    return { saved: false };
  }

  await prisma.savedPractice.create({ data: { userId, practiceId } });
  return { saved: true };
}

export async function getSavedPractices(userId: string) {
  const saved = await prisma.savedPractice.findMany({
    where: { userId },
    include: {
      practice: {
        select: {
          id: true,
          slug: true,
          name: true,
          address: true,
          rating: true,
          reviewCount: true,
          featured: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return saved.map((s) => s.practice);
}

export async function recordProfileView(practiceId: string, source?: string) {
  await prisma.profileView.create({ data: { practiceId, source } });
}
```

- [ ] **Step 3: Create practices.controller.ts**

```typescript
import { Request, Response } from "express";
import * as practicesService from "./practices.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: Request, res: Response) {
  const result = await practicesService.listPractices(req.query as any);
  return apiResponse(res, 200, result);
}

export async function getBySlug(req: Request, res: Response) {
  const practice = await practicesService.getPracticeBySlug(req.params.slug);
  // Record view
  await practicesService.recordProfileView(practice.id, req.query.source as string);
  return apiResponse(res, 200, practice);
}

export async function create(req: AuthRequest, res: Response) {
  const practice = await practicesService.createPractice(req.user!.userId, req.body);
  return apiResponse(res, 201, practice, "Practice registered. Pending approval.");
}

export async function update(req: AuthRequest, res: Response) {
  const practice = await practicesService.updatePractice(req.params.id, req.user!.userId, req.body);
  return apiResponse(res, 200, practice, "Practice updated");
}

export async function toggleSave(req: AuthRequest, res: Response) {
  const result = await practicesService.toggleSave(req.user!.userId, req.params.id);
  return apiResponse(res, 200, result);
}

export async function getSaved(req: AuthRequest, res: Response) {
  const practices = await practicesService.getSavedPractices(req.user!.userId);
  return apiResponse(res, 200, practices);
}
```

- [ ] **Step 4: Create practices.routes.ts**

```typescript
import { Router } from "express";
import * as practicesController from "./practices.controller.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { createPracticeSchema, updatePracticeSchema } from "./practices.validation.js";

const router = Router();

router.get("/", practicesController.list);
router.get("/saved", authenticate, practicesController.getSaved);
router.get("/:slug", practicesController.getBySlug);
router.post("/", authenticate, requireRole("VET"), validate(createPracticeSchema), practicesController.create);
router.put("/:id", authenticate, requireRole("VET"), validate(updatePracticeSchema), practicesController.update);
router.post("/:id/save", authenticate, practicesController.toggleSave);

export default router;
```

- [ ] **Step 5: Mount in app.ts**

```typescript
import practicesRoutes from "./modules/practices/practices.routes.js";
app.use("/api/practices", practicesRoutes);
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/practices/ backend/src/app.ts
git commit -m "feat: add practices module with CRUD, search, filtering, and saved practices"
```

---

### Task 7: Pets Module

**Files:**
- Create: `backend/src/modules/pets/pets.validation.ts`
- Create: `backend/src/modules/pets/pets.service.ts`
- Create: `backend/src/modules/pets/pets.controller.ts`
- Create: `backend/src/modules/pets/pets.routes.ts`
- Modify: `backend/src/app.ts` — mount pets routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `ApiError`, `apiResponse`
- Produces:
  - GET `/api/pets` → user's pets
  - POST `/api/pets` — add pet `{ name, type, breed?, age?, image? }`
  - PUT `/api/pets/:id` — update pet
  - DELETE `/api/pets/:id` — remove pet

- [ ] **Step 1: Create pets.validation.ts**

```typescript
import { z } from "zod";

export const createPetSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  type: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  age: z.string().optional(),
  image: z.string().optional(),
});

export const updatePetSchema = createPetSchema.partial();
```

- [ ] **Step 2: Create pets.service.ts**

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function getUserPets(userId: string) {
  return prisma.pet.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });
}

export async function createPet(userId: string, data: { name: string; type: string; breed?: string; age?: string; image?: string }) {
  return prisma.pet.create({
    data: { ...data, ownerId: userId },
  });
}

export async function updatePet(petId: string, userId: string, data: Record<string, unknown>) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) throw ApiError.notFound("Pet not found");
  if (pet.ownerId !== userId) throw ApiError.forbidden("Not your pet");

  return prisma.pet.update({ where: { id: petId }, data: data as any });
}

export async function deletePet(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) throw ApiError.notFound("Pet not found");
  if (pet.ownerId !== userId) throw ApiError.forbidden("Not your pet");

  await prisma.pet.delete({ where: { id: petId } });
}
```

- [ ] **Step 3: Create pets.controller.ts**

```typescript
import { Response } from "express";
import * as petsService from "./pets.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const pets = await petsService.getUserPets(req.user!.userId);
  return apiResponse(res, 200, pets);
}

export async function create(req: AuthRequest, res: Response) {
  const pet = await petsService.createPet(req.user!.userId, req.body);
  return apiResponse(res, 201, pet, "Pet added");
}

export async function update(req: AuthRequest, res: Response) {
  const pet = await petsService.updatePet(req.params.id, req.user!.userId, req.body);
  return apiResponse(res, 200, pet, "Pet updated");
}

export async function remove(req: AuthRequest, res: Response) {
  await petsService.deletePet(req.params.id, req.user!.userId);
  return apiResponse(res, 200, null, "Pet removed");
}
```

- [ ] **Step 4: Create pets.routes.ts**

```typescript
import { Router } from "express";
import * as petsController from "./pets.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { createPetSchema, updatePetSchema } from "./pets.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", petsController.list);
router.post("/", validate(createPetSchema), petsController.create);
router.put("/:id", validate(updatePetSchema), petsController.update);
router.delete("/:id", petsController.remove);

export default router;
```

- [ ] **Step 5: Mount in app.ts and commit**

```typescript
import petsRoutes from "./modules/pets/pets.routes.js";
app.use("/api/pets", petsRoutes);
```

```bash
git add backend/src/modules/pets/ backend/src/app.ts
git commit -m "feat: add pets module with CRUD operations"
```

---

### Task 8: Appointments Module

**Files:**
- Create: `backend/src/modules/appointments/appointments.validation.ts`
- Create: `backend/src/modules/appointments/appointments.service.ts`
- Create: `backend/src/modules/appointments/appointments.controller.ts`
- Create: `backend/src/modules/appointments/appointments.routes.ts`
- Modify: `backend/src/app.ts` — mount appointments routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole`, `ApiError`, `apiResponse`, `paginate`, `paginatedResponse`
- Produces:
  - GET `/api/appointments?type=upcoming|previous` → paginated appointments
  - POST `/api/appointments` — book `{ date, time, petId, practiceId, serviceType?, notes? }`
  - PUT `/api/appointments/:id` — reschedule
  - PATCH `/api/appointments/:id/cancel` — cancel
  - PATCH `/api/appointments/:id/confirm` — vet confirms

- [ ] **Step 1: Create appointments.validation.ts**

```typescript
import { z } from "zod";

export const createAppointmentSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  petId: z.string().min(1, "Pet is required"),
  practiceId: z.string().min(1, "Practice is required"),
  serviceType: z.string().optional(),
  notes: z.string().optional(),
});

export const rescheduleSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
});
```

- [ ] **Step 2: Create appointments.service.ts**

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";
import { paginate, paginatedResponse } from "../../shared/utils/pagination.js";

export async function listAppointments(userId: string, query: { type?: string; page?: string; limit?: string }) {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const now = new Date();

  const where: any = { userId };

  if (query.type === "upcoming") {
    where.date = { gte: now };
    where.status = { in: ["PENDING", "CONFIRMED"] };
  } else if (query.type === "previous") {
    where.OR = [
      { date: { lt: now } },
      { status: { in: ["COMPLETED", "CANCELLED"] } },
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: query.type === "previous" ? "desc" : "asc" },
      skip,
      take,
      include: {
        pet: { select: { name: true, type: true } },
        practice: { select: { name: true, slug: true, address: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return paginatedResponse(appointments, total, page, limit);
}

export async function createAppointment(userId: string, data: {
  date: string; time: string; petId: string; practiceId: string; serviceType?: string; notes?: string;
}) {
  // Verify pet belongs to user
  const pet = await prisma.pet.findUnique({ where: { id: data.petId } });
  if (!pet || pet.ownerId !== userId) throw ApiError.badRequest("Invalid pet");

  // Verify practice exists and is approved
  const practice = await prisma.practice.findUnique({ where: { id: data.practiceId } });
  if (!practice || practice.status !== "APPROVED") throw ApiError.badRequest("Invalid practice");

  return prisma.appointment.create({
    data: {
      date: new Date(data.date),
      time: data.time,
      petId: data.petId,
      practiceId: data.practiceId,
      userId,
      serviceType: data.serviceType,
      notes: data.notes,
    },
    include: {
      pet: { select: { name: true } },
      practice: { select: { name: true } },
    },
  });
}

export async function reschedule(appointmentId: string, userId: string, data: { date: string; time: string }) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) throw ApiError.notFound("Appointment not found");
  if (appointment.userId !== userId) throw ApiError.forbidden();
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    throw ApiError.badRequest("Cannot reschedule this appointment");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { date: new Date(data.date), time: data.time, status: "PENDING" },
  });
}

export async function cancel(appointmentId: string, userId: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) throw ApiError.notFound("Appointment not found");
  if (appointment.userId !== userId) throw ApiError.forbidden();

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });
}

export async function confirm(appointmentId: string, vetUserId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { practice: true },
  });
  if (!appointment) throw ApiError.notFound("Appointment not found");
  if (appointment.practice.ownerId !== vetUserId) throw ApiError.forbidden();

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED" },
  });
}

// For vet dashboard: get appointments for their practice
export async function listVetAppointments(vetUserId: string, query: { type?: string; page?: string; limit?: string }) {
  const practice = await prisma.practice.findFirst({ where: { ownerId: vetUserId } });
  if (!practice) throw ApiError.notFound("No practice found");

  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const now = new Date();
  const where: any = { practiceId: practice.id };

  if (query.type === "upcoming") {
    where.date = { gte: now };
    where.status = { in: ["PENDING", "CONFIRMED"] };
  } else if (query.type === "previous") {
    where.OR = [
      { date: { lt: now } },
      { status: { in: ["COMPLETED", "CANCELLED"] } },
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: "asc" },
      skip,
      take,
      include: {
        pet: { select: { name: true, type: true } },
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return paginatedResponse(appointments, total, page, limit);
}
```

- [ ] **Step 3: Create appointments.controller.ts**

```typescript
import { Response } from "express";
import * as appointmentsService from "./appointments.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const result = await appointmentsService.listAppointments(req.user!.userId, req.query as any);
  return apiResponse(res, 200, result);
}

export async function create(req: AuthRequest, res: Response) {
  const appointment = await appointmentsService.createAppointment(req.user!.userId, req.body);
  return apiResponse(res, 201, appointment, "Appointment booked");
}

export async function reschedule(req: AuthRequest, res: Response) {
  const appointment = await appointmentsService.reschedule(req.params.id, req.user!.userId, req.body);
  return apiResponse(res, 200, appointment, "Appointment rescheduled");
}

export async function cancel(req: AuthRequest, res: Response) {
  const appointment = await appointmentsService.cancel(req.params.id, req.user!.userId);
  return apiResponse(res, 200, appointment, "Appointment cancelled");
}

export async function confirm(req: AuthRequest, res: Response) {
  const appointment = await appointmentsService.confirm(req.params.id, req.user!.userId);
  return apiResponse(res, 200, appointment, "Appointment confirmed");
}

export async function listVet(req: AuthRequest, res: Response) {
  const result = await appointmentsService.listVetAppointments(req.user!.userId, req.query as any);
  return apiResponse(res, 200, result);
}
```

- [ ] **Step 4: Create appointments.routes.ts**

```typescript
import { Router } from "express";
import * as appointmentsController from "./appointments.controller.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { createAppointmentSchema, rescheduleSchema } from "./appointments.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", appointmentsController.list);
router.get("/vet", requireRole("VET"), appointmentsController.listVet);
router.post("/", validate(createAppointmentSchema), appointmentsController.create);
router.put("/:id", validate(rescheduleSchema), appointmentsController.reschedule);
router.patch("/:id/cancel", appointmentsController.cancel);
router.patch("/:id/confirm", requireRole("VET"), appointmentsController.confirm);

export default router;
```

- [ ] **Step 5: Mount in app.ts and commit**

```typescript
import appointmentsRoutes from "./modules/appointments/appointments.routes.js";
app.use("/api/appointments", appointmentsRoutes);
```

```bash
git add backend/src/modules/appointments/ backend/src/app.ts
git commit -m "feat: add appointments module with booking, cancel, confirm, reschedule"
```

---

### Task 9: Reviews Module

**Files:**
- Create: `backend/src/modules/reviews/reviews.validation.ts`
- Create: `backend/src/modules/reviews/reviews.service.ts`
- Create: `backend/src/modules/reviews/reviews.controller.ts`
- Create: `backend/src/modules/reviews/reviews.routes.ts`
- Modify: `backend/src/app.ts` — mount reviews routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole`, `ApiError`, `apiResponse`, `reviewLimiter`
- Produces:
  - GET `/api/reviews/me` → user's reviews
  - POST `/api/reviews` — submit review `{ rating, body, practiceId }`
  - PUT `/api/reviews/:id` — edit (author only)
  - DELETE `/api/reviews/:id` — delete (author only)
  - POST `/api/reviews/:id/reply` — vet replies
  - POST `/api/reviews/:id/helpful` — increment helpful counter
  - `recalculatePracticeRating(practiceId)` — recompute after review changes

- [ ] **Step 1: Create reviews.validation.ts**

```typescript
import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10, "Review must be at least 10 characters"),
  practiceId: z.string().min(1, "Practice is required"),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  body: z.string().min(10).optional(),
});

export const replySchema = z.object({
  reply: z.string().min(1, "Reply is required"),
});
```

- [ ] **Step 2: Create reviews.service.ts**

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

async function recalculatePracticeRating(practiceId: string) {
  const result = await prisma.review.aggregate({
    where: { practiceId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.practice.update({
    where: { id: practiceId },
    data: {
      rating: result._avg.rating ?? 0,
      reviewCount: result._count.rating,
    },
  });
}

export async function getUserReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      practice: { select: { name: true, slug: true } },
    },
  });
}

export async function createReview(userId: string, data: { rating: number; body: string; practiceId: string }) {
  // Check practice exists
  const practice = await prisma.practice.findUnique({ where: { id: data.practiceId } });
  if (!practice || practice.status !== "APPROVED") throw ApiError.badRequest("Invalid practice");

  // Check if user already reviewed this practice
  const existing = await prisma.review.findFirst({
    where: { userId, practiceId: data.practiceId },
  });
  if (existing) throw ApiError.conflict("You have already reviewed this practice");

  const review = await prisma.review.create({
    data: {
      rating: data.rating,
      body: data.body,
      userId,
      practiceId: data.practiceId,
      status: "APPROVED", // auto-approve for now; change to PENDING for moderation
    },
  });

  await recalculatePracticeRating(data.practiceId);
  return review;
}

export async function updateReview(reviewId: string, userId: string, data: { rating?: number; body?: string }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound("Review not found");
  if (review.userId !== userId) throw ApiError.forbidden();

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data,
  });

  if (data.rating !== undefined) {
    await recalculatePracticeRating(review.practiceId);
  }

  return updated;
}

export async function deleteReview(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound("Review not found");
  if (review.userId !== userId) throw ApiError.forbidden();

  await prisma.review.delete({ where: { id: reviewId } });
  await recalculatePracticeRating(review.practiceId);
}

export async function replyToReview(reviewId: string, vetUserId: string, replyText: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { practice: true },
  });
  if (!review) throw ApiError.notFound("Review not found");
  if (review.practice.ownerId !== vetUserId) throw ApiError.forbidden("Not your practice's review");

  return prisma.review.update({
    where: { id: reviewId },
    data: { reply: replyText, replyDate: new Date() },
  });
}

export async function markHelpful(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound("Review not found");

  return prisma.review.update({
    where: { id: reviewId },
    data: { helpful: { increment: 1 } },
  });
}

export async function getPracticeReviews(practiceId: string, page?: string, limit?: string) {
  const p = Math.max(1, parseInt(page || "1", 10));
  const l = Math.min(50, Math.max(1, parseInt(limit || "10", 10)));

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { practiceId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * l,
      take: l,
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
    prisma.review.count({ where: { practiceId, status: "APPROVED" } }),
  ]);

  return { data: reviews, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
}
```

- [ ] **Step 3: Create reviews.controller.ts**

```typescript
import { Request, Response } from "express";
import * as reviewsService from "./reviews.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function getUserReviews(req: AuthRequest, res: Response) {
  const reviews = await reviewsService.getUserReviews(req.user!.userId);
  return apiResponse(res, 200, reviews);
}

export async function create(req: AuthRequest, res: Response) {
  const review = await reviewsService.createReview(req.user!.userId, req.body);
  return apiResponse(res, 201, review, "Review submitted");
}

export async function update(req: AuthRequest, res: Response) {
  const review = await reviewsService.updateReview(req.params.id, req.user!.userId, req.body);
  return apiResponse(res, 200, review, "Review updated");
}

export async function remove(req: AuthRequest, res: Response) {
  await reviewsService.deleteReview(req.params.id, req.user!.userId);
  return apiResponse(res, 200, null, "Review deleted");
}

export async function reply(req: AuthRequest, res: Response) {
  const review = await reviewsService.replyToReview(req.params.id, req.user!.userId, req.body.reply);
  return apiResponse(res, 200, review, "Reply added");
}

export async function helpful(req: AuthRequest, res: Response) {
  const review = await reviewsService.markHelpful(req.params.id);
  return apiResponse(res, 200, review);
}

export async function practiceReviews(req: Request, res: Response) {
  const result = await reviewsService.getPracticeReviews(
    req.params.practiceId,
    req.query.page as string,
    req.query.limit as string
  );
  return apiResponse(res, 200, result);
}
```

- [ ] **Step 4: Create reviews.routes.ts**

```typescript
import { Router } from "express";
import * as reviewsController from "./reviews.controller.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { reviewLimiter } from "../../shared/middleware/rate-limiter.js";
import { createReviewSchema, updateReviewSchema, replySchema } from "./reviews.validation.js";

const router = Router();

router.get("/practice/:practiceId", reviewsController.practiceReviews);
router.get("/me", authenticate, reviewsController.getUserReviews);
router.post("/", authenticate, reviewLimiter, validate(createReviewSchema), reviewsController.create);
router.put("/:id", authenticate, validate(updateReviewSchema), reviewsController.update);
router.delete("/:id", authenticate, reviewsController.remove);
router.post("/:id/reply", authenticate, requireRole("VET"), validate(replySchema), reviewsController.reply);
router.post("/:id/helpful", authenticate, reviewsController.helpful);

export default router;
```

- [ ] **Step 5: Mount in app.ts and commit**

```typescript
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
app.use("/api/reviews", reviewsRoutes);
```

```bash
git add backend/src/modules/reviews/ backend/src/app.ts
git commit -m "feat: add reviews module with CRUD, replies, helpful, and rating recalculation"
```

---

### Task 10: Vet Dashboard Modules (Services, Facilities, Team Members, Opening Hours, Gallery)

**Files:**
- Create: `backend/src/modules/vet/vet.routes.ts` (aggregates all vet sub-routes)
- Create: `backend/src/modules/vet/services.controller.ts`
- Create: `backend/src/modules/vet/services.service.ts`
- Create: `backend/src/modules/vet/facilities.controller.ts`
- Create: `backend/src/modules/vet/facilities.service.ts`
- Create: `backend/src/modules/vet/team-members.controller.ts`
- Create: `backend/src/modules/vet/team-members.service.ts`
- Create: `backend/src/modules/vet/opening-hours.controller.ts`
- Create: `backend/src/modules/vet/opening-hours.service.ts`
- Create: `backend/src/modules/vet/gallery.controller.ts`
- Create: `backend/src/modules/vet/gallery.service.ts`
- Create: `backend/src/modules/vet/animal-types.controller.ts`
- Create: `backend/src/modules/vet/animal-types.service.ts`
- Create: `backend/src/modules/vet/dashboard.controller.ts`
- Create: `backend/src/modules/vet/dashboard.service.ts`
- Create: `backend/src/modules/vet/vet.validation.ts`
- Modify: `backend/src/app.ts` — mount vet routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole("VET")`, `ApiError`, `apiResponse`
- Produces: All vet dashboard CRUD endpoints under `/api/vet/*`

This task bundles all vet dashboard sub-modules since they all follow the same pattern: authenticate as VET, look up the vet's practice, then CRUD a related entity. Each sub-module is a separate file pair (service + controller) but shares one validation file and one route aggregator.

- [ ] **Step 1: Create a helper to get the vet's practice**

Create `backend/src/modules/vet/helpers.ts`:

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function getVetPractice(vetUserId: string) {
  const practice = await prisma.practice.findFirst({
    where: { ownerId: vetUserId },
  });
  if (!practice) throw ApiError.notFound("No practice found for this account");
  return practice;
}
```

- [ ] **Step 2: Create vet.validation.ts**

```typescript
import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  active: z.boolean().optional(),
});

export const facilitySchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

export const openingHoursSchema = z.object({
  hours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string(),
    closeTime: z.string(),
    closed: z.boolean(),
  })),
});

export const holidaySchema = z.object({
  date: z.string().min(1),
  note: z.string().optional(),
});

export const emergencyHoursSchema = z.object({
  enabled: z.boolean(),
  details: z.string().optional(),
});

export const animalTypeToggleSchema = z.object({
  animalTypeId: z.string().min(1),
});
```

- [ ] **Step 3: Create services.service.ts and services.controller.ts**

`backend/src/modules/vet/services.service.ts`:

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function list(practiceId: string) {
  return prisma.service.findMany({ where: { practiceId }, orderBy: { name: "asc" } });
}

export async function create(practiceId: string, data: { name: string; description?: string; price: number; active?: boolean }) {
  return prisma.service.create({ data: { ...data, practiceId } });
}

export async function update(serviceId: string, practiceId: string, data: Record<string, unknown>) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.practiceId !== practiceId) throw ApiError.notFound("Service not found");
  return prisma.service.update({ where: { id: serviceId }, data: data as any });
}

export async function remove(serviceId: string, practiceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.practiceId !== practiceId) throw ApiError.notFound("Service not found");
  await prisma.service.delete({ where: { id: serviceId } });
}
```

`backend/src/modules/vet/services.controller.ts`:

```typescript
import { Response } from "express";
import * as servicesService from "./services.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const services = await servicesService.list(practice.id);
  return apiResponse(res, 200, services);
}

export async function create(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const service = await servicesService.create(practice.id, req.body);
  return apiResponse(res, 201, service, "Service added");
}

export async function update(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const service = await servicesService.update(req.params.id, practice.id, req.body);
  return apiResponse(res, 200, service, "Service updated");
}

export async function remove(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  await servicesService.remove(req.params.id, practice.id);
  return apiResponse(res, 200, null, "Service removed");
}
```

- [ ] **Step 4: Create facilities.service.ts and facilities.controller.ts**

`backend/src/modules/vet/facilities.service.ts`:

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function list(practiceId: string) {
  return prisma.facility.findMany({ where: { practiceId }, orderBy: { name: "asc" } });
}

export async function create(practiceId: string, data: { name: string; active?: boolean }) {
  return prisma.facility.create({ data: { ...data, practiceId } });
}

export async function remove(facilityId: string, practiceId: string) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility || facility.practiceId !== practiceId) throw ApiError.notFound("Facility not found");
  await prisma.facility.delete({ where: { id: facilityId } });
}
```

`backend/src/modules/vet/facilities.controller.ts`:

```typescript
import { Response } from "express";
import * as facilitiesService from "./facilities.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 200, await facilitiesService.list(practice.id));
}

export async function create(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const facility = await facilitiesService.create(practice.id, req.body);
  return apiResponse(res, 201, facility, "Facility added");
}

export async function remove(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  await facilitiesService.remove(req.params.id, practice.id);
  return apiResponse(res, 200, null, "Facility removed");
}
```

- [ ] **Step 5: Create team-members.service.ts and team-members.controller.ts**

`backend/src/modules/vet/team-members.service.ts`:

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function list(practiceId: string) {
  return prisma.teamMember.findMany({ where: { practiceId }, orderBy: { name: "asc" } });
}

export async function create(practiceId: string, data: { name: string; role: string; email?: string; phone?: string; active?: boolean }) {
  return prisma.teamMember.create({ data: { ...data, practiceId } });
}

export async function update(memberId: string, practiceId: string, data: Record<string, unknown>) {
  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member || member.practiceId !== practiceId) throw ApiError.notFound("Team member not found");
  return prisma.teamMember.update({ where: { id: memberId }, data: data as any });
}

export async function remove(memberId: string, practiceId: string) {
  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member || member.practiceId !== practiceId) throw ApiError.notFound("Team member not found");
  await prisma.teamMember.delete({ where: { id: memberId } });
}
```

`backend/src/modules/vet/team-members.controller.ts`:

```typescript
import { Response } from "express";
import * as teamService from "./team-members.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 200, await teamService.list(practice.id));
}

export async function create(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 201, await teamService.create(practice.id, req.body), "Team member added");
}

export async function update(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 200, await teamService.update(req.params.id, practice.id, req.body), "Team member updated");
}

export async function remove(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  await teamService.remove(req.params.id, practice.id);
  return apiResponse(res, 200, null, "Team member removed");
}
```

- [ ] **Step 6: Create opening-hours.service.ts and opening-hours.controller.ts**

`backend/src/modules/vet/opening-hours.service.ts`:

```typescript
import { prisma } from "../../config/database.js";

export async function getHours(practiceId: string) {
  const [hours, holidays, emergency] = await Promise.all([
    prisma.openingHours.findMany({ where: { practiceId }, orderBy: { dayOfWeek: "asc" } }),
    prisma.holidayHours.findMany({ where: { practiceId }, orderBy: { date: "asc" } }),
    prisma.emergencyHours.findUnique({ where: { practiceId } }),
  ]);
  return { hours, holidays, emergency };
}

export async function bulkUpdateHours(practiceId: string, hours: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }[]) {
  // Delete existing and recreate
  await prisma.openingHours.deleteMany({ where: { practiceId } });
  await prisma.openingHours.createMany({
    data: hours.map((h) => ({ ...h, practiceId })),
  });
  return prisma.openingHours.findMany({ where: { practiceId }, orderBy: { dayOfWeek: "asc" } });
}

export async function addHoliday(practiceId: string, data: { date: string; note?: string }) {
  return prisma.holidayHours.create({
    data: { date: new Date(data.date), note: data.note, practiceId },
  });
}

export async function removeHoliday(holidayId: string, practiceId: string) {
  await prisma.holidayHours.deleteMany({ where: { id: holidayId, practiceId } });
}

export async function updateEmergencyHours(practiceId: string, data: { enabled: boolean; details?: string }) {
  return prisma.emergencyHours.upsert({
    where: { practiceId },
    update: data,
    create: { ...data, practiceId },
  });
}
```

`backend/src/modules/vet/opening-hours.controller.ts`:

```typescript
import { Response } from "express";
import * as hoursService from "./opening-hours.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function getHours(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 200, await hoursService.getHours(practice.id));
}

export async function updateHours(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const hours = await hoursService.bulkUpdateHours(practice.id, req.body.hours);
  return apiResponse(res, 200, hours, "Opening hours updated");
}

export async function addHoliday(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const holiday = await hoursService.addHoliday(practice.id, req.body);
  return apiResponse(res, 201, holiday, "Holiday added");
}

export async function removeHoliday(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  await hoursService.removeHoliday(req.params.id, practice.id);
  return apiResponse(res, 200, null, "Holiday removed");
}

export async function updateEmergency(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const emergency = await hoursService.updateEmergencyHours(practice.id, req.body);
  return apiResponse(res, 200, emergency, "Emergency hours updated");
}
```

- [ ] **Step 7: Create gallery.service.ts and gallery.controller.ts**

`backend/src/modules/vet/gallery.service.ts`:

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";
import type { MediaType } from "@prisma/client";

export async function list(practiceId: string) {
  return prisma.galleryMedia.findMany({
    where: { practiceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function create(practiceId: string, data: { url: string; key: string; type: MediaType; category?: string }) {
  return prisma.galleryMedia.create({ data: { ...data, practiceId } });
}

export async function remove(mediaId: string, practiceId: string) {
  const media = await prisma.galleryMedia.findUnique({ where: { id: mediaId } });
  if (!media || media.practiceId !== practiceId) throw ApiError.notFound("Media not found");
  await prisma.galleryMedia.delete({ where: { id: mediaId } });
  return media; // Return so controller can delete from Cloudflare
}
```

`backend/src/modules/vet/gallery.controller.ts`:

```typescript
import { Response } from "express";
import * as galleryService from "./gallery.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 200, await galleryService.list(practice.id));
}

export async function create(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const media = await galleryService.create(practice.id, req.body);
  return apiResponse(res, 201, media, "Media added");
}

export async function remove(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  await galleryService.remove(req.params.id, practice.id);
  // TODO: Also delete from Cloudflare R2 when keys are configured
  return apiResponse(res, 200, null, "Media removed");
}
```

- [ ] **Step 8: Create animal-types.service.ts and animal-types.controller.ts**

`backend/src/modules/vet/animal-types.service.ts`:

```typescript
import { prisma } from "../../config/database.js";

export async function listForPractice(practiceId: string) {
  const all = await prisma.animalType.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const assigned = await prisma.practiceAnimalType.findMany({ where: { practiceId } });
  const assignedIds = new Set(assigned.map((a) => a.animalTypeId));

  return all.map((at) => ({ ...at, selected: assignedIds.has(at.id) }));
}

export async function toggle(practiceId: string, animalTypeId: string) {
  const existing = await prisma.practiceAnimalType.findUnique({
    where: { practiceId_animalTypeId: { practiceId, animalTypeId } },
  });

  if (existing) {
    await prisma.practiceAnimalType.delete({
      where: { practiceId_animalTypeId: { practiceId, animalTypeId } },
    });
    return { added: false };
  }

  await prisma.practiceAnimalType.create({ data: { practiceId, animalTypeId } });
  return { added: true };
}
```

`backend/src/modules/vet/animal-types.controller.ts`:

```typescript
import { Response } from "express";
import * as animalTypesService from "./animal-types.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  return apiResponse(res, 200, await animalTypesService.listForPractice(practice.id));
}

export async function toggle(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const result = await animalTypesService.toggle(practice.id, req.body.animalTypeId);
  return apiResponse(res, 200, result);
}
```

- [ ] **Step 9: Create dashboard.service.ts and dashboard.controller.ts**

`backend/src/modules/vet/dashboard.service.ts`:

```typescript
import { prisma } from "../../config/database.js";

export async function getDashboardStats(practiceId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [profileViews, bookings, enquiries, reviewCount, recentReviews, recentEnquiries] = await Promise.all([
    prisma.profileView.count({ where: { practiceId, date: { gte: thirtyDaysAgo } } }),
    prisma.appointment.count({ where: { practiceId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contactAction.count({ where: { practiceId, date: { gte: thirtyDaysAgo } } }),
    prisma.review.count({ where: { practiceId, status: "APPROVED" } }),
    prisma.review.findMany({
      where: { practiceId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.contactAction.findMany({
      where: { practiceId },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  return {
    stats: { profileViews, bookings, enquiries, reviewCount },
    recentReviews,
    recentEnquiries,
  };
}
```

`backend/src/modules/vet/dashboard.controller.ts`:

```typescript
import { Response } from "express";
import * as dashboardService from "./dashboard.service.js";
import { getVetPractice } from "./helpers.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function getDashboard(req: AuthRequest, res: Response) {
  const practice = await getVetPractice(req.user!.userId);
  const data = await dashboardService.getDashboardStats(practice.id);
  return apiResponse(res, 200, data);
}
```

- [ ] **Step 10: Create vet.routes.ts (aggregator)**

```typescript
import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  serviceSchema, facilitySchema, teamMemberSchema,
  openingHoursSchema, holidaySchema, emergencyHoursSchema, animalTypeToggleSchema,
} from "./vet.validation.js";
import * as dashboardController from "./dashboard.controller.js";
import * as servicesController from "./services.controller.js";
import * as facilitiesController from "./facilities.controller.js";
import * as teamController from "./team-members.controller.js";
import * as hoursController from "./opening-hours.controller.js";
import * as galleryController from "./gallery.controller.js";
import * as animalTypesController from "./animal-types.controller.js";

const router = Router();
router.use(authenticate, requireRole("VET"));

// Dashboard
router.get("/dashboard", dashboardController.getDashboard);

// Services
router.get("/services", servicesController.list);
router.post("/services", validate(serviceSchema), servicesController.create);
router.put("/services/:id", validate(serviceSchema.partial()), servicesController.update);
router.delete("/services/:id", servicesController.remove);

// Facilities
router.get("/facilities", facilitiesController.list);
router.post("/facilities", validate(facilitySchema), facilitiesController.create);
router.delete("/facilities/:id", facilitiesController.remove);

// Team Members
router.get("/team-members", teamController.list);
router.post("/team-members", validate(teamMemberSchema), teamController.create);
router.put("/team-members/:id", validate(teamMemberSchema.partial()), teamController.update);
router.delete("/team-members/:id", teamController.remove);

// Opening Hours
router.get("/opening-hours", hoursController.getHours);
router.put("/opening-hours", validate(openingHoursSchema), hoursController.updateHours);
router.post("/holiday-hours", validate(holidaySchema), hoursController.addHoliday);
router.delete("/holiday-hours/:id", hoursController.removeHoliday);
router.put("/emergency-hours", validate(emergencyHoursSchema), hoursController.updateEmergency);

// Gallery
router.get("/gallery", galleryController.list);
router.post("/gallery", galleryController.create);
router.delete("/gallery/:id", galleryController.remove);

// Animal Types
router.get("/animal-types", animalTypesController.list);
router.post("/animal-types", validate(animalTypeToggleSchema), animalTypesController.toggle);

export default router;
```

- [ ] **Step 11: Mount in app.ts and commit**

```typescript
import vetRoutes from "./modules/vet/vet.routes.js";
app.use("/api/vet", vetRoutes);
```

```bash
git add backend/src/modules/vet/ backend/src/app.ts
git commit -m "feat: add vet dashboard modules (services, facilities, team, hours, gallery, animal types, dashboard stats)"
```

---

### Task 11: Upload Module (Cloudflare R2)

**Files:**
- Create: `backend/src/config/cloudflare.ts`
- Create: `backend/src/modules/upload/upload.service.ts`
- Create: `backend/src/modules/upload/upload.controller.ts`
- Create: `backend/src/modules/upload/upload.routes.ts`
- Create: `backend/src/shared/middleware/upload.ts` (multer config)
- Modify: `backend/src/app.ts` — mount upload routes

**Interfaces:**
- Consumes: `env`, `authenticate`, `@aws-sdk/client-s3`, `multer`
- Produces:
  - POST `/api/upload/image` — upload single image, returns `{ url, key }`
  - POST `/api/upload/images` — batch upload, returns `{ files: [{ url, key }] }`
  - DELETE `/api/upload/:key` — delete from R2

- [ ] **Step 1: Create config/cloudflare.ts**

```typescript
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_KEY,
  },
});
```

- [ ] **Step 2: Create shared/middleware/upload.ts**

```typescript
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
}).single("file");

export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
}).array("files", 10);
```

- [ ] **Step 3: Create upload.service.ts**

```typescript
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { r2Client } from "../../config/cloudflare.js";
import { env } from "../../config/env.js";
import path from "path";

export async function uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
  const ext = path.extname(file.originalname);
  const key = `uploads/${uuidv4()}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `${env.CLOUDFLARE_CDN_URL}/${key}`;
  return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET,
      Key: key,
    })
  );
}
```

- [ ] **Step 4: Create upload.controller.ts**

```typescript
import { Response } from "express";
import * as uploadService from "./upload.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import { ApiError } from "../../shared/utils/api-error.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function uploadImage(req: AuthRequest, res: Response) {
  if (!req.file) throw ApiError.badRequest("No file provided");
  const result = await uploadService.uploadFile(req.file);
  return apiResponse(res, 201, result, "File uploaded");
}

export async function uploadImages(req: AuthRequest, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) throw ApiError.badRequest("No files provided");

  const results = await Promise.all(files.map((f) => uploadService.uploadFile(f)));
  return apiResponse(res, 201, { files: results }, "Files uploaded");
}

export async function deleteImage(req: AuthRequest, res: Response) {
  await uploadService.deleteFile(req.params.key);
  return apiResponse(res, 200, null, "File deleted");
}
```

- [ ] **Step 5: Create upload.routes.ts**

```typescript
import { Router } from "express";
import * as uploadController from "./upload.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "../../shared/middleware/upload.js";

const router = Router();
router.use(authenticate);

router.post("/image", uploadSingle, uploadController.uploadImage);
router.post("/images", uploadMultiple, uploadController.uploadImages);
router.delete("/:key(*)", uploadController.deleteImage);

export default router;
```

- [ ] **Step 6: Mount in app.ts and commit**

```typescript
import uploadRoutes from "./modules/upload/upload.routes.js";
app.use("/api/upload", uploadRoutes);
```

```bash
git add backend/src/config/cloudflare.ts backend/src/shared/middleware/upload.ts backend/src/modules/upload/ backend/src/app.ts
git commit -m "feat: add file upload module with Cloudflare R2 storage"
```

---

### Task 12: Notifications + Socket.io

**Files:**
- Create: `backend/src/config/socket.ts`
- Create: `backend/src/socket/index.ts`
- Create: `backend/src/modules/notifications/notifications.service.ts`
- Create: `backend/src/modules/notifications/notifications.controller.ts`
- Create: `backend/src/modules/notifications/notifications.routes.ts`
- Modify: `backend/src/server.ts` — integrate Socket.io with HTTP server

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `apiResponse`, Socket.io, JWT
- Produces:
  - `emitToUser(userId, event, data)` — send real-time event
  - `createAndEmitNotification({ userId, category, title, body, actionUrl? })` — persist + push
  - GET `/api/notifications?category=` → user's notifications
  - PATCH `/api/notifications/read-all` — mark all read
  - PATCH `/api/notifications/:id/read` — mark single read
  - DELETE `/api/notifications/:id` — delete

- [ ] **Step 1: Create config/socket.ts**

```typescript
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    console.log(`Socket connected: ${userId}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
```

- [ ] **Step 2: Create socket/index.ts**

```typescript
import { getIO } from "../config/socket.js";

export function emitToUser(userId: string, event: string, data: unknown) {
  getIO().to(`user:${userId}`).emit(event, data);
}
```

- [ ] **Step 3: Create notifications.service.ts**

```typescript
import { NotificationCategory } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { emitToUser } from "../../socket/index.js";

export async function createAndEmit(data: {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionUrl?: string;
}) {
  const notification = await prisma.notification.create({ data });
  emitToUser(data.userId, "notification:new", notification);
  return notification;
}

export async function list(userId: string, category?: string) {
  const where: any = { userId };
  if (category) where.category = category;

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function markRead(notificationId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function remove(notificationId: string, userId: string) {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
```

- [ ] **Step 4: Create notifications.controller.ts**

```typescript
import { Response } from "express";
import * as notificationsService from "./notifications.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function list(req: AuthRequest, res: Response) {
  const notifications = await notificationsService.list(req.user!.userId, req.query.category as string);
  const unreadCount = await notificationsService.getUnreadCount(req.user!.userId);
  return apiResponse(res, 200, { notifications, unreadCount });
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await notificationsService.markAllRead(req.user!.userId);
  return apiResponse(res, 200, null, "All marked as read");
}

export async function markRead(req: AuthRequest, res: Response) {
  await notificationsService.markRead(req.params.id, req.user!.userId);
  return apiResponse(res, 200, null, "Marked as read");
}

export async function remove(req: AuthRequest, res: Response) {
  await notificationsService.remove(req.params.id, req.user!.userId);
  return apiResponse(res, 200, null, "Notification deleted");
}
```

- [ ] **Step 5: Create notifications.routes.ts**

```typescript
import { Router } from "express";
import * as notificationsController from "./notifications.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", notificationsController.list);
router.patch("/read-all", notificationsController.markAllRead);
router.patch("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.remove);

export default router;
```

- [ ] **Step 6: Update server.ts to integrate Socket.io**

Replace `backend/src/server.ts` with:

```typescript
import http from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";

const app = createApp();
const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
```

- [ ] **Step 7: Mount in app.ts and commit**

```typescript
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
app.use("/api/notifications", notificationsRoutes);
```

```bash
git add backend/src/config/socket.ts backend/src/socket/ backend/src/modules/notifications/ backend/src/server.ts backend/src/app.ts
git commit -m "feat: add notifications module with Socket.io real-time push"
```

---

### Task 13: Subscriptions + Stripe

**Files:**
- Create: `backend/src/config/stripe.ts`
- Create: `backend/src/modules/subscriptions/subscriptions.service.ts`
- Create: `backend/src/modules/subscriptions/subscriptions.controller.ts`
- Create: `backend/src/modules/subscriptions/subscriptions.routes.ts`
- Modify: `backend/src/app.ts` — mount subscriptions routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole("VET")`, `env`, `stripe`
- Produces:
  - GET `/api/subscriptions/plans` — list plans
  - POST `/api/subscriptions/checkout` — create Stripe checkout session, returns `{ sessionUrl }`
  - POST `/api/subscriptions/webhook` — Stripe webhook (raw body required)
  - GET `/api/subscriptions/me` — current subscription
  - POST `/api/subscriptions/cancel` — cancel subscription

- [ ] **Step 1: Create config/stripe.ts**

```typescript
import Stripe from "stripe";
import { env } from "./env.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});
```

- [ ] **Step 2: Create subscriptions.service.ts**

```typescript
import { prisma } from "../../config/database.js";
import { stripe } from "../../config/stripe.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../shared/utils/api-error.js";

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
}

export async function createCheckoutSession(vetUserId: string, planId: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) throw ApiError.notFound("Plan not found");
  if (!plan.stripePriceId) throw ApiError.badRequest("Plan not configured for payments");

  const practice = await prisma.practice.findFirst({ where: { ownerId: vetUserId } });
  if (!practice) throw ApiError.notFound("No practice found");

  // Get or create Stripe customer
  let subscription = await prisma.subscription.findUnique({ where: { practiceId: practice.id } });
  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const user = await prisma.user.findUnique({ where: { id: vetUserId } });
    const customer = await stripe.customers.create({
      email: user!.email,
      metadata: { practiceId: practice.id, userId: vetUserId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${env.FRONTEND_URL}/vet-dashboard/subscription?success=true`,
    cancel_url: `${env.FRONTEND_URL}/vet-dashboard/subscription?cancelled=true`,
    metadata: { practiceId: practice.id, planId: plan.id },
  });

  return { sessionUrl: session.url };
}

export async function handleWebhook(event: any) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { practiceId, planId } = session.metadata;

      await prisma.subscription.upsert({
        where: { practiceId },
        update: {
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          status: "active",
          planId,
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          practiceId,
          planId,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          status: "active",
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "cancelled" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: invoice.customer as string },
        data: { status: "past_due" },
      });
      break;
    }
  }
}

export async function getCurrentSubscription(vetUserId: string) {
  const practice = await prisma.practice.findFirst({ where: { ownerId: vetUserId } });
  if (!practice) throw ApiError.notFound("No practice found");

  return prisma.subscription.findUnique({
    where: { practiceId: practice.id },
    include: { plan: true },
  });
}

export async function cancelSubscription(vetUserId: string) {
  const practice = await prisma.practice.findFirst({ where: { ownerId: vetUserId } });
  if (!practice) throw ApiError.notFound("No practice found");

  const subscription = await prisma.subscription.findUnique({ where: { practiceId: practice.id } });
  if (!subscription?.stripeSubscriptionId) throw ApiError.badRequest("No active subscription");

  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

  return prisma.subscription.update({
    where: { practiceId: practice.id },
    data: { status: "cancelled" },
  });
}
```

- [ ] **Step 3: Create subscriptions.controller.ts**

```typescript
import { Request, Response } from "express";
import { stripe } from "../../config/stripe.js";
import { env } from "../../config/env.js";
import * as subscriptionsService from "./subscriptions.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import { ApiError } from "../../shared/utils/api-error.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function listPlans(_req: Request, res: Response) {
  const plans = await subscriptionsService.listPlans();
  return apiResponse(res, 200, plans);
}

export async function checkout(req: AuthRequest, res: Response) {
  const { planId } = req.body;
  if (!planId) throw ApiError.badRequest("Plan ID is required");
  const result = await subscriptionsService.createCheckoutSession(req.user!.userId, planId);
  return apiResponse(res, 200, result);
}

export async function webhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await subscriptionsService.handleWebhook(event);
  return res.json({ received: true });
}

export async function getCurrent(req: AuthRequest, res: Response) {
  const subscription = await subscriptionsService.getCurrentSubscription(req.user!.userId);
  return apiResponse(res, 200, subscription);
}

export async function cancel(req: AuthRequest, res: Response) {
  const subscription = await subscriptionsService.cancelSubscription(req.user!.userId);
  return apiResponse(res, 200, subscription, "Subscription cancelled");
}
```

- [ ] **Step 4: Create subscriptions.routes.ts**

```typescript
import { Router } from "express";
import express from "express";
import * as subscriptionsController from "./subscriptions.controller.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";

const router = Router();

router.get("/plans", subscriptionsController.listPlans);
router.post("/webhook", express.raw({ type: "application/json" }), subscriptionsController.webhook);
router.post("/checkout", authenticate, requireRole("VET"), subscriptionsController.checkout);
router.get("/me", authenticate, requireRole("VET"), subscriptionsController.getCurrent);
router.post("/cancel", authenticate, requireRole("VET"), subscriptionsController.cancel);

export default router;
```

- [ ] **Step 5: Mount in app.ts**

Important: the webhook route needs raw body, so mount it **before** `express.json()` or use the route-level raw middleware (already handled in routes file).

```typescript
import subscriptionsRoutes from "./modules/subscriptions/subscriptions.routes.js";
app.use("/api/subscriptions", subscriptionsRoutes);
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/config/stripe.ts backend/src/modules/subscriptions/ backend/src/app.ts
git commit -m "feat: add subscriptions module with Stripe checkout, webhooks, and plan management"
```

---

### Task 14: Admin Module

**Files:**
- Create: `backend/src/modules/admin/admin.service.ts`
- Create: `backend/src/modules/admin/admin.controller.ts`
- Create: `backend/src/modules/admin/admin.routes.ts`
- Create: `backend/src/modules/admin/admin.validation.ts`
- Modify: `backend/src/app.ts` — mount admin routes

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole("ADMIN")`, `ApiError`, `apiResponse`, `paginate`, `paginatedResponse`, `createAndEmit` (notifications)
- Produces: All `/api/admin/*` endpoints for dashboard stats, practice approvals, review moderation, animal types/service categories CRUD, blog CRUD, sponsorship CRUD, contact enquiries, user/practice management

- [ ] **Step 1: Create admin.validation.ts**

```typescript
import { z } from "zod";

export const animalTypeSchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
});

export const serviceCategorySchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).optional(),
});

export const sponsorshipSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export const subscriptionPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  features: z.any(),
  analyticsEnabled: z.boolean().optional(),
  featuredBadge: z.boolean().optional(),
  stripePriceId: z.string().optional(),
});

export const enquiryReplySchema = z.object({
  reply: z.string().min(1),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]).optional(),
});
```

- [ ] **Step 2: Create admin.service.ts**

```typescript
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/api-error.js";
import { paginate, paginatedResponse } from "../../shared/utils/pagination.js";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug.js";
import { createAndEmit } from "../notifications/notifications.service.js";

// ─── Dashboard ───────────────────────────────────────
export async function getDashboardStats() {
  const [totalPractices, totalPetOwners, totalReviews, pendingApprovals, recentReviews] = await Promise.all([
    prisma.practice.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where: { role: "PET_OWNER", deletedAt: null } }),
    prisma.review.count(),
    prisma.practice.count({ where: { status: "PENDING" } }),
    prisma.review.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
        practice: { select: { name: true } },
      },
    }),
  ]);

  const pendingPractices = await prisma.practice.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { owner: { select: { firstName: true, lastName: true, email: true } } },
  });

  // Monthly signups for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySignups = await prisma.user.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: sixMonthsAgo } },
    _count: true,
  });

  return {
    stats: { totalPractices, totalPetOwners, totalReviews, pendingApprovals },
    pendingPractices,
    recentReviews,
    monthlySignups,
  };
}

// ─── Practice Approvals ──────────────────────────────
export async function approvePractice(practiceId: string) {
  const practice = await prisma.practice.update({
    where: { id: practiceId },
    data: { status: "APPROVED" },
  });

  await createAndEmit({
    userId: practice.ownerId,
    category: "REMINDERS",
    title: "Practice Approved",
    body: `Your practice "${practice.name}" has been approved and is now visible in the directory.`,
    actionUrl: "/vet-dashboard",
  });

  return practice;
}

export async function rejectPractice(practiceId: string) {
  const practice = await prisma.practice.update({
    where: { id: practiceId },
    data: { status: "REJECTED" },
  });

  await createAndEmit({
    userId: practice.ownerId,
    category: "REMINDERS",
    title: "Practice Registration Rejected",
    body: `Your practice "${practice.name}" registration has been rejected. Please contact support for details.`,
  });

  return practice;
}

// ─── Review Moderation ───────────────────────────────
export async function listReviewsForModeration(status?: string, page?: string, limit?: string) {
  const { skip, take, page: p, limit: l } = paginate(page, limit);
  const where: any = {};
  if (status) where.status = status;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        practice: { select: { name: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return paginatedResponse(reviews, total, p, l);
}

export async function moderateReview(reviewId: string, status: string) {
  return prisma.review.update({
    where: { id: reviewId },
    data: { status: status as any },
  });
}

// ─── Animal Types (Global) ──────────────────────────
export async function listAnimalTypes() {
  return prisma.animalType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { practices: true } } },
  });
}

export async function createAnimalType(data: { name: string; active?: boolean }) {
  return prisma.animalType.create({ data });
}

export async function updateAnimalType(id: string, data: Record<string, unknown>) {
  return prisma.animalType.update({ where: { id }, data: data as any });
}

export async function deleteAnimalType(id: string) {
  await prisma.animalType.delete({ where: { id } });
}

// ─── Service Categories (Global) ────────────────────
export async function listServiceCategories() {
  return prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });
}

export async function createServiceCategory(data: { name: string; active?: boolean }) {
  return prisma.serviceCategory.create({ data });
}

export async function updateServiceCategory(id: string, data: Record<string, unknown>) {
  return prisma.serviceCategory.update({ where: { id }, data: data as any });
}

export async function deleteServiceCategory(id: string) {
  await prisma.serviceCategory.delete({ where: { id } });
}

// ─── Blog ────────────────────────────────────────────
export async function listBlogPosts(status?: string, page?: string, limit?: string) {
  const { skip, take, page: p, limit: l } = paginate(page, limit);
  const where: any = {};
  if (status) where.status = status;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.blogPost.count({ where }),
  ]);

  return paginatedResponse(posts, total, p, l);
}

export async function createBlogPost(authorId: string, data: { title: string; excerpt?: string; content: string; category: string; status?: string }) {
  const slug = await ensureUniqueSlug(data.title, async (s) => {
    return !!(await prisma.blogPost.findUnique({ where: { slug: s } }));
  });

  return prisma.blogPost.create({
    data: { ...data, slug, status: (data.status as any) || "DRAFT", authorId },
  });
}

export async function updateBlogPost(id: string, data: Record<string, unknown>) {
  if (data.title) {
    const slug = await ensureUniqueSlug(data.title as string, async (s) => {
      return !!(await prisma.blogPost.findFirst({ where: { slug: s, id: { not: id } } }));
    });
    (data as any).slug = slug;
  }
  return prisma.blogPost.update({ where: { id }, data: data as any });
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.delete({ where: { id } });
}

// ─── Sponsorships ────────────────────────────────────
export async function listSponsorships() {
  return prisma.sponsorship.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createSponsorship(data: { name: string; description?: string; logo?: string; url?: string; active?: boolean }) {
  return prisma.sponsorship.create({ data });
}

export async function updateSponsorship(id: string, data: Record<string, unknown>) {
  return prisma.sponsorship.update({ where: { id }, data: data as any });
}

export async function deleteSponsorship(id: string) {
  await prisma.sponsorship.delete({ where: { id } });
}

// ─── Contact Enquiries ──────────────────────────────
export async function listEnquiries(status?: string, page?: string, limit?: string) {
  const { skip, take, page: p, limit: l } = paginate(page, limit);
  const where: any = {};
  if (status) where.status = status;

  const [enquiries, total] = await Promise.all([
    prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.contactEnquiry.count({ where }),
  ]);

  return paginatedResponse(enquiries, total, p, l);
}

export async function replyToEnquiry(id: string, reply: string, status?: string) {
  return prisma.contactEnquiry.update({
    where: { id },
    data: { reply, status: (status as any) || "RESOLVED" },
  });
}

// ─── User Management ────────────────────────────────
export async function listPetOwners(page?: string, limit?: string) {
  const { skip, take, page: p, limit: l } = paginate(page, limit);
  const where = { role: "PET_OWNER" as const, deletedAt: null };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, p, l);
}

export async function deactivateUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
}

// ─── Practice Management ─────────────────────────────
export async function listAllPractices(status?: string, page?: string, limit?: string) {
  const { skip, take, page: p, limit: l } = paginate(page, limit);
  const where: any = {};
  if (status) where.status = status;

  const [practices, total] = await Promise.all([
    prisma.practice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { owner: { select: { firstName: true, lastName: true, email: true } } },
    }),
    prisma.practice.count({ where }),
  ]);

  return paginatedResponse(practices, total, p, l);
}

export async function suspendPractice(practiceId: string) {
  return prisma.practice.update({
    where: { id: practiceId },
    data: { status: "SUSPENDED" },
  });
}

// ─── Subscription Plans Management ──────────────────
export async function createSubscriptionPlan(data: any) {
  return prisma.subscriptionPlan.create({ data });
}

export async function updateSubscriptionPlan(id: string, data: any) {
  return prisma.subscriptionPlan.update({ where: { id }, data });
}

export async function deleteSubscriptionPlan(id: string) {
  await prisma.subscriptionPlan.delete({ where: { id } });
}

// ─── Featured Listings Management ───────────────────
export async function listFeaturedListings() {
  return prisma.featuredListing.findMany({
    orderBy: { createdAt: "desc" },
    include: { practice: { select: { name: true } } },
  });
}
```

- [ ] **Step 3: Create admin.controller.ts**

```typescript
import { Request, Response } from "express";
import * as adminService from "./admin.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

// Dashboard
export async function dashboard(_req: Request, res: Response) {
  return apiResponse(res, 200, await adminService.getDashboardStats());
}

// Practice Approvals
export async function approvePractice(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.approvePractice(req.params.id), "Practice approved");
}

export async function rejectPractice(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.rejectPractice(req.params.id), "Practice rejected");
}

// Review Moderation
export async function listReviews(req: Request, res: Response) {
  const { status, page, limit } = req.query as any;
  return apiResponse(res, 200, await adminService.listReviewsForModeration(status, page, limit));
}

export async function moderateReview(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.moderateReview(req.params.id, req.body.status), "Review updated");
}

// Animal Types
export async function listAnimalTypes(_req: Request, res: Response) {
  return apiResponse(res, 200, await adminService.listAnimalTypes());
}

export async function createAnimalType(req: AuthRequest, res: Response) {
  return apiResponse(res, 201, await adminService.createAnimalType(req.body), "Animal type created");
}

export async function updateAnimalType(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.updateAnimalType(req.params.id, req.body));
}

export async function deleteAnimalType(req: AuthRequest, res: Response) {
  await adminService.deleteAnimalType(req.params.id);
  return apiResponse(res, 200, null, "Animal type deleted");
}

// Service Categories
export async function listServiceCategories(_req: Request, res: Response) {
  return apiResponse(res, 200, await adminService.listServiceCategories());
}

export async function createServiceCategory(req: AuthRequest, res: Response) {
  return apiResponse(res, 201, await adminService.createServiceCategory(req.body));
}

export async function updateServiceCategory(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.updateServiceCategory(req.params.id, req.body));
}

export async function deleteServiceCategory(req: AuthRequest, res: Response) {
  await adminService.deleteServiceCategory(req.params.id);
  return apiResponse(res, 200, null, "Service category deleted");
}

// Blog
export async function listBlog(req: Request, res: Response) {
  const { status, page, limit } = req.query as any;
  return apiResponse(res, 200, await adminService.listBlogPosts(status, page, limit));
}

export async function createBlog(req: AuthRequest, res: Response) {
  return apiResponse(res, 201, await adminService.createBlogPost(req.user!.userId, req.body), "Blog post created");
}

export async function updateBlog(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.updateBlogPost(req.params.id, req.body));
}

export async function deleteBlog(req: AuthRequest, res: Response) {
  await adminService.deleteBlogPost(req.params.id);
  return apiResponse(res, 200, null, "Blog post deleted");
}

// Sponsorships
export async function listSponsorships(_req: Request, res: Response) {
  return apiResponse(res, 200, await adminService.listSponsorships());
}

export async function createSponsorship(req: AuthRequest, res: Response) {
  return apiResponse(res, 201, await adminService.createSponsorship(req.body));
}

export async function updateSponsorship(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.updateSponsorship(req.params.id, req.body));
}

export async function deleteSponsorship(req: AuthRequest, res: Response) {
  await adminService.deleteSponsorship(req.params.id);
  return apiResponse(res, 200, null, "Sponsorship deleted");
}

// Contact Enquiries
export async function listEnquiries(req: Request, res: Response) {
  const { status, page, limit } = req.query as any;
  return apiResponse(res, 200, await adminService.listEnquiries(status, page, limit));
}

export async function replyEnquiry(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.replyToEnquiry(req.params.id, req.body.reply, req.body.status));
}

// Pet Owners
export async function listPetOwners(req: Request, res: Response) {
  const { page, limit } = req.query as any;
  return apiResponse(res, 200, await adminService.listPetOwners(page, limit));
}

export async function deactivateUser(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.deactivateUser(req.params.id), "User deactivated");
}

// Practices
export async function listPractices(req: Request, res: Response) {
  const { status, page, limit } = req.query as any;
  return apiResponse(res, 200, await adminService.listAllPractices(status, page, limit));
}

export async function suspendPractice(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.suspendPractice(req.params.id), "Practice suspended");
}

// Subscription Plans
export async function createPlan(req: AuthRequest, res: Response) {
  return apiResponse(res, 201, await adminService.createSubscriptionPlan(req.body));
}

export async function updatePlan(req: AuthRequest, res: Response) {
  return apiResponse(res, 200, await adminService.updateSubscriptionPlan(req.params.id, req.body));
}

export async function deletePlan(req: AuthRequest, res: Response) {
  await adminService.deleteSubscriptionPlan(req.params.id);
  return apiResponse(res, 200, null, "Plan deleted");
}

// Featured Listings
export async function listFeatured(_req: Request, res: Response) {
  return apiResponse(res, 200, await adminService.listFeaturedListings());
}
```

- [ ] **Step 4: Create admin.routes.ts**

```typescript
import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  animalTypeSchema, serviceCategorySchema, blogPostSchema,
  sponsorshipSchema, subscriptionPlanSchema, enquiryReplySchema,
} from "./admin.validation.js";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Practice Approvals
router.patch("/pending-approvals/:id/approve", adminController.approvePractice);
router.patch("/pending-approvals/:id/reject", adminController.rejectPractice);

// Review Moderation
router.get("/reviews", adminController.listReviews);
router.patch("/reviews/:id", adminController.moderateReview);

// Animal Types
router.get("/animal-types", adminController.listAnimalTypes);
router.post("/animal-types", validate(animalTypeSchema), adminController.createAnimalType);
router.put("/animal-types/:id", validate(animalTypeSchema.partial()), adminController.updateAnimalType);
router.delete("/animal-types/:id", adminController.deleteAnimalType);

// Service Categories
router.get("/service-categories", adminController.listServiceCategories);
router.post("/service-categories", validate(serviceCategorySchema), adminController.createServiceCategory);
router.put("/service-categories/:id", validate(serviceCategorySchema.partial()), adminController.updateServiceCategory);
router.delete("/service-categories/:id", adminController.deleteServiceCategory);

// Blog
router.get("/blog", adminController.listBlog);
router.post("/blog", validate(blogPostSchema), adminController.createBlog);
router.put("/blog/:id", validate(blogPostSchema.partial()), adminController.updateBlog);
router.delete("/blog/:id", adminController.deleteBlog);

// Sponsorships
router.get("/sponsorships", adminController.listSponsorships);
router.post("/sponsorships", validate(sponsorshipSchema), adminController.createSponsorship);
router.put("/sponsorships/:id", validate(sponsorshipSchema.partial()), adminController.updateSponsorship);
router.delete("/sponsorships/:id", adminController.deleteSponsorship);

// Contact Enquiries
router.get("/contact-enquiries", adminController.listEnquiries);
router.patch("/contact-enquiries/:id", validate(enquiryReplySchema), adminController.replyEnquiry);

// Pet Owners
router.get("/pet-owners", adminController.listPetOwners);
router.patch("/pet-owners/:id/deactivate", adminController.deactivateUser);

// Practices
router.get("/practices", adminController.listPractices);
router.patch("/practices/:id/suspend", adminController.suspendPractice);

// Subscription Plans
router.post("/subscription-plans", validate(subscriptionPlanSchema), adminController.createPlan);
router.put("/subscription-plans/:id", validate(subscriptionPlanSchema.partial()), adminController.updatePlan);
router.delete("/subscription-plans/:id", adminController.deletePlan);

// Featured Listings
router.get("/featured-listings", adminController.listFeatured);

export default router;
```

- [ ] **Step 5: Mount in app.ts and commit**

```typescript
import adminRoutes from "./modules/admin/admin.routes.js";
app.use("/api/admin", adminRoutes);
```

```bash
git add backend/src/modules/admin/ backend/src/app.ts
git commit -m "feat: add admin module with dashboard, approvals, moderation, blog, sponsorship, and management"
```

---

### Task 15: Contact Enquiries Public Endpoint + Analytics Module

**Files:**
- Create: `backend/src/modules/contact/contact.controller.ts`
- Create: `backend/src/modules/contact/contact.routes.ts`
- Create: `backend/src/modules/contact/contact.validation.ts`
- Create: `backend/src/modules/analytics/analytics.service.ts`
- Create: `backend/src/modules/analytics/analytics.controller.ts`
- Create: `backend/src/modules/analytics/analytics.routes.ts`
- Modify: `backend/src/app.ts` — mount both

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `requireRole("VET")`, `apiResponse`
- Produces:
  - POST `/api/contact` — public contact form submission
  - GET `/api/vet/analytics` — vet analytics (views, contacts, monthly)
  - POST `/api/practices/:id/contact-action` — record phone/email/website click

- [ ] **Step 1: Create contact.validation.ts**

```typescript
import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  practiceType: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});
```

- [ ] **Step 2: Create contact.controller.ts and contact.routes.ts**

`backend/src/modules/contact/contact.controller.ts`:

```typescript
import { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { apiResponse } from "../../shared/utils/api-response.js";

export async function submit(req: Request, res: Response) {
  const enquiry = await prisma.contactEnquiry.create({ data: req.body });
  return apiResponse(res, 201, enquiry, "Thank you for your message. We'll be in touch.");
}
```

`backend/src/modules/contact/contact.routes.ts`:

```typescript
import { Router } from "express";
import * as contactController from "./contact.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { contactSchema } from "./contact.validation.js";
import { generalLimiter } from "../../shared/middleware/rate-limiter.js";

const router = Router();

router.post("/", generalLimiter, validate(contactSchema), contactController.submit);

export default router;
```

- [ ] **Step 3: Create analytics.service.ts**

```typescript
import { prisma } from "../../config/database.js";

export async function getVetAnalytics(practiceId: string) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [viewsByMonth, contactsByMonth, totalViews, totalContacts] = await Promise.all([
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', date) as month, COUNT(*)::int as count
      FROM profile_views
      WHERE "practiceId" = ${practiceId} AND date >= ${sixMonthsAgo}
      GROUP BY month ORDER BY month
    ` as Promise<{ month: Date; count: number }[]>,

    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', date) as month, type, COUNT(*)::int as count
      FROM contact_actions
      WHERE "practiceId" = ${practiceId} AND date >= ${sixMonthsAgo}
      GROUP BY month, type ORDER BY month
    ` as Promise<{ month: Date; type: string; count: number }[]>,

    prisma.profileView.count({ where: { practiceId } }),
    prisma.contactAction.count({ where: { practiceId } }),
  ]);

  return {
    profileViews: { total: totalViews, byMonth: viewsByMonth },
    contactActions: { total: totalContacts, byMonth: contactsByMonth },
  };
}

export async function recordContactAction(practiceId: string, type: string) {
  await prisma.contactAction.create({ data: { practiceId, type } });
}
```

- [ ] **Step 4: Create analytics.controller.ts and analytics.routes.ts**

`backend/src/modules/analytics/analytics.controller.ts`:

```typescript
import { Request, Response } from "express";
import * as analyticsService from "./analytics.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import type { AuthRequest } from "../../shared/types/index.js";

export async function getVetAnalytics(req: AuthRequest, res: Response) {
  const { prisma } = await import("../../config/database.js");
  const practice = await prisma.practice.findFirst({ where: { ownerId: req.user!.userId } });
  if (!practice) return apiResponse(res, 404, null, "No practice found");
  return apiResponse(res, 200, await analyticsService.getVetAnalytics(practice.id));
}

export async function recordContactAction(req: Request, res: Response) {
  await analyticsService.recordContactAction(req.params.id, req.body.type);
  return apiResponse(res, 200, null, "Recorded");
}
```

`backend/src/modules/analytics/analytics.routes.ts`:

```typescript
import { Router } from "express";
import * as analyticsController from "./analytics.controller.js";
import { authenticate, requireRole } from "../auth/auth.middleware.js";

const router = Router();

router.get("/vet", authenticate, requireRole("VET"), analyticsController.getVetAnalytics);

export default router;
```

- [ ] **Step 5: Mount in app.ts and commit**

```typescript
import contactRoutes from "./modules/contact/contact.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
app.use("/api/contact", contactRoutes);
app.use("/api/analytics", analyticsRoutes);
```

Also add a contact action endpoint to practices routes. In `practices.routes.ts`, add:

```typescript
router.post("/:id/contact-action", analyticsController.recordContactAction);
```

(Import `analyticsController` at the top of practices.routes.ts)

```bash
git add backend/src/modules/contact/ backend/src/modules/analytics/ backend/src/app.ts
git commit -m "feat: add public contact form and vet analytics module"
```

---

### Task 16: Database Seed

**Files:**
- Create: `backend/prisma/seed.ts`

**Interfaces:**
- Consumes: `prisma`
- Produces: Seed data for development (admin user, subscription plans, animal types, service categories, sample practices)

- [ ] **Step 1: Create prisma/seed.ts**

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@myvet.com" },
    update: {},
    create: {
      email: "admin@myvet.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
    },
  });

  // Create pet owner
  const ownerPassword = await bcrypt.hash("password123", 12);
  const petOwner = await prisma.user.upsert({
    where: { email: "owner@test.com" },
    update: {},
    create: {
      email: "owner@test.com",
      passwordHash: ownerPassword,
      role: "PET_OWNER",
      firstName: "Jane",
      lastName: "Smith",
      phone: "07700 900001",
      address: "123 High Street, London",
      location: "London",
    },
  });

  // Create vet user
  const vetPassword = await bcrypt.hash("password123", 12);
  const vetUser = await prisma.user.upsert({
    where: { email: "vet@test.com" },
    update: {},
    create: {
      email: "vet@test.com",
      passwordHash: vetPassword,
      role: "VET",
      firstName: "Dr. James",
      lastName: "Wilson",
      phone: "07700 900002",
    },
  });

  // Subscription Plans
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan-free" },
    update: {},
    create: {
      id: "plan-free",
      name: "Free",
      price: 0,
      features: ["Basic listing", "Up to 5 photos", "Contact information"],
      analyticsEnabled: false,
      featuredBadge: false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan-professional" },
    update: {},
    create: {
      id: "plan-professional",
      name: "Professional",
      price: 29,
      features: ["Enhanced listing", "Up to 20 photos", "Analytics dashboard", "Priority support"],
      analyticsEnabled: true,
      featuredBadge: false,
    },
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan-premium" },
    update: {},
    create: {
      id: "plan-premium",
      name: "Premium",
      price: 59,
      features: ["Featured listing", "Unlimited photos", "Full analytics", "Featured badge", "Priority placement"],
      analyticsEnabled: true,
      featuredBadge: true,
    },
  });

  // Animal Types
  const animalTypes = ["Dogs", "Cats", "Horses", "Small Animals", "Exotic Pets", "Birds", "Reptiles", "Farm Animals"];
  for (const name of animalTypes) {
    await prisma.animalType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Service Categories
  const serviceCategories = ["Vaccination", "Surgery", "Dental Care", "Emergency Care", "Grooming", "Diagnostics", "Rehabilitation", "Nutrition Counseling"];
  for (const name of serviceCategories) {
    await prisma.serviceCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Sample Practice
  const practice = await prisma.practice.upsert({
    where: { slug: "happy-paws-veterinary-clinic" },
    update: {},
    create: {
      slug: "happy-paws-veterinary-clinic",
      name: "Happy Paws Veterinary Clinic",
      description: "A full-service veterinary clinic providing compassionate care for your beloved pets.",
      veterinaryType: "Small Animal",
      address: "42 Park Lane, London, W1K 1PR",
      phone: "020 7946 0958",
      email: "info@happypaws.vet",
      website: "https://happypaws.vet",
      status: "APPROVED",
      rating: 4.5,
      reviewCount: 3,
      ownerId: vetUser.id,
    },
  });

  // Add services to practice
  await prisma.service.createMany({
    data: [
      { name: "General Consultation", price: 45, practiceId: practice.id },
      { name: "Vaccination", price: 35, practiceId: practice.id },
      { name: "Dental Cleaning", price: 120, practiceId: practice.id },
      { name: "Emergency Care", price: 150, practiceId: practice.id },
    ],
    skipDuplicates: true,
  });

  // Add opening hours
  const days = [0, 1, 2, 3, 4]; // Mon-Fri
  for (const day of days) {
    await prisma.openingHours.upsert({
      where: { practiceId_dayOfWeek: { practiceId: practice.id, dayOfWeek: day } },
      update: {},
      create: { practiceId: practice.id, dayOfWeek: day, openTime: "09:00", closeTime: "18:00" },
    });
  }
  // Saturday
  await prisma.openingHours.upsert({
    where: { practiceId_dayOfWeek: { practiceId: practice.id, dayOfWeek: 5 } },
    update: {},
    create: { practiceId: practice.id, dayOfWeek: 5, openTime: "09:00", closeTime: "13:00" },
  });
  // Sunday closed
  await prisma.openingHours.upsert({
    where: { practiceId_dayOfWeek: { practiceId: practice.id, dayOfWeek: 6 } },
    update: {},
    create: { practiceId: practice.id, dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", closed: true },
  });

  // Add pet to owner
  await prisma.pet.upsert({
    where: { id: "pet-buddy" },
    update: {},
    create: {
      id: "pet-buddy",
      name: "Buddy",
      type: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
      ownerId: petOwner.id,
    },
  });

  // Sample reviews
  await prisma.review.createMany({
    data: [
      { rating: 5, body: "Excellent care for our dog. Dr. Wilson is incredibly thorough and caring.", status: "APPROVED", userId: petOwner.id, practiceId: practice.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete!");
  console.log("Admin: admin@myvet.com / admin123");
  console.log("Pet Owner: owner@test.com / password123");
  console.log("Vet: vet@test.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run the seed**

```bash
cd backend
npm run db:seed
```

Expected: Seed data created with test accounts.

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seed.ts
git commit -m "feat: add database seed with test users, plans, animal types, and sample practice"
```

---

### Task 17: Final App Assembly & Smoke Test

**Files:**
- Modify: `backend/src/app.ts` — verify all routes mounted, add generalLimiter

**Interfaces:**
- Consumes: all modules
- Produces: fully assembled Express app

- [ ] **Step 1: Finalize app.ts with all routes**

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { generalLimiter } from "./shared/middleware/rate-limiter.js";

import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import practicesRoutes from "./modules/practices/practices.routes.js";
import petsRoutes from "./modules/pets/pets.routes.js";
import appointmentsRoutes from "./modules/appointments/appointments.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import vetRoutes from "./modules/vet/vet.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import subscriptionsRoutes from "./modules/subscriptions/subscriptions.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";

export function createApp() {
  const app = express();

  // Global middleware
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(morgan("dev"));
  app.use(cookieParser());

  // Stripe webhook needs raw body — must come before express.json()
  // (Handled within subscriptions routes with express.raw())

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(generalLimiter);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "My Vet API is running" });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/practices", practicesRoutes);
  app.use("/api/pets", petsRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/vet", vetRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/subscriptions", subscriptionsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 2: Smoke test all endpoints**

```bash
cd backend
npm run dev
```

Test these endpoints:

```bash
# Health
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"password123","firstName":"Smoke","lastName":"Test","role":"PET_OWNER"}'

# Login (use returned accessToken for subsequent requests)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"password123"}'

# List practices
curl http://localhost:5000/api/practices

# Get practice by slug
curl http://localhost:5000/api/practices/happy-paws-veterinary-clinic

# Subscription plans
curl http://localhost:5000/api/subscriptions/plans

# Contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","message":"Hello"}'
```

- [ ] **Step 3: Commit final assembly**

```bash
git add backend/src/app.ts
git commit -m "feat: assemble all backend modules and finalize Express app"
```
