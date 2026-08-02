-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "gstEnabled" BOOLEAN NOT NULL DEFAULT true,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "platformFeeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
