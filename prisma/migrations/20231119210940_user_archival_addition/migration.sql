-- AlterTable
ALTER TABLE `User` MODIFY `approved` ENUM('Pending', 'Unapproved', 'Approved', 'Archived') NOT NULL DEFAULT 'Pending';
