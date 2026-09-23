-- Booking cancellation + refund fields
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelledByAdminId" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancellationPercentage" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancellationAmount" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "originalCancellationAmount" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundAmount" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundStatus" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundGatewayId" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "adminAdjustedRefundAmount" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "adminAdjustmentReason" TEXT;

-- Cancellation policy on system settings
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "cancellationPolicy" JSONB;
