/*
  # Add extraction columns to knowledge_files table

  1. New Columns
    - `extracted_content` (text) - Stores the extracted text content from uploaded files
    - `extraction_status` (text) - Tracks the status of content extraction ('pending', 'processing', 'completed', 'error')
    - `extraction_error` (text) - Stores any error messages from the extraction process

  2. Changes
    - Add extracted_content column to store file text content directly in database
    - Add extraction_status column with default 'pending' to track processing state
    - Add extraction_error column to store extraction failure messages
    - Add constraint to validate extraction_status values

  3. Security
    - No changes to existing RLS policies (columns inherit existing policies)
*/

-- Add extracted_content column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extracted_content'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extracted_content TEXT;
  END IF;
END $$;

-- Add extraction_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extraction_status'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extraction_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add extraction_error column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extraction_error'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extraction_error TEXT;
  END IF;
END $$;

-- Add constraint for extraction_status values if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'knowledge_files' AND constraint_name = 'knowledge_files_extraction_status_check'
  ) THEN
    ALTER TABLE knowledge_files ADD CONSTRAINT knowledge_files_extraction_status_check 
    CHECK (extraction_status IN ('pending', 'processing', 'completed', 'error'));
  END IF;
END $$;