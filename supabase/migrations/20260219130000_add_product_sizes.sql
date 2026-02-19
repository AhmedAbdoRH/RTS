-- Enable multiple sizes for products
ALTER TABLE services ADD COLUMN IF NOT EXISTS has_multiple_sizes BOOLEAN DEFAULT false;

-- Create product_sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price TEXT, -- سعر التركيب
  sale_price TEXT, -- سعر تخفيض التركيب
  wholesale_price TEXT, -- سعر الجملة
  wholesale_sale_price TEXT, -- سعر تخفيض الجملة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_product_sizes_service_id ON product_sizes(service_id);
