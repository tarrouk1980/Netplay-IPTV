CREATE TABLE "GiftCard" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "balance" DOUBLE PRECISION NOT NULL,
  "purchasedBy" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GiftCard_code_key" UNIQUE ("code"),
  CONSTRAINT "GiftCard_purchasedBy_fkey" FOREIGN KEY ("purchasedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
