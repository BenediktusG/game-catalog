/*
  Warnings:

  - The primary key for the `Authentication` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `Authentication` table. All the data in the column will be lost.
  - You are about to drop the column `released_at` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Game` table. All the data in the column will be lost.
  - The primary key for the `Library` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `game_id` on the `Library` table. All the data in the column will be lost.
  - You are about to drop the column `purchased_at` on the `Library` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Library` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `game_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Authentication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,gameId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Authentication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releasedAt` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `Library` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasedAt` to the `Library` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Library` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Authentication` DROP FOREIGN KEY `Authentication_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Library` DROP FOREIGN KEY `Library_game_id_fkey`;

-- DropForeignKey
ALTER TABLE `Library` DROP FOREIGN KEY `Library_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_game_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_user_id_fkey`;

-- DropIndex
DROP INDEX `Authentication_user_id_key` ON `Authentication`;

-- DropIndex
DROP INDEX `Library_game_id_fkey` ON `Library`;

-- DropIndex
DROP INDEX `Review_game_id_fkey` ON `Review`;

-- DropIndex
DROP INDEX `Review_user_id_game_id_key` ON `Review`;

-- AlterTable
ALTER TABLE `Authentication` DROP PRIMARY KEY,
    DROP COLUMN `user_id`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`);

-- AlterTable
ALTER TABLE `Game` DROP COLUMN `released_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `releasedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Library` DROP PRIMARY KEY,
    DROP COLUMN `game_id`,
    DROP COLUMN `purchased_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `gameId` VARCHAR(191) NOT NULL,
    ADD COLUMN `purchasedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `gameId`);

-- AlterTable
ALTER TABLE `Review` DROP COLUMN `created_at`,
    DROP COLUMN `game_id`,
    DROP COLUMN `role_id`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL,
    ADD COLUMN `gameId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `fullname`,
    ADD COLUMN `fullName` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Authentication_token_key` ON `Authentication`(`token`);

-- CreateIndex
CREATE UNIQUE INDEX `Review_userId_gameId_key` ON `Review`(`userId`, `gameId`);

-- AddForeignKey
ALTER TABLE `Authentication` ADD CONSTRAINT `Authentication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Library` ADD CONSTRAINT `Library_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Library` ADD CONSTRAINT `Library_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
