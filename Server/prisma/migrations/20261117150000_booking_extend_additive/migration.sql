-- Additive extend tracking (safe for staging + production)
-- New columns only; existing rows get defaults. No data rewrite.

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "isExtended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "originalReturnAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "extensionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
