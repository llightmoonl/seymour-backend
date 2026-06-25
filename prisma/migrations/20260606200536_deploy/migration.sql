/*
  Warnings:

  - A unique constraint covering the columns `[algorithm_propagation_id]` on the table `research` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "research" ADD COLUMN     "algorithm_propagation_id" INTEGER;

-- CreateTable
CREATE TABLE "algorithm_propagation" (
    "id" SERIAL NOT NULL,
    "steps" INTEGER NOT NULL,
    "currentPass" TEXT NOT NULL,

    CONSTRAINT "algorithm_propagation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "shortUrl" TEXT,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_shortUrl_key" ON "users"("shortUrl");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "research_algorithm_propagation_id_key" ON "research"("algorithm_propagation_id");

-- AddForeignKey
ALTER TABLE "research" ADD CONSTRAINT "research_algorithm_propagation_id_fkey" FOREIGN KEY ("algorithm_propagation_id") REFERENCES "algorithm_propagation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
