-- Adds a persistent, one-time referral link between a referred user and the
-- agent who referred them (via referral link click -> signup/login), instead
-- of resolving a referral code manually on every purchase.
ALTER TABLE "User" ADD COLUMN "referredByAgentId" TEXT;

ALTER TABLE "User" ADD CONSTRAINT "User_referredByAgentId_fkey"
  FOREIGN KEY ("referredByAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
