CREATE SCHEMA IF NOT EXISTS :schema;

SET search_path = :schema, public;

CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
