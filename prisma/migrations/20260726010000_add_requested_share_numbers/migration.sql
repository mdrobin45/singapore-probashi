-- Lets buyers pick the specific admin-created share numbers they want,
-- instead of only a quantity that gets auto-assigned on approval.
ALTER TABLE "SharePurchaseRequest" ADD COLUMN "requestedShareNumbers" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
