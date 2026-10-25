-- Guest fields for admin desk / walk-in bookings (optional; customer bookings leave null)
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guestName" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guestEmail" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guestPhone" TEXT;

CREATE INDEX IF NOT EXISTS "bookings_guestEmail_idx" ON "bookings"("guestEmail");
