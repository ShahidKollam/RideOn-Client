-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('SIGNED_UP', 'EMAIL_VERIFIED', 'PROFILE_COMPLETED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "drivingLicenseNumber" TEXT,
ADD COLUMN     "hostel" TEXT,
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'SIGNED_UP',
ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "yearOfStudy" INTEGER;
