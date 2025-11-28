/*
  # COMPLETE DATABASE SETUP - FINAL MERGED MIGRATION
  
  Cara pakai:
  1. Buka https://app.supabase.com
  2. Pilih project: pjfdolykwzqsftgcezoh
  3. Klik "SQL Editor" → "+ New query"
  4. Copy SEMUA script ini
  5. Paste ke SQL Editor
  6. Klik "RUN"
  7. Tunggu 10-15 detik
  8. DONE!
  
  ## Yang Dibuat:
  - 5 Tabel: categories, transactions, kasbon, user_profiles, user_settings
  - Row Level Security (RLS) untuk semua tabel
  - Indexes untuk performa
  - Storage bucket untuk avatars
  - 14 kategori default
*/

-- ============================================================================
-- FUNCTION: Auto-update updated_at timestamps
-- ============================================================================

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

-- ============================================================================
-- TABLE 1: categories
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

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view default categories" ON categories;
DROP POLICY IF EXISTS "Users can view own custom categories" ON categories;
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users can create own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_default = true OR user_id = (select auth.uid()));

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_default ON categories(is_default, type) WHERE is_default = true;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 2: transactions
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

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 3: kasbon
-- ============================================================================

CREATE TABLE IF NOT EXISTS kasbon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  type text NOT NULL CHECK (type IN ('hutang', 'piutang')),
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kasbon ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kasbon" ON kasbon;
DROP POLICY IF EXISTS "Users can insert own kasbon" ON kasbon;
DROP POLICY IF EXISTS "Users can create own kasbon" ON kasbon;
DROP POLICY IF EXISTS "Users can update own kasbon" ON kasbon;
DROP POLICY IF EXISTS "Users can delete own kasbon" ON kasbon;

CREATE POLICY "Users can view own kasbon"
  ON kasbon FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own kasbon"
  ON kasbon FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own kasbon"
  ON kasbon FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own kasbon"
  ON kasbon FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_kasbon_user_status ON kasbon(user_id, status);
CREATE INDEX IF NOT EXISTS idx_kasbon_loan_date ON kasbon(loan_date DESC);

DROP TRIGGER IF EXISTS update_kasbon_updated_at ON kasbon;
CREATE TRIGGER update_kasbon_updated_at
  BEFORE UPDATE ON kasbon
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 4: user_profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 5: user_settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'id',
  currency text NOT NULL DEFAULT 'IDR',
  theme text NOT NULL DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE: avatars bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

CREATE POLICY "Users can view any avatar"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- DEFAULT DATA: Pre-populate default categories
-- ============================================================================

INSERT INTO categories (user_id, name, type, is_default, icon) VALUES
  (NULL, 'Gaji', 'income', true, 'banknote'),
  (NULL, 'Bonus', 'income', true, 'gift'),
  (NULL, 'Investasi', 'income', true, 'trending-up'),
  (NULL, 'Bisnis', 'income', true, 'briefcase'),
  (NULL, 'Lainnya', 'income', true, 'circle'),
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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Setup Complete!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
SELECT COUNT(*) as default_categories FROM categories WHERE is_default = true;
