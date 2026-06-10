-- CreateTable
CREATE TABLE "FlightBooking" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "bookingRef"    TEXT NOT NULL,
    "flightId"      TEXT NOT NULL,
    "flightNumber"  TEXT NOT NULL,
    "origin"        TEXT NOT NULL,
    "dest"          TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime"   TEXT NOT NULL,
    "airline"       TEXT NOT NULL,
    "pricePerPax"   DOUBLE PRECISION NOT NULL,
    "totalPrice"    DOUBLE PRECISION NOT NULL,
    "passengers"    TEXT NOT NULL,
    "contactEmail"  TEXT NOT NULL,
    "contactPhone"  TEXT NOT NULL,
    "tripType"      TEXT NOT NULL DEFAULT 'ONE_WAY',
    "status"        TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlightBooking_bookingRef_key" ON "FlightBooking"("bookingRef");

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
