/*
  Warnings:

  - Added the required column `image_url_back` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url_front` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "image_url_back" TEXT NOT NULL,
ADD COLUMN     "image_url_front" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DefaultCardDeck" (
    "cardDeck_id" SERIAL NOT NULL,
    "faceDown" BOOLEAN NOT NULL DEFAULT true,
    "suit" "Suit" NOT NULL,
    "value" "Value" NOT NULL,
    "color" "Color" NOT NULL,
    "image_url_front" TEXT NOT NULL,
    "image_url_back" TEXT NOT NULL,

    CONSTRAINT "DefaultCardDeck_pkey" PRIMARY KEY ("cardDeck_id")
);
