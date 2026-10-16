ALTER TABLE "Practice" ADD COLUMN "bannerWidth" INTEGER, ADD COLUMN "bannerHeight" INTEGER, ADD COLUMN "bannerObjectFit" TEXT NOT NULL DEFAULT 'cover';
ALTER TABLE "EmergencyHours" ADD COLUMN "inHoursPhone" TEXT, ADD COLUMN "outOfHoursPhone" TEXT;
