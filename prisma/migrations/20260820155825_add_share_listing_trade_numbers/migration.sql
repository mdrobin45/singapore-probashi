-- AlterTable
ALTER TABLE "ShareListing" ADD COLUMN     "listedShareNumbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "ShareTrade" ADD COLUMN     "tradedShareNumbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
