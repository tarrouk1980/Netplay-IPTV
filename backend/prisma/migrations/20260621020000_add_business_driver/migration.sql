-- CreateTable
CREATE TABLE "BusinessDriver" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessDriver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessDriver_businessId_driverId_key" ON "BusinessDriver"("businessId", "driverId");

-- AddForeignKey
ALTER TABLE "BusinessDriver" ADD CONSTRAINT "BusinessDriver_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDriver" ADD CONSTRAINT "BusinessDriver_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
