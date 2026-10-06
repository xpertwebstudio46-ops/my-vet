CREATE TYPE "UserApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "approvalStatus" "UserApprovalStatus" NOT NULL DEFAULT 'APPROVED';

CREATE INDEX "User_role_approvalStatus_createdAt_idx"
  ON "User"("role", "approvalStatus", "createdAt");
