-- CreateTable
CREATE TABLE "DistrictVendors" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT,
    "city" TEXT,
    "ncesId" TEXT,
    "districtOrgs" TEXT,
    "tpaName" TEXT,
    "nlg" BOOLEAN,
    "midland" BOOLEAN,
    "others403bVendorsNames" TEXT[],
    "others403bVendorsLinks" TEXT[],
    "others457bVendorsNames" TEXT[],
    "others457bVendorsLinks" TEXT[],

    CONSTRAINT "DistrictVendors_pkey" PRIMARY KEY ("id")
);
