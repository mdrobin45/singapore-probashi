-- Reminder slot unlocks were recorded as REFUND, so wallets showed them as
-- +৳ credits even though money was deducted. Relabel them as SERVICE_FEE.
-- (Separate migration: a new enum value can't be used in the same
-- transaction that adds it.)
UPDATE "WalletTransaction"
SET "type" = 'SERVICE_FEE'
WHERE "type" = 'REFUND'
  AND "description" LIKE 'Unlocked Reminder Alarm Slot #%';
