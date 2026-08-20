ALTER TYPE "UploadPurpose" ADD VALUE 'TEAM_MEMBER';
ALTER TYPE "UploadPurpose" ADD VALUE 'TAXONOMY';

ALTER TABLE "ServiceCategory" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "AnimalType" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "AnimalType" ADD COLUMN "description" TEXT;
