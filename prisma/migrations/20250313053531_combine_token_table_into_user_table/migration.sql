/*
  Warnings:

  - You are about to drop the `Authentication` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Authentication` DROP FOREIGN KEY `Authentication_userId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `token` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Authentication`;

-- CreateIndex
CREATE UNIQUE INDEX `User_token_key` ON `User`(`token`);
