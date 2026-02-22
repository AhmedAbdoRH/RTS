-- Add subcategory_id column to services table
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE services ADD COLUMN subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON services(subcategory_id);
