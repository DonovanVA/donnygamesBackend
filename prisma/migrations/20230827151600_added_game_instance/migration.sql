-- CreateTable
CREATE TABLE "PlayerTableOrderInstance" (
    "player_id" INTEGER NOT NULL,
    "pokerTable_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerTableOrderInstance_pkey" PRIMARY KEY ("player_id")
);

-- AddForeignKey
ALTER TABLE "PlayerTableOrderInstance" ADD CONSTRAINT "PlayerTableOrderInstance_pokerTable_id_fkey" FOREIGN KEY ("pokerTable_id") REFERENCES "PokerTable"("pokerTable_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTableOrderInstance" ADD CONSTRAINT "PlayerTableOrderInstance_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;
