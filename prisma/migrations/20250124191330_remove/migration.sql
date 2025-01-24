/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `District` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");
