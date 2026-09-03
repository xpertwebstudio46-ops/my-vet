ALTER TYPE "ReviewStatus" ADD VALUE 'DISPUTED';

ALTER TABLE "Review"
ADD COLUMN "disputeReason" TEXT,
ADD COLUMN "disputedAt" TIMESTAMP(3),
ADD COLUMN "disputedById" TEXT;

CREATE INDEX "Review_disputedById_idx" ON "Review"("disputedById");

ALTER TABLE "Review"
ADD CONSTRAINT "Review_disputedById_fkey"
FOREIGN KEY ("disputedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
