-- Allow standalone reviews (e.g. provider profile reviews) not tied to a specific order
ALTER TABLE "Review" ALTER COLUMN "orderId" DROP NOT NULL;
