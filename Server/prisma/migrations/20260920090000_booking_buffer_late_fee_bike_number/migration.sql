-- AlterTable: Bike - human-readable bike number
ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "bikeNumber" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "bikes_bikeNumber_key" ON "bikes"("bikeNumber");
CREATE INDEX IF NOT EXISTS "bikes_bikeNumber_idx" ON "bikes"("bikeNumber");

-- AlterTable: SystemSetting - configurable buffer + disruption penalty
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "bookingBufferMinutes" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "disruptionPenalty" DOUBLE PRECISION NOT NULL DEFAULT 150;

-- AlterTable: Booking - late return tracking
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "lateDurationMinutes" INTEGER;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "disruptionPenalty" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "lateFeeApplied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "disruptionPenaltyApplied" BOOLEAN NOT NULL DEFAULT false;
