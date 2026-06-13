ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN "referredById" TEXT;
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
