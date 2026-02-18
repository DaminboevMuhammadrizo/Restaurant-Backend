/*
  Warnings:

  - Made the column `productId` on table `PopularProducts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `PopularProducts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PopularProducts" DROP CONSTRAINT "PopularProducts_branchId_fkey";

-- DropForeignKey
ALTER TABLE "PopularProducts" DROP CONSTRAINT "PopularProducts_productId_fkey";

-- AlterTable
ALTER TABLE "PopularProducts" ALTER COLUMN "productId" SET NOT NULL,
ALTER COLUMN "branchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PopularProducts" ADD CONSTRAINT "PopularProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularProducts" ADD CONSTRAINT "PopularProducts_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
