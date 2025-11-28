/*
  # Fix Kasbon Table Schema
  
  1. Changes
    - Add `loan_date` column (date) to store the loan date
    - Remove `type` column as it's not needed based on the UI requirements
    - Update default value for loan_date to CURRENT_DATE
    
  2. Notes
    - This migration fixes the schema mismatch between the database and the application
    - The application expects loan_date but the database has type column instead
    - Uses IF EXISTS/IF NOT EXISTS to ensure idempotent migration
*/

-- Add loan_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kasbon' AND column_name = 'loan_date'
  ) THEN
    ALTER TABLE kasbon ADD COLUMN loan_date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Drop type column if it exists (not used in the application)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kasbon' AND column_name = 'type'
  ) THEN
    ALTER TABLE kasbon DROP COLUMN type;
  END IF;
END $$;

-- Create index on loan_date for better query performance
CREATE INDEX IF NOT EXISTS idx_kasbon_loan_date ON kasbon(loan_date DESC);
