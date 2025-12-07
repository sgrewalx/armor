-- Tenant Schema Template
-- These tables are created in each tenant's schema (t_<hex>)

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- 'root', 'sub_user'
    "iam_policy" JSONB, -- Null for root
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "cloud_accounts" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "role_arn" TEXT NOT NULL,
    "external_id" TEXT,
    "region" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cloud_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cloud_assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cloud_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scans" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scan_results" (
    "id" SERIAL NOT NULL,
    "scan_id" INTEGER NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_results_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "scans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "cloud_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
