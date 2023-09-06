/*
  Warnings:

  - Added the required column `color` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Color" AS ENUM ('RED', 'BLACK');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "color" "Color" NOT NULL;
