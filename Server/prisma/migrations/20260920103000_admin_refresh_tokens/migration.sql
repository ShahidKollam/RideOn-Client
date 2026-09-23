-- CreateTable
CREATE TABLE IF NOT EXISTS "admin_refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "admin_refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_refresh_tokens_token_key" ON "admin_refresh_tokens"("token");
CREATE INDEX IF NOT EXISTS "admin_refresh_tokens_adminId_idx" ON "admin_refresh_tokens"("adminId");
CREATE INDEX IF NOT EXISTS "admin_refresh_tokens_expiresAt_idx" ON "admin_refresh_tokens"("expiresAt");

ALTER TABLE "admin_refresh_tokens"
  DROP CONSTRAINT IF EXISTS "admin_refresh_tokens_adminId_fkey";

ALTER TABLE "admin_refresh_tokens"
  ADD CONSTRAINT "admin_refresh_tokens_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
