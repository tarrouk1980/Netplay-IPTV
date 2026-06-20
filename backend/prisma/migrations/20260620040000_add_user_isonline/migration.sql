-- Add isOnline field used by depanneur/livreur/provider status-toggle endpoints
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isOnline" BOOLEAN NOT NULL DEFAULT false;
