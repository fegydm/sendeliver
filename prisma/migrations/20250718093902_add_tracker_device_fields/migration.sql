/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `trackable_devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiKey` to the `trackable_devices` table without a default value. This is not possible if the table is not empty.
  - Made the column `deviceIdentifier` on table `trackable_devices` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."trackable_devices" ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSeen" TIMESTAMP(3),
ALTER COLUMN "deviceIdentifier" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "trackable_devices_apiKey_key" ON "public"."trackable_devices"("apiKey");
