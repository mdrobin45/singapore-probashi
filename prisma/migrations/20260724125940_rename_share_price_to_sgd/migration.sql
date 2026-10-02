-- Renamed rather than drop+add to preserve existing project prices.
ALTER TABLE "Project" RENAME COLUMN "sharePrice" TO "sharePriceSgd";
