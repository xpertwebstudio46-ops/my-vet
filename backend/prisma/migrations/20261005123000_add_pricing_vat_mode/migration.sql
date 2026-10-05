CREATE TYPE "PricingVatMode" AS ENUM ('INC_VAT', 'EX_VAT');

ALTER TABLE "Pricing"
  ADD COLUMN "vatMode" "PricingVatMode" NOT NULL DEFAULT 'INC_VAT';
