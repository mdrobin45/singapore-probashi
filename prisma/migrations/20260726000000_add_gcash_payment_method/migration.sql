-- Adds GCash as a payment method option (deposits, and shared wherever PaymentMethod is used).
ALTER TYPE "PaymentMethod" ADD VALUE 'GCASH';
