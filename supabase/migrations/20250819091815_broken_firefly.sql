-- PostgreSQL initialization script
-- This file is used by docker-compose to initialize the database

-- Create database if it doesn't exist (PostgreSQL)
-- Note: This is handled by the POSTGRES_DB environment variable in docker-compose

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The actual tables will be created by Prisma migrations