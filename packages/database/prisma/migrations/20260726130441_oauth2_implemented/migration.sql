/*
  Warnings:

  - Added the required column `name` to the `StarterTemplateSchema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StarterTemplateSchema" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT;
