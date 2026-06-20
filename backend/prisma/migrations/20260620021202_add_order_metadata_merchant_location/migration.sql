-- Migration: add_order_metadata_merchant_location
-- Adds metadata Json field to Order (used to store delivery item/merchant
-- details), and lat/lng/isOpen fields to Merchant (used by delivery routes
-- for distance calculation and open/closed status).

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- AlterTable Merchant
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "isOpen" BOOLEAN NOT NULL DEFAULT true;
