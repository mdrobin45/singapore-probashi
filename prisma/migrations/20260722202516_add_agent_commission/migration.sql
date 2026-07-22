-- AlterEnum
ALTER TYPE "WalletTxType" ADD VALUE 'COMMISSION';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCode" TEXT;

-- AlterTable
ALTER TABLE "SharePurchaseRequest" ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "AirTicketRequest" ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "TaxiRequest" ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "referredById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "SharePurchaseRequest" ADD CONSTRAINT "SharePurchaseRequest_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirTicketRequest" ADD CONSTRAINT "AirTicketRequest_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxiRequest" ADD CONSTRAINT "TaxiRequest_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

