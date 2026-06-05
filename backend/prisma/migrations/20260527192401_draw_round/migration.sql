/*
  Warnings:

  - Added the required column `round` to the `Draw` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Draw" ADD COLUMN     "round" INTEGER NOT NULL;
