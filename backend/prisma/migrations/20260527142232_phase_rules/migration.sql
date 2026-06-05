/*
  Warnings:

  - Added the required column `minLevel` to the `Phase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode` to the `Phase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Phase" ADD COLUMN     "allowOver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxLevel" INTEGER,
ADD COLUMN     "minLevel" INTEGER NOT NULL,
ADD COLUMN     "mode" TEXT NOT NULL;
