/*
  Warnings:

  - You are about to alter the column `count` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(12,3)`.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UnitType" ADD VALUE 'KUB_METR';
ALTER TYPE "UnitType" ADD VALUE 'KVADRAT_METR';
ALTER TYPE "UnitType" ADD VALUE 'KILOVATT_SOAT';
ALTER TYPE "UnitType" ADD VALUE 'SOAT';
ALTER TYPE "UnitType" ADD VALUE 'KUN';
ALTER TYPE "UnitType" ADD VALUE 'OY';
ALTER TYPE "UnitType" ADD VALUE 'FOIZ';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "total" DECIMAL(14,2),
ALTER COLUMN "count" SET DATA TYPE DECIMAL(12,3);

-- CreateTable
CREATE TABLE "PosTerminal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosTerminal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
