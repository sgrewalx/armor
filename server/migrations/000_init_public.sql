-- Provider Tables (Public Schema)

CREATE TABLE IF NOT EXISTS "provider_admins" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_super_admin" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "tenants" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "hex_id" TEXT UNIQUE NOT NULL,
    "schema_name" TEXT UNIQUE NOT NULL, -- t_<hex_id>
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actor_id" TEXT,
    "actor_type" TEXT, -- 'provider_admin', 'system'
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "revoked_tokens" (
    "jti" TEXT PRIMARY KEY,
    "revoked_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
