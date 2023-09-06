/*
  Warnings:

  - Changed the type of `bettingRound` on the `PokerTable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BettingRound" AS ENUM ('BEGINNING', 'FIRSTFLOP', 'SECONDFLOP', 'THIRDFLOP', 'ENDING');

-- AlterTable
ALTER TABLE "PokerTable" DROP COLUMN "bettingRound",
ADD COLUMN     "bettingRound" "BettingRound" NOT NULL;
