-- Tenant Template (Runs inside t_<hex>)

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- 'root', 'sub_user'
    "iam_policy" JSONB, -- { allowed_features: [], denied_features: [] }
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "cloud_accounts" (
    "id" SERIAL PRIMARY KEY,
    "provider" TEXT NOT NULL, -- 'AWS'
    "account_id" TEXT NOT NULL,
    "role_arn" TEXT NOT NULL,
    "external_id" TEXT,
    "region" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "assets" (
    "id" SERIAL PRIMARY KEY,
    "cloud_account_id" INTEGER REFERENCES "cloud_accounts"("id"),
    "native_id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT NOT NULL, -- 'EC2', 'S3'
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "findings" (
    "id" SERIAL PRIMARY KEY,
    "asset_id" INTEGER REFERENCES "assets"("id"),
    "severity" TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT DEFAULT 'OPEN',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actor_id" TEXT,
    "actor_role" TEXT, -- 'root', 'sub_user'
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
