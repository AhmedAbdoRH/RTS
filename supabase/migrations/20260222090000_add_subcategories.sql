-- Create subcategories table if it doesn't exist
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for everyone" ON subcategories;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON subcategories;

-- Create policies
CREATE POLICY "Enable read access for everyone"
ON subcategories
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable full access for authenticated users"
ON subcategories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
