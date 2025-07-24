/*
  Warnings:

  - You are about to drop the column `organizationId` on the `organization_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `organization_memberships` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,organization_id]` on the table `organization_memberships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `organization_memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `organization_memberships` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "auth"."ForwarderModeType" AS ENUM ('CLIENT', 'CARRIER');

-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PermissionType" AS ENUM ('MANAGE_VEHICLES', 'ASSIGN_DRIVERS', 'INVITE_MEMBERS', 'MANAGE_PERMISSIONS', 'VIEW_ANALYTICS');

-- DropForeignKey
ALTER TABLE "public"."organization_memberships" DROP CONSTRAINT "organization_memberships_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."organization_memberships" DROP CONSTRAINT "organization_memberships_userId_fkey";

-- DropIndex
DROP INDEX "public"."organization_memberships_userId_organizationId_key";

-- AlterTable
ALTER TABLE "auth"."users" ADD COLUMN     "forwarder_active_mode" "auth"."ForwarderModeType";

-- AlterTable
ALTER TABLE "public"."organization_memberships" DROP COLUMN "organizationId",
DROP COLUMN "userId",
ADD COLUMN     "organization_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."organizations" ADD COLUMN     "founded_at" TIMESTAMP(3),
ADD COLUMN     "founded_by_user_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."trackable_devices" ADD COLUMN     "created_by_user_id" INTEGER,
ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "public"."organization_invitations" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "invited_by_user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "role" "auth"."UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_join_requests" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "requested_role" "auth"."UserRole" NOT NULL,
    "message" TEXT,
    "status" "public"."JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_user_id" INTEGER,

    CONSTRAINT "organization_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_permissions" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission" "public"."PermissionType" NOT NULL,
    "granted_by_user_id" INTEGER NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_assignments" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "assigned_by_user_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMP(3),
    "unassigned_by_user_id" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "device_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_token_key" ON "public"."organization_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_organization_id_email_key" ON "public"."organization_invitations"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_join_requests_organization_id_user_id_key" ON "public"."organization_join_requests"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_permissions_organization_id_user_id_permission_key" ON "public"."organization_permissions"("organization_id", "user_id", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_user_id_organization_id_key" ON "public"."organization_memberships"("user_id", "organization_id");

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_founded_by_user_id_fkey" FOREIGN KEY ("founded_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_join_requests" ADD CONSTRAINT "organization_join_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_join_requests" ADD CONSTRAINT "organization_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_join_requests" ADD CONSTRAINT "organization_join_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_permissions" ADD CONSTRAINT "organization_permissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_permissions" ADD CONSTRAINT "organization_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_permissions" ADD CONSTRAINT "organization_permissions_granted_by_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trackable_devices" ADD CONSTRAINT "trackable_devices_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_assignments" ADD CONSTRAINT "device_assignments_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."trackable_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_assignments" ADD CONSTRAINT "device_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_assignments" ADD CONSTRAINT "device_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_assignments" ADD CONSTRAINT "device_assignments_unassigned_by_user_id_fkey" FOREIGN KEY ("unassigned_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
