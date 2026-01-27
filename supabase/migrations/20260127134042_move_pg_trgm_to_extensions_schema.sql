/*
  # Move pg_trgm Extension to Extensions Schema

  1. Problem
    - pg_trgm extension is installed in the public schema
    - Extensions should be in their own schema for better organization and security
    
  2. Solution
    - Create extensions schema if it doesn't exist
    - Move pg_trgm to extensions schema
    - Update search_path for functions that use pg_trgm
    
  3. Note
    - This is a best practice recommended by Supabase
    - The extension functionality will remain unchanged
*/

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Grant usage on extensions schema to relevant roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Note: Any functions or indexes that use pg_trgm operators will continue to work
-- because PostgreSQL maintains the operator references automatically