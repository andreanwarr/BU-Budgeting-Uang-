/*
  # Create Core Application Tables

  ## Overview
  This migration creates the foundational database tables required for the
  financial transaction application. It includes proper security with RLS
  and optimized indexes.

  ## Tables Created
  
  1. **categories**
     - Stores transaction categories (both default and user-created)
     - Fields: id, user_id, name, type, is_default, icon, created_at, updated_at
     - Supports both income and expense categories
  
  2. **transactions**
     - Stores all financial transactions
     - Fields: id, user_id, amount, type, category_id, title, description, 
              transaction_date, created_at, updated_at
     - Links to categories table
  
  3. **kasbon**
     - Stores loan/debt records
     - Fields: id, user_id, name, amount, type, status, due_date, notes,
              created_at, updated_at

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Default categories are viewable by all authenticated users
  - Optimized RLS policies using (select auth.uid()) pattern

  ## Performance
  - Essential indexes on foreign keys and frequently queried columns
  - Automatic updated_at timestamp triggers
*/

-- ============================================================================
-- TABLE: categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  is_default boolean NOT NULL DEFAULT false,
  icon text NOT NULL DEFAULT 'circle',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_default ON categories(is_default, type) WHERE is_default = true;

-- ============================================================================
-- TABLE: transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- ============================================================================
-- TABLE: kasbon (Loans/Debts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kasbon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  type text NOT NULL CHECK (type IN ('hutang', 'piutang')),
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE kasbon ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kasbon
CREATE POLICY "Users can view own kasbon"
  ON kasbon
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own kasbon"
  ON kasbon
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own kasbon"
  ON kasbon
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own kasbon"
  ON kasbon
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_kasbon_user_status ON kasbon(user_id, status);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================================

-- Function to update updated_at column (secured)
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

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kasbon_updated_at
  BEFORE UPDATE ON kasbon
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA: Pre-populate default categories
-- ============================================================================

INSERT INTO categories (user_id, name, type, is_default, icon) VALUES
  -- Income Categories
  (NULL, 'Gaji', 'income', true, 'banknote'),
  (NULL, 'Bonus', 'income', true, 'gift'),
  (NULL, 'Investasi', 'income', true, 'trending-up'),
  (NULL, 'Bisnis', 'income', true, 'briefcase'),
  (NULL, 'Lainnya', 'income', true, 'circle'),
  
  -- Expense Categories
  (NULL, 'Makanan', 'expense', true, 'utensils'),
  (NULL, 'Transport', 'expense', true, 'car'),
  (NULL, 'Belanja', 'expense', true, 'shopping-bag'),
  (NULL, 'Tagihan', 'expense', true, 'home'),
  (NULL, 'Hiburan', 'expense', true, 'music'),
  (NULL, 'Kesehatan', 'expense', true, 'heart'),
  (NULL, 'Pendidikan', 'expense', true, 'book'),
  (NULL, 'Olahraga', 'expense', true, 'dumbbell'),
  (NULL, 'Lainnya', 'expense', true, 'circle')
ON CONFLICT DO NOTHING;
