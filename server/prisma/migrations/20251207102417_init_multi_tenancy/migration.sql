/*
  Warnings:

  - You are about to drop the `CloudAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CloudAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Scan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScanResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ScanResult" DROP CONSTRAINT "ScanResult_assetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScanResult" DROP CONSTRAINT "ScanResult_scanId_fkey";

-- DropTable
DROP TABLE "public"."CloudAccount";

-- DropTable
DROP TABLE "public"."CloudAsset";

-- DropTable
DROP TABLE "public"."Scan";

-- DropTable
DROP TABLE "public"."ScanResult";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."provider_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex_id" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."revoked_tokens" (
    "jti" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "iam_policy" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cloud_accounts" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "role_arn" TEXT NOT NULL,
    "external_id" TEXT,
    "region" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cloud_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cloud_assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cloud_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scans" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scan_results" (
    "id" SERIAL NOT NULL,
    "scan_id" INTEGER NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_admins_email_key" ON "public"."provider_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_hex_id_key" ON "public"."tenants"("hex_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_schema_name_key" ON "public"."tenants"("schema_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."scan_results" ADD CONSTRAINT "scan_results_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scan_results" ADD CONSTRAINT "scan_results_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."cloud_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
