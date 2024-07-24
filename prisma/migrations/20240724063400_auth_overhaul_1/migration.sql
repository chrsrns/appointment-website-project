/*
  Warnings:

  - You are about to drop the column `addr` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bdate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cnum` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailaddr` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isOnline` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `login_password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mname` on the `User` table. All the data in the column will be lost.
  - The values [Clinic] on the enum `User_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `User_emailaddr_key` ON `User`;

-- DropIndex
DROP INDEX `User_fname_mname_lname_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `addr`,
    DROP COLUMN `bdate`,
    DROP COLUMN `cnum`,
    DROP COLUMN `emailaddr`,
    DROP COLUMN `isOnline`,
    DROP COLUMN `login_password`,
    DROP COLUMN `mname`,
    MODIFY `type` ENUM('Student', 'Teacher', 'Guidance', 'Admin') NOT NULL;

-- DropTable
DROP TABLE `Otp`;
