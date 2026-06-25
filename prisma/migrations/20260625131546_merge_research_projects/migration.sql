/*
  Warnings:

  - You are about to drop the column `projectId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `researchTab` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `research_id` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `research` table without a default value. This is not possible if the table is not empty.

*/

-- Clear dev data that cannot be migrated
DELETE FROM "activities";
DELETE FROM "research";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_projectId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_userId_fkey";

-- DropForeignKey
ALTER TABLE "researchTab" DROP CONSTRAINT "researchTab_research_id_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "projectId",
ADD COLUMN     "research_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "research" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "projects";

-- DropTable
DROP TABLE "researchTab";

-- CreateIndex
CREATE INDEX "research_user_id_status_idx" ON "research"("user_id", "status");

-- CreateIndex
CREATE INDEX "research_user_id_type_idx" ON "research"("user_id", "type");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research" ADD CONSTRAINT "research_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
