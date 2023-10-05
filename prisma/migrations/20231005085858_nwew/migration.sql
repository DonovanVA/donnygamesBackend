/*
  Warnings:

  - Added the required column `order` to the `SidePot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SidePot" ADD COLUMN     "order" INTEGER NOT NULL;
