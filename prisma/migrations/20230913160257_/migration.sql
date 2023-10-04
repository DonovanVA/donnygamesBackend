/*
  Warnings:

  - The values [FIRSTFLOP,SECONDFLOP,THIRDFLOP] on the enum `BettingRound` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BettingRound_new" AS ENUM ('BEGINNING', 'FIRSTBETTINGROUND', 'SECONDBETTINGROUND', 'THIRDBETTINGROUND', 'FINALBETTINGROUND', 'ENDING');
ALTER TABLE "PokerTable" ALTER COLUMN "bettingRound" TYPE "BettingRound_new" USING ("bettingRound"::text::"BettingRound_new");
ALTER TYPE "BettingRound" RENAME TO "BettingRound_old";
ALTER TYPE "BettingRound_new" RENAME TO "BettingRound";
DROP TYPE "BettingRound_old";
COMMIT;
