-- CreateTable
CREATE TABLE "SidePot" (
    "pokerTable_id" INTEGER NOT NULL,
    "player_id" INTEGER[],
    "amount" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SidePot_pokerTable_id_key" ON "SidePot"("pokerTable_id");

-- AddForeignKey
ALTER TABLE "SidePot" ADD CONSTRAINT "SidePot_pokerTable_id_fkey" FOREIGN KEY ("pokerTable_id") REFERENCES "PokerTable"("pokerTable_id") ON DELETE CASCADE ON UPDATE CASCADE;
