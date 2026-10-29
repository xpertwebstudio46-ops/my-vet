CREATE TABLE "CalloutArea" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "postcodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "days" INTEGER[] NOT NULL,
    "standardMin" DECIMAL(10,2) NOT NULL,
    "standardMax" DECIMAL(10,2) NOT NULL,
    "reducedMin" DECIMAL(10,2) NOT NULL,
    "reducedMax" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CalloutArea_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CalloutArea_prices_check" CHECK (
      "standardMin" >= 0 AND "standardMax" >= "standardMin" AND
      "reducedMin" >= 0 AND "reducedMax" >= "reducedMin" AND
      "reducedMin" <= "standardMin" AND "reducedMax" <= "standardMax"
    ),
    CONSTRAINT "CalloutArea_days_check" CHECK (
      cardinality("days") BETWEEN 1 AND 7 AND "days" <@ ARRAY[0,1,2,3,4,5,6]
    )
);
CREATE INDEX "CalloutArea_practiceId_active_idx" ON "CalloutArea"("practiceId", "active");
ALTER TABLE "CalloutArea" ADD CONSTRAINT "CalloutArea_practiceId_fkey"
  FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
