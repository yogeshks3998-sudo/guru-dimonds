ALTER TABLE "Product" ADD COLUMN "supplierReview" JSONB;
-- Rollback (after exporting review data): ALTER TABLE "Product" DROP COLUMN "supplierReview";
