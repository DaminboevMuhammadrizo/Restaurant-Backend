-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "RoomCategory" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "PopularProducts" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "branchId" TEXT,

    CONSTRAINT "PopularProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PopularProducts" ADD CONSTRAINT "PopularProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularProducts" ADD CONSTRAINT "PopularProducts_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
