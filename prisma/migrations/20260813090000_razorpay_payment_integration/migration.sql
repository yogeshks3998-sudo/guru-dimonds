-- Add Razorpay verification metadata and duplicate payment protection.
ALTER TABLE "Payment" ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
