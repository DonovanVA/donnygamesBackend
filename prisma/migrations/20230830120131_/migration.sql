/*
  Warnings:

  - The primary key for the `PlayerTableOrderInstance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[player_id]` on the table `PlayerTableOrderInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PlayerTableOrderInstance" DROP CONSTRAINT "PlayerTableOrderInstance_pkey",
ADD CONSTRAINT "PlayerTableOrderInstance_pkey" PRIMARY KEY ("player_id", "pokerTable_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTableOrderInstance_player_id_key" ON "PlayerTableOrderInstance"("player_id");
