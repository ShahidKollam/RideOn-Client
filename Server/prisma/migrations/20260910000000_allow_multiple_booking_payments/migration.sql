-- Allow an immutable payment history: several payments may belong to one booking.
DROP INDEX "payments_bookingId_key";

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");
