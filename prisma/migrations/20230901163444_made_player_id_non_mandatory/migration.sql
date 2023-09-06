-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_playerId_fkey";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "faceDown" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "playerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("player_id") ON DELETE SET NULL ON UPDATE CASCADE;
