/*
  # Fix Security Issues - Part 1: Foreign Key Indexes

  1. Adds Missing Foreign Key Indexes
    - Creates indexes on foreign key columns for improved query performance
    - Tables affected:
      - bpus (user_id)
      - crm_activities (lead_id)
      - crm_deals (lead_id)
      - crm_tasks (lead_id)
      - knowledge_files (user_id)
      - manual_markets_session_progress (donneur_ordre_id)
      - market_documents (market_id)
      - memo_sections (market_id, memory_id)
      - referencing_requests (company_profile_id, user_id)
      - technical_memories (market_id, user_id)
      - user_subscriptions (plan_id)

  2. Security Impact
    - Improves query performance for foreign key lookups
    - Prevents slow queries that could cause DoS conditions
*/

-- Add index for bpus.user_id
CREATE INDEX IF NOT EXISTS idx_bpus_user_id ON public.bpus(user_id);

-- Add index for crm_activities.lead_id
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON public.crm_activities(lead_id);

-- Add index for crm_deals.lead_id
CREATE INDEX IF NOT EXISTS idx_crm_deals_lead_id ON public.crm_deals(lead_id);

-- Add index for crm_tasks.lead_id
CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead_id ON public.crm_tasks(lead_id);

-- Add index for knowledge_files.user_id
CREATE INDEX IF NOT EXISTS idx_knowledge_files_user_id ON public.knowledge_files(user_id);

-- Add index for manual_markets_session_progress.donneur_ordre_id
CREATE INDEX IF NOT EXISTS idx_manual_markets_session_progress_donneur_ordre_id 
ON public.manual_markets_session_progress(donneur_ordre_id);

-- Add index for market_documents.market_id
CREATE INDEX IF NOT EXISTS idx_market_documents_market_id ON public.market_documents(market_id);

-- Add index for memo_sections.market_id
CREATE INDEX IF NOT EXISTS idx_memo_sections_market_id ON public.memo_sections(market_id);

-- Add index for memo_sections.memory_id
CREATE INDEX IF NOT EXISTS idx_memo_sections_memory_id ON public.memo_sections(memory_id);

-- Add index for referencing_requests.company_profile_id
CREATE INDEX IF NOT EXISTS idx_referencing_requests_company_profile_id 
ON public.referencing_requests(company_profile_id);

-- Add index for referencing_requests.user_id
CREATE INDEX IF NOT EXISTS idx_referencing_requests_user_id ON public.referencing_requests(user_id);

-- Add index for technical_memories.market_id
CREATE INDEX IF NOT EXISTS idx_technical_memories_market_id ON public.technical_memories(market_id);

-- Add index for technical_memories.user_id
CREATE INDEX IF NOT EXISTS idx_technical_memories_user_id ON public.technical_memories(user_id);

-- Add index for user_subscriptions.plan_id
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);