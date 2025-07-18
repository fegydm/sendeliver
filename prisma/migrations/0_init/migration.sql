-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "auth"."OrgMembershipStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "auth"."SelectedRoleType" AS ENUM ('client', 'forwarder', 'carrier');

-- CreateEnum
CREATE TYPE "auth"."UserRole" AS ENUM ('superadmin', 'system_admin', 'org_admin', 'dispatcher', 'driver', 'accountant', 'employee', 'external_worker', 'individual_customer', 'tracker_user');

-- CreateEnum
CREATE TYPE "auth"."UserType" AS ENUM ('ORGANIZED', 'STANDALONE');

-- CreateEnum
CREATE TYPE "public"."DeviceType" AS ENUM ('VEHICLE', 'PERSON', 'ASSET');

-- CreateEnum
CREATE TYPE "public"."OrgType" AS ENUM ('CARRIER', 'FORWARDER', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "display_name" TEXT,
    "image_url" TEXT,
    "role" "auth"."UserRole" NOT NULL DEFAULT 'individual_customer',
    "userType" "auth"."UserType" NOT NULL DEFAULT 'STANDALONE',
    "selected_role" "auth"."SelectedRoleType",
    "organization_id" INTEGER,
    "organization_status" "auth"."OrgMembershipStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "manager_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gps_data" (
    "id" SERIAL NOT NULL,
    "trackable_device_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accuracy" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,

    CONSTRAINT "gps_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vat_number" TEXT,
    "type" "public"."OrgType" NOT NULL,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trackable_devices" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deviceIdentifier" TEXT,
    "deviceType" "public"."DeviceType" NOT NULL,
    "organization_id" INTEGER,
    "owner_id" INTEGER,
    "assigned_to_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trackable_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "auth"."users"("google_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_vat_number_key" ON "public"."organizations"("vat_number" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "trackable_devices_deviceIdentifier_key" ON "public"."trackable_devices"("deviceIdentifier" ASC);

-- AddForeignKey
ALTER TABLE "auth"."users" ADD CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gps_data" ADD CONSTRAINT "gps_data_trackable_device_id_fkey" FOREIGN KEY ("trackable_device_id") REFERENCES "public"."trackable_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trackable_devices" ADD CONSTRAINT "trackable_devices_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trackable_devices" ADD CONSTRAINT "trackable_devices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trackable_devices" ADD CONSTRAINT "trackable_devices_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

