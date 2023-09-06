/*
  Warnings:

  - Made the column `playerId` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `isHost` to the `PlayerTableOrderInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activeIndex` to the `PokerTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bettingRound` to the `PokerTable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_playerId_fkey";

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "playerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PlayerTableOrderInstance" ADD COLUMN     "isHost" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "PokerTable" ADD COLUMN     "activeIndex" INTEGER NOT NULL,
ADD COLUMN     "bettingRound" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;
