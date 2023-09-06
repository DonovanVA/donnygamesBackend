/*
  Warnings:

  - The primary key for the `PlayerTableOrderInstance` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "PlayerTableOrderInstance" DROP CONSTRAINT "PlayerTableOrderInstance_pkey",
ADD CONSTRAINT "PlayerTableOrderInstance_pkey" PRIMARY KEY ("player_id", "pokerTable_id");
