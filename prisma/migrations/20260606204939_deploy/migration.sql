/*
  Warnings:

  - Added the required column `activeStage` to the `algorithm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activeStage` to the `algorithm_delta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "algorithm" ADD COLUMN     "activeStage" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "algorithm_delta" ADD COLUMN     "activeStage" TEXT NOT NULL;
