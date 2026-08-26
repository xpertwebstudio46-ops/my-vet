ALTER TABLE "SubscriptionPlan"
ADD COLUMN "stripeProductId" TEXT;

CREATE UNIQUE INDEX "SubscriptionPlan_stripeProductId_key"
ON "SubscriptionPlan"("stripeProductId");
