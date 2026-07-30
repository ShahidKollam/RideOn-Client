-- CreateEnum
CREATE TYPE "BikeStatus" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'DISABLED', 'RETIRED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateTable
CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "color" TEXT,
    "imageUrls" TEXT[],
    "currentOdometer" INTEGER NOT NULL DEFAULT 0,
    "status" "BikeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricings" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "includedKm" INTEGER NOT NULL,
    "extraKmRate" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bikeId" TEXT,
    "campusId" TEXT NOT NULL,
    "pickupAt" TIMESTAMP(3) NOT NULL,
    "returnAt" TIMESTAMP(3) NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "includedKm" INTEGER NOT NULL,
    "extraKmRate" DOUBLE PRECISION NOT NULL,
    "pickupOdometer" INTEGER,
    "returnOdometer" INTEGER,
    "actualKm" INTEGER,
    "extraKm" INTEGER,
    "extraKmCharge" DOUBLE PRECISION,
    "lateFee" DOUBLE PRECISION,
    "pickedUpAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bikes_registrationNumber_key" ON "bikes"("registrationNumber");

-- CreateIndex
CREATE INDEX "bikes_campusId_idx" ON "bikes"("campusId");

-- CreateIndex
CREATE INDEX "bikes_status_idx" ON "bikes"("status");

-- CreateIndex
CREATE INDEX "bikes_isActive_idx" ON "bikes"("isActive");

-- CreateIndex
CREATE INDEX "pricings_campusId_idx" ON "pricings"("campusId");

-- CreateIndex
CREATE INDEX "pricings_displayOrder_idx" ON "pricings"("displayOrder");

-- CreateIndex
CREATE INDEX "pricings_isActive_idx" ON "pricings"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingNumber_key" ON "bookings"("bookingNumber");

-- CreateIndex
CREATE INDEX "bookings_bookingNumber_idx" ON "bookings"("bookingNumber");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_bikeId_idx" ON "bookings"("bikeId");

-- CreateIndex
CREATE INDEX "bookings_campusId_idx" ON "bookings"("campusId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_pickupAt_idx" ON "bookings"("pickupAt");

-- CreateIndex
CREATE INDEX "bookings_returnAt_idx" ON "bookings"("returnAt");

-- AddForeignKey
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricings" ADD CONSTRAINT "pricings_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "bikes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
