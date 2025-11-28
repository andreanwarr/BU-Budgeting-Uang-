/*
  # Create Kasbon (Loan) Table

  1. New Tables
    - `kasbon`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Nama pemberi/penerima kasbon
      - `amount` (numeric) - Nominal kasbon
      - `loan_date` (date) - Tanggal kasbon
      - `due_date` (date, optional) - Tanggal jatuh tempo
      - `status` (text) - 'unpaid' atau 'paid'
      - `notes` (text, optional) - Catatan tambahan
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `kasbon` table
    - Add policies for authenticated users to manage their own kasbon

  3. Indexes
    - Index on user_id for faster queries
    - Index on loan_date for sorting
    - Index on status for filtering
*/

-- Create kasbon table
CREATE TABLE IF NOT EXISTS kasbon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kasbon_user_id ON kasbon(user_id);
CREATE INDEX IF NOT EXISTS idx_kasbon_loan_date ON kasbon(loan_date DESC);
CREATE INDEX IF NOT EXISTS idx_kasbon_status ON kasbon(status);

-- Enable RLS
ALTER TABLE kasbon ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own kasbon"
  ON kasbon FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kasbon"
  ON kasbon FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kasbon"
  ON kasbon FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own kasbon"
  ON kasbon FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kasbon_updated_at
  BEFORE UPDATE ON kasbon
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
