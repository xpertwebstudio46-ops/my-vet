CREATE TYPE "PracticeMembershipType" AS ENUM ('INDEPENDENT', 'GROUP');

ALTER TABLE "Practice"
  ADD COLUMN "membershipType" "PracticeMembershipType" NOT NULL DEFAULT 'INDEPENDENT',
  ADD COLUMN "branchCount" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "Practice_membershipType_idx" ON "Practice"("membershipType");
