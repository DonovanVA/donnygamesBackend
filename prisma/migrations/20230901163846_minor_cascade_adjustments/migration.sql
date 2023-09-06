-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_pokerTable_id_fkey";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_pokerTable_id_fkey" FOREIGN KEY ("pokerTable_id") REFERENCES "PokerTable"("pokerTable_id") ON DELETE CASCADE ON UPDATE CASCADE;
