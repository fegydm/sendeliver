/*
  Warnings:

  - You are about to drop the column `organization_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `organization_status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth"."users" DROP CONSTRAINT "users_organization_id_fkey";

-- AlterTable
ALTER TABLE "auth"."users" DROP COLUMN "organization_id",
DROP COLUMN "organization_status",
DROP COLUMN "role",
ADD COLUMN     "primaryRole" "auth"."UserRole" NOT NULL DEFAULT 'individual_customer';

-- CreateTable
CREATE TABLE "public"."organization_memberships" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "role" "auth"."UserRole" NOT NULL,
    "status" "auth"."OrgMembershipStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_userId_organizationId_key" ON "public"."organization_memberships"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "public"."organization_memberships" ADD CONSTRAINT "organization_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_memberships" ADD CONSTRAINT "organization_memberships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
