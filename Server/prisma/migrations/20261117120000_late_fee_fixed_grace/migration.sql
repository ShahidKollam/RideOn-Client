-- Safe additive migration for fixed late-fee + grace (production-safe)
-- New columns on system_settings only; existing rows get defaults.

ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "lateFeeGraceMinutes" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "lateFeePerHour" DOUBLE PRECISION NOT NULL DEFAULT 79;
