/*
  Warnings:

  - Added the required column `amount` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('DONA', 'KG', 'GRAM', 'LITR', 'ML', 'PORSIYA', 'QUTI', 'BLOK', 'PACHKA', 'TOVA');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "unit" "UnitType" NOT NULL,
ALTER COLUMN "desc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "icon" TEXT;
