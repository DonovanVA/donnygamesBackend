/*
  Warnings:

  - Added the required column `hasBetted` to the `PlayerTableOrderInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerTableOrderInstance" ADD COLUMN     "hasBetted" BOOLEAN NOT NULL;
