/*
  # Fix Security Issues - Part 1: Foreign Key Indexes

  Add missing indexes for foreign keys to improve query performance.
*/

-- bpus table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'bpus' AND indexname = 'idx_bpus_user_id_fk'
  ) THEN
    CREATE INDEX idx_bpus_user_id_fk ON bpus(user_id);
  END IF;
END $$;

-- knowledge_files table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'knowledge_files' AND indexname = 'idx_knowledge_files_user_id_fk'
  ) THEN
    CREATE INDEX idx_knowledge_files_user_id_fk ON knowledge_files(user_id);
  END IF;
END $$;

-- market_documents table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'market_documents' AND indexname = 'idx_market_documents_market_id_fk'
  ) THEN
    CREATE INDEX idx_market_documents_market_id_fk ON market_documents(market_id);
  END IF;
END $$;

-- memo_sections table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'memo_sections' AND indexname = 'idx_memo_sections_market_id_fk'
  ) THEN
    CREATE INDEX idx_memo_sections_market_id_fk ON memo_sections(market_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'memo_sections' AND indexname = 'idx_memo_sections_memory_id_fk'
  ) THEN
    CREATE INDEX idx_memo_sections_memory_id_fk ON memo_sections(memory_id);
  END IF;
END $$;

-- technical_memories table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'technical_memories' AND indexname = 'idx_technical_memories_market_id_fk'
  ) THEN
    CREATE INDEX idx_technical_memories_market_id_fk ON technical_memories(market_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'technical_memories' AND indexname = 'idx_technical_memories_user_id_fk'
  ) THEN
    CREATE INDEX idx_technical_memories_user_id_fk ON technical_memories(user_id);
  END IF;
END $$;

-- user_subscriptions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_subscriptions' AND indexname = 'idx_user_subscriptions_plan_id_fk'
  ) THEN
    CREATE INDEX idx_user_subscriptions_plan_id_fk ON user_subscriptions(plan_id);
  END IF;
END $$;
