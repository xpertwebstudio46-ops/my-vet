CREATE TYPE "BlogCategory" AS ENUM ('HORSES', 'DOGS', 'CATS', 'EXOTIC', 'POULTRY');

ALTER TABLE "BlogPost"
  ADD COLUMN "category" "BlogCategory";

CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");
