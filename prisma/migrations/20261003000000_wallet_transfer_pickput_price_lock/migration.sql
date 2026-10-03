-- CreateEnum
CREATE TYPE "TripDirection" AS ENUM ('SG_TO_BD', 'BD_TO_SG');

-- CreateEnum
CREATE TYPE "PickPutTripStatus" AS ENUM ('PENDING', 'OPEN', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PickPutBookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DELIVERED', 'REJECTED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "PurchaseStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WalletTxType" ADD VALUE 'TRANSFER_SENT';
ALTER TYPE "WalletTxType" ADD VALUE 'TRANSFER_RECEIVED';
ALTER TYPE "WalletTxType" ADD VALUE 'TRANSFER_FEE';
ALTER TYPE "WalletTxType" ADD VALUE 'PICKPUT_PAYMENT';
ALTER TYPE "WalletTxType" ADD VALUE 'PICKPUT_EARNING';

-- AlterTable
ALTER TABLE "ShareBuyRequest" ADD COLUMN     "sgdRate" DECIMAL(10,4);

-- CreateTable
CREATE TABLE "WalletTransfer" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickPutRate" (
    "id" TEXT NOT NULL,
    "direction" "TripDirection",
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "ratePerKg" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickPutRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickPutTrip" (
    "id" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "direction" "TripDirection" NOT NULL,
    "travelDate" DATE NOT NULL,
    "flightInfo" TEXT,
    "totalKg" DECIMAL(6,2) NOT NULL,
    "bookedKg" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "ratePerKg" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "status" "PickPutTripStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickPutTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickPutBooking" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "weightKg" DECIMAL(6,2) NOT NULL,
    "ratePerKg" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "receiverAddress" TEXT,
    "status" "PickPutBookingStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickPutBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletTransfer_senderId_idx" ON "WalletTransfer"("senderId");

-- CreateIndex
CREATE INDEX "WalletTransfer_recipientId_idx" ON "WalletTransfer"("recipientId");

-- CreateIndex
CREATE INDEX "PickPutRate_startDate_endDate_idx" ON "PickPutRate"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "PickPutTrip_status_travelDate_idx" ON "PickPutTrip"("status", "travelDate");

-- CreateIndex
CREATE INDEX "PickPutTrip_travelerId_idx" ON "PickPutTrip"("travelerId");

-- CreateIndex
CREATE INDEX "PickPutBooking_tripId_idx" ON "PickPutBooking"("tripId");

-- CreateIndex
CREATE INDEX "PickPutBooking_customerId_idx" ON "PickPutBooking"("customerId");

-- AddForeignKey
ALTER TABLE "WalletTransfer" ADD CONSTRAINT "WalletTransfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransfer" ADD CONSTRAINT "WalletTransfer_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickPutTrip" ADD CONSTRAINT "PickPutTrip_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickPutBooking" ADD CONSTRAINT "PickPutBooking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "PickPutTrip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickPutBooking" ADD CONSTRAINT "PickPutBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ── Data backfills ───────────────────────────────────────────────────────────

-- ShareOwnership.purchasePrice used to hold the *total* of the first purchase
-- only (and was never updated on later buys), while every page read it as a
-- per-share price. Recompute it as the average BDT actually paid per share
-- across all of the owner's approved primary purchases and secondary trades.
UPDATE "ShareOwnership" o
SET "purchasePrice" = ROUND(paid.total / paid.qty, 2)
FROM (
  SELECT "projectId", "ownerId", SUM(total) AS total, SUM(qty) AS qty
  FROM (
    SELECT "projectId", "buyerId" AS "ownerId", "totalAmount" AS total, "quantity" AS qty
    FROM "SharePurchaseRequest"
    WHERE "status" = 'APPROVED'
    UNION ALL
    SELECT l."projectId", t."buyerId", t."totalAmount", t."quantity"
    FROM "ShareTrade" t
    JOIN "ShareListing" l ON l."id" = t."listingId"
    WHERE t."status" = 'APPROVED'
  ) x
  GROUP BY "projectId", "ownerId"
) paid
WHERE o."projectId" = paid."projectId"
  AND o."ownerId" = paid."ownerId"
  AND paid.qty > 0;

-- Lock existing Share 4 buy requests to the share rate in effect today.
UPDATE "ShareBuyRequest"
SET "sgdRate" = COALESCE(
  (SELECT CASE WHEN "value" ~ '^[0-9]+(\.[0-9]+)?$' THEN "value"::numeric END
   FROM "SiteSetting" WHERE "key" = 'share_sgd_rate'),
  83.5
)
WHERE "sgdRate" IS NULL;
