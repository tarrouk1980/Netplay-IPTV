-- Migration: easyservices_replace_backhome
-- Removes the BackHomeRide covoiturage feature (not legally compliant as a
-- paid ride-share) and replaces it with EasyServices: bookable home/
-- professional services (plombier, électricien, médecin, avocat, etc.)
-- handled by a new PRESTATAIRE role through the existing Order model.

-- Drop BackHomeRide feature
DROP TABLE IF EXISTS "BackHomeRide";

-- Add new enum values
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PRESTATAIRE';
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'HOME_SERVICE';

-- AlterTable User: profession/category for PRESTATAIRE accounts
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "serviceCategory" TEXT;
