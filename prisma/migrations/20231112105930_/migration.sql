-- AlterTable
ALTER TABLE `Schedule` MODIFY `state` ENUM('Available', 'Pending', 'Approved', 'Ongoing', 'Completed', 'Declined', 'Rescheduled') NOT NULL DEFAULT 'Available';
