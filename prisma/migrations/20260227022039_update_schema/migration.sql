/*
  Warnings:

  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `price` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Kitchen" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "salary" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "CostsCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Costs" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costAmount" DECIMAL(12,2),
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "branchId" TEXT NOT NULL,
    "costsCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Costs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CostsCategory" ADD CONSTRAINT "CostsCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Costs" ADD CONSTRAINT "Costs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Costs" ADD CONSTRAINT "Costs_costsCategoryId_fkey" FOREIGN KEY ("costsCategoryId") REFERENCES "CostsCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
