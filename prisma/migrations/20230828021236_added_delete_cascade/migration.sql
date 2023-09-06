-- DropForeignKey
ALTER TABLE "PlayerTableOrderInstance" DROP CONSTRAINT "PlayerTableOrderInstance_player_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTableOrderInstance" DROP CONSTRAINT "PlayerTableOrderInstance_pokerTable_id_fkey";

-- AddForeignKey
ALTER TABLE "PlayerTableOrderInstance" ADD CONSTRAINT "PlayerTableOrderInstance_pokerTable_id_fkey" FOREIGN KEY ("pokerTable_id") REFERENCES "PokerTable"("pokerTable_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTableOrderInstance" ADD CONSTRAINT "PlayerTableOrderInstance_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;
