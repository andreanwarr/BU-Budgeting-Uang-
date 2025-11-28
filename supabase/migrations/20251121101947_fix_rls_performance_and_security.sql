/*
  # Fix RLS Performance and Security Issues

  ## Performance Optimizations
  1. **Optimize RLS Policies**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation of auth function for each row
     - Significantly improves query performance at scale
  
  2. **Consolidate Permissive Policies**
     - Merge multiple SELECT policies on categories table into single policy
     - Reduces policy evaluation overhead
  
  3. **Remove Unused Indexes**
     - Drop indexes that are not being used by queries
     - Reduces write overhead and storage
  
  ## Security Improvements
  1. **Fix Function Search Path**
     - Set immutable search_path for update_updated_at_column function
     - Prevents potential security vulnerabilities
  
  ## Changes Applied
  - All `auth.uid()` calls wrapped in SELECT subqueries
  - Categories SELECT policies consolidated
  - Unused indexes removed
  - Function search path secured
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view default categories" ON categories;
DROP POLICY IF EXISTS "Users can view own custom categories" ON categories;
DROP POLICY IF EXISTS "Users can create own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Create optimized policies for categories table
-- Consolidated SELECT policy (fixes multiple permissive policies warning)
CREATE POLICY "Users can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (
    is_default = true 
    OR user_id = (select auth.uid())
  );

CREATE POLICY "Users can create own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) 
    AND is_default = false
  );

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Create optimized policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_type;
DROP INDEX IF EXISTS idx_categories_user_id;
DROP INDEX IF EXISTS idx_categories_type;

-- Fix function search path vulnerability
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger if it existed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_categories_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
    CREATE TRIGGER update_categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_transactions_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
    CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
