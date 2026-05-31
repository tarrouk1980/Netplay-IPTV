-- Migration: add_wallet_loyalty_reports_backhome
-- Adds walletBalance, loyaltyPoints, subscriptionActive, subscriptionExpiresAt,
-- suspended, avgRating fields to User, plus new models.

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable WalletTransaction
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable LoyaltyTransaction
CREATE TABLE IF NOT EXISTS "LoyaltyTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable Report
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "orderId" TEXT,
    "reasons" TEXT[],
    "details" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable BackHomeRide
CREATE TABLE IF NOT EXISTS "BackHomeRide" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "destLat" DOUBLE PRECISION NOT NULL,
    "destLng" DOUBLE PRECISION NOT NULL,
    "destAddress" TEXT NOT NULL DEFAULT '',
    "seatsTotal" INTEGER NOT NULL DEFAULT 1,
    "seatsLeft" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BackHomeRide_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey WalletTransaction
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey LoyaltyTransaction
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Report (reporter)
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey"
    FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Report (reported)
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedId_fkey"
    FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey BackHomeRide
ALTER TABLE "BackHomeRide" ADD CONSTRAINT "BackHomeRide_driverId_fkey"
    FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
