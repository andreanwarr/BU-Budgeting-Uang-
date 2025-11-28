# 🚀 PANDUAN SETUP DATABASE - STEP BY STEP

## ✅ Kredensial Supabase Anda (Sudah Dikonfigurasi)

```
URL: https://pjfdolykwzqsftgcezoh.supabase.co
Project ID: pjfdolykwzqsftgcezoh
Status: ✅ Sudah ter-update di file .env
```

---

## 📋 LANGKAH 1: Buka Supabase Dashboard

1. **Buka browser**, pergi ke: https://app.supabase.com
2. **Login** dengan akun Anda
3. **Pilih project:** `pjfdolykwzqsftgcezoh`
   - Atau cari project dengan nama yang Anda buat

---

## 📋 LANGKAH 2: Buka SQL Editor

1. Di **sidebar kiri**, klik menu **"SQL Editor"**
   - Icon seperti `</>` atau tulisan "SQL Editor"
2. Klik tombol **"+ New query"** atau **"New query"**
   - Akan muncul editor kosong untuk menulis SQL

---

## 📋 LANGKAH 3: Copy & Paste Script SQL

### Copy Script dari File:

Buka file: **`SETUP_DATABASE_LENGKAP.sql`** (ada di root project)

**ATAU copy script di bawah ini:**

```sql
-- ============================================================================
-- COMPLETE DATABASE SETUP FOR BUDGETING APP
-- ============================================================================
-- Paste script ini ke Supabase SQL Editor dan RUN
-- ============================================================================

-- Function untuk auto-update timestamp
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

-- TABLE 1: categories
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

DROP POLICY IF EXISTS "Users can view categories" ON categories;
CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_default = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own categories" ON categories;
CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_default = false);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_default ON categories(is_default, type) WHERE is_default = true;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TABLE 2: transactions
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
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TABLE 3: kasbon
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

ALTER TABLE kasbon ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kasbon" ON kasbon;
CREATE POLICY "Users can view own kasbon"
  ON kasbon FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own kasbon" ON kasbon;
CREATE POLICY "Users can create own kasbon"
  ON kasbon FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own kasbon" ON kasbon;
CREATE POLICY "Users can update own kasbon"
  ON kasbon FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own kasbon" ON kasbon;
CREATE POLICY "Users can delete own kasbon"
  ON kasbon FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_kasbon_user_status ON kasbon(user_id, status);

DROP TRIGGER IF EXISTS update_kasbon_updated_at ON kasbon;
CREATE TRIGGER update_kasbon_updated_at
  BEFORE UPDATE ON kasbon
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TABLE 4: user_profiles
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
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
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

-- TABLE 5: user_settings
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
CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
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

-- STORAGE: avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
CREATE POLICY "Users can view any avatar"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DEFAULT DATA: Kategori
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

-- Verification
SELECT 'Setup Complete!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
SELECT COUNT(*) as default_categories FROM categories WHERE is_default = true;
```

---

## 📋 LANGKAH 4: Jalankan Script

1. **Paste script** ke SQL Editor
2. **Klik tombol "RUN"** (pojok kanan bawah)
3. **Tunggu** 10-15 detik
4. **Lihat hasil:**
   - Harus muncul "Success" (warna hijau)
   - Ada tabel verifikasi

---

## 📋 LANGKAH 5: Verifikasi Database

### Cek di Table Editor:

1. Klik **"Table Editor"** di sidebar kiri
2. **Harus ada 5 tabel:**
   - ✅ categories (14 rows)
   - ✅ transactions (0 rows)
   - ✅ kasbon (0 rows)
   - ✅ user_profiles (0 rows)
   - ✅ user_settings (0 rows)

### Cek di Storage:

1. Klik **"Storage"** di sidebar kiri
2. **Harus ada bucket:** `avatars`

---

## 🧪 LANGKAH 6: Test dari Aplikasi

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Register akun baru** atau **Login**

3. **Coba buat transaksi:**
   - Klik "+ Transaksi"
   - Pilih kategori (harus muncul: Gaji, Makanan, dll)
   - Isi nominal: 50000
   - Klik Simpan

4. **Cek di Supabase:**
   - Table Editor → transactions
   - **Harus ada 1 row baru**

**✅ Jika muncul = DATABASE BERHASIL!**

---

## 🐛 Troubleshooting

### Error: "relation already exists"
✅ Aman! Artinya tabel sudah ada.

### Error: "permission denied"
❌ Pastikan Anda owner/admin project

### Aplikasi error: "relation does not exist"
1. Clear browser cache
2. Logout & login lagi
3. Restart dev server

### Kategori tidak muncul
Jalankan query ini di SQL Editor:
```sql
SELECT * FROM categories WHERE is_default = true;
```
Harus ada 14 rows.

---

## ✅ Checklist Setup Complete

- [ ] Supabase credentials sudah di .env ✅
- [ ] SQL script sudah dijalankan
- [ ] 5 tabel ada di Table Editor
- [ ] Bucket avatars ada di Storage
- [ ] Bisa login/register
- [ ] Bisa buat transaksi
- [ ] Transaksi muncul di database

**Semua ✅ = SETUP SELESAI!** 🎉

---

## 📞 Need Help?

Kalau masih ada masalah, kasih tahu:
1. Screenshot error
2. Sudah sampai step mana
3. Error message yang muncul

Saya bantu troubleshoot! 😊
