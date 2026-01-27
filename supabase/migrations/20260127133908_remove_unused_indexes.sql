/*
  # Remove Unused Indexes

  1. Problem
    - Multiple indexes exist that are not being used by queries
    - These consume storage space and slow down write operations
    
  2. Solution
    - Remove indexes that have not been used
    
  3. Indexes to Remove
    - collectivities: idx_collectivities_department, idx_collectivities_region, idx_collectivities_active
    - referencing_requests: idx_referencing_requests_user_id, idx_referencing_requests_status, idx_referencing_requests_company_profile_id
    - manual_markets_sessions: idx_sessions_status, idx_sessions_started_at
    - manual_markets_session_progress: idx_session_progress_donneur
    - manual_markets_donneurs_ordre: idx_donneurs_ordre_display_order, idx_donneurs_ordre_active
    - manual_markets: idx_manual_markets_reference_client, idx_manual_markets_title_deadline, idx_manual_markets_url
    - bpus: idx_bpus_user_id_fk
    - knowledge_files: idx_knowledge_files_user_id_fk
    - market_documents: idx_market_documents_market_id_fk
    - memo_sections: idx_memo_sections_market_id_fk, idx_memo_sections_memory_id_fk
    - technical_memories: idx_technical_memories_market_id_fk, idx_technical_memories_user_id_fk
    - user_subscriptions: idx_user_subscriptions_plan_id_fk
    
  4. Note
    - Some of these might become useful in the future as usage patterns change
    - They can be recreated if needed
*/

-- Drop collectivities unused indexes
DROP INDEX IF EXISTS public.idx_collectivities_department;
DROP INDEX IF EXISTS public.idx_collectivities_region;
DROP INDEX IF EXISTS public.idx_collectivities_active;

-- Drop referencing_requests unused indexes
DROP INDEX IF EXISTS public.idx_referencing_requests_user_id;
DROP INDEX IF EXISTS public.idx_referencing_requests_status;
DROP INDEX IF EXISTS public.idx_referencing_requests_company_profile_id;

-- Drop manual_markets_sessions unused indexes
DROP INDEX IF EXISTS public.idx_sessions_status;
DROP INDEX IF EXISTS public.idx_sessions_started_at;

-- Drop manual_markets_session_progress unused index
DROP INDEX IF EXISTS public.idx_session_progress_donneur;

-- Drop manual_markets_donneurs_ordre unused indexes
DROP INDEX IF EXISTS public.idx_donneurs_ordre_display_order;
DROP INDEX IF EXISTS public.idx_donneurs_ordre_active;

-- Drop manual_markets unused indexes
DROP INDEX IF EXISTS public.idx_manual_markets_reference_client;
DROP INDEX IF EXISTS public.idx_manual_markets_title_deadline;
DROP INDEX IF EXISTS public.idx_manual_markets_url;

-- Drop bpus unused index
DROP INDEX IF EXISTS public.idx_bpus_user_id_fk;

-- Drop knowledge_files unused index
DROP INDEX IF EXISTS public.idx_knowledge_files_user_id_fk;

-- Drop market_documents unused index
DROP INDEX IF EXISTS public.idx_market_documents_market_id_fk;

-- Drop memo_sections unused indexes
DROP INDEX IF EXISTS public.idx_memo_sections_market_id_fk;
DROP INDEX IF EXISTS public.idx_memo_sections_memory_id_fk;

-- Drop technical_memories unused indexes
DROP INDEX IF EXISTS public.idx_technical_memories_market_id_fk;
DROP INDEX IF EXISTS public.idx_technical_memories_user_id_fk;

-- Drop user_subscriptions unused index
DROP INDEX IF EXISTS public.idx_user_subscriptions_plan_id_fk;