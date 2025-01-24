/*
  Warnings:

  - You are about to drop the `DistrictVendors` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('TPA', 'B403', 'B457', 'NLG', 'MIDLAND', 'OTHER');

-- DropTable
DROP TABLE "DistrictVendors";

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "county" TEXT,
    "city" TEXT,
    "ncesId" TEXT,
    "tpaName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "type" "VendorType",
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "districtId" INTEGER NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Carrier" ADD CONSTRAINT "Carrier_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
