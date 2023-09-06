-- CreateEnum
CREATE TYPE "Suit" AS ENUM ('HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES');

-- CreateEnum
CREATE TYPE "Value" AS ENUM ('TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE');

-- CreateTable
CREATE TABLE "PokerTable" (
    "pokerTable_id" SERIAL NOT NULL,
    "pot" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokerTable_pkey" PRIMARY KEY ("pokerTable_id")
);

-- CreateTable
CREATE TABLE "Player" (
    "player_id" SERIAL NOT NULL,
    "pokerTable_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cash" INTEGER NOT NULL,
    "bet" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "Card" (
    "card_id" SERIAL NOT NULL,
    "suit" "Suit" NOT NULL,
    "value" "Value" NOT NULL,
    "playerId" INTEGER,
    "pokerTable_id" INTEGER NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("card_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_pokerTable_id_fkey" FOREIGN KEY ("pokerTable_id") REFERENCES "PokerTable"("pokerTable_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("player_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_pokerTable_id_fkey" FOREIGN KEY ("pokerTable_id") REFERENCES "PokerTable"("pokerTable_id") ON DELETE RESTRICT ON UPDATE CASCADE;
