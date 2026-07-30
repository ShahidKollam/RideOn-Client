/*
  Warnings:

  - A unique constraint covering the columns `[drivingLicenseNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_drivingLicenseNumber_key" ON "users"("drivingLicenseNumber");
