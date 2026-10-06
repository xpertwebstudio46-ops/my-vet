ALTER TABLE "Notification"
  ADD COLUMN "entityType" TEXT,
  ADD COLUMN "entityId" TEXT,
  ADD COLUMN "statusSnapshot" TEXT;

CREATE INDEX "Notification_userId_entityType_statusSnapshot_createdAt_idx"
  ON "Notification"("userId", "entityType", "statusSnapshot", "createdAt");
