/*
  Warnings:

  - The values [COVER] on the enum `Value` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Value_new" AS ENUM ('TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE');
ALTER TABLE "Card" ALTER COLUMN "value" TYPE "Value_new" USING ("value"::text::"Value_new");
ALTER TABLE "DefaultCardDeck" ALTER COLUMN "value" TYPE "Value_new" USING ("value"::text::"Value_new");
ALTER TYPE "Value" RENAME TO "Value_old";
ALTER TYPE "Value_new" RENAME TO "Value";
DROP TYPE "Value_old";
COMMIT;
