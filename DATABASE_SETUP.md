# Database Setup Instructions

## Langkah Setup Database Supabase

Aplikasi Finance Tracker membutuhkan database Supabase. Ikuti langkah-langkah berikut:

### 1. Login ke Supabase Dashboard
- Buka [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Login dengan akun Anda

### 2. Akses SQL Editor
- Pilih project Anda
- Klik menu **SQL Editor** di sidebar kiri
- Klik **New Query**

### 3. Jalankan SQL Schema
Salin dan jalankan script SQL berikut di SQL Editor:

```sql
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  is_default boolean DEFAULT false,
  icon text DEFAULT 'circle',
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories table
CREATE POLICY "Users can view default categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_default = true);

CREATE POLICY "Users can view own custom categories"
  ON categories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default income categories
INSERT INTO categories (name, type, is_default, icon) VALUES
  ('Gaji', 'income', true, 'banknote'),
  ('Bonus', 'income', true, 'gift'),
  ('Investasi', 'income', true, 'trending-up'),
  ('Freelance', 'income', true, 'briefcase'),
  ('Lainnya', 'income', true, 'circle-dollar-sign')
ON CONFLICT DO NOTHING;

-- Insert default expense categories
INSERT INTO categories (name, type, is_default, icon) VALUES
  ('Makanan & Minuman', 'expense', true, 'utensils'),
  ('Transportasi', 'expense', true, 'car'),
  ('Tagihan', 'expense', true, 'receipt'),
  ('Belanja', 'expense', true, 'shopping-cart'),
  ('Hiburan', 'expense', true, 'film'),
  ('Kesehatan', 'expense', true, 'heart-pulse'),
  ('Pendidikan', 'expense', true, 'graduation-cap'),
  ('Lainnya', 'expense', true, 'more-horizontal')
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Klik "Run" untuk menjalankan query

### 5. Verifikasi
Setelah berhasil, Anda akan melihat:
- 2 tabel baru: `categories` dan `transactions`
- 13 kategori default (5 pemasukan, 8 pengeluaran)

## Struktur Database

### Tabel: categories
Menyimpan kategori transaksi (default dan custom)
- Default categories tersedia untuk semua user
- User dapat membuat custom categories pribadi

### Tabel: transactions
Menyimpan semua transaksi keuangan
- Setiap transaksi terkait dengan satu kategori
- Support pemasukan dan pengeluaran
- Timestamp otomatis untuk tracking

## Security (RLS)
- Row Level Security (RLS) aktif di semua tabel
- User hanya bisa akses data mereka sendiri
- Default categories dapat diakses semua user
- Custom categories hanya bisa diakses owner-nya

## Troubleshooting

### Error: "relation already exists"
Jika Anda sudah menjalankan script sebelumnya, abaikan error ini. Database sudah ter-setup.

### Error: "permission denied"
Pastikan Anda menjalankan query sebagai owner project di Supabase Dashboard.

### Categories tidak muncul
Pastikan script INSERT berhasil dijalankan. Cek di menu Table Editor > categories.
