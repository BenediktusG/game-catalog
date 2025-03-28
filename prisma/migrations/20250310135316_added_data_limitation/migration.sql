/*
  Warnings:

  - You are about to alter the column `name` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `fullname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `Game` MODIFY `name` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `username` VARCHAR(20) NOT NULL,
    MODIFY `fullname` VARCHAR(50) NULL;
