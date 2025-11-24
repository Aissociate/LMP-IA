/*
  # Add extracted text column to knowledge files

  1. Changes
    - Add `extracted_text` column to `knowledge_files` table to store document content
    - Add `extraction_status` column to track extraction progress
    - Add index on user_id for faster queries

  2. Notes
    - extracted_text stores the full text content extracted from uploaded documents
    - extraction_status tracks: 'pending', 'completed', 'failed'
    - This enables AI to use document content as context for market analysis
*/

-- Add extracted_text column to store document content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extracted_text'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extracted_text text;
  END IF;
END $$;

-- Add extraction_status column to track extraction progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extraction_status'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extraction_status text DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'completed', 'failed'));
  END IF;
END $$;

-- Add index on user_id for faster queries when retrieving user knowledge base
CREATE INDEX IF NOT EXISTS idx_knowledge_files_user_id ON knowledge_files(user_id);

-- Add index on extraction_status for filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_files_extraction_status ON knowledge_files(extraction_status);
