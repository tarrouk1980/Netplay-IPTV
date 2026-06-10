-- CreateTable
CREATE TABLE "FlightAlert" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "origin"      TEXT NOT NULL,
    "dest"        TEXT NOT NULL,
    "date"        TEXT NOT NULL,
    "passengers"  INTEGER NOT NULL DEFAULT 1,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "currency"    TEXT NOT NULL DEFAULT 'TND',
    "lastPrice"   DOUBLE PRECISION,
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "triggeredAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightAlert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlightAlert" ADD CONSTRAINT "FlightAlert_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
