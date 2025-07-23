/*
  Warnings:

  - You are about to drop the column `primaryRole` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth"."users" DROP COLUMN "primaryRole",
ADD COLUMN     "primary_role" "auth"."UserRole" NOT NULL DEFAULT 'individual_customer';
