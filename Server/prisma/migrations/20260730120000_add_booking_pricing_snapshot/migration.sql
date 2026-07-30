-- Store the selected pricing package with every booking so pricing changes do not
-- change the meaning of historical booking totals.
ALTER TABLE "bookings" ADD COLUMN "pricingId" TEXT;

-- Backfill existing bookings with the closest current package in the same campus.
-- New bookings always get their exact selected package from the server.
UPDATE "bookings" AS booking
SET "pricingId" = (
  SELECT "id"
  FROM "pricings"
  WHERE "campusId" = booking."campusId"
    AND "isActive" = true
    AND "price" = booking."baseAmount"
  ORDER BY "durationHours" ASC, "displayOrder" ASC
  LIMIT 1
)
WHERE booking."pricingId" IS NULL;

UPDATE "bookings" AS booking
SET "pricingId" = (
  SELECT "id"
  FROM "pricings"
  WHERE "campusId" = booking."campusId"
    AND "isActive" = true
    AND "durationHours" >= booking."durationHours"
  ORDER BY "durationHours" ASC, "displayOrder" ASC
  LIMIT 1
)
WHERE booking."pricingId" IS NULL;

ALTER TABLE "bookings" ALTER COLUMN "pricingId" SET NOT NULL;

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_pricingId_fkey"
FOREIGN KEY ("pricingId") REFERENCES "pricings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "bookings_pricingId_idx" ON "bookings"("pricingId");
