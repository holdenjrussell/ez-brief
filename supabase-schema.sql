-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create brand_positioning table
CREATE TABLE IF NOT EXISTS brand_positioning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_brand_id UNIQUE (brand_id)
);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_positioning ENABLE ROW LEVEL SECURITY;

-- Create policies for brands table
-- SELECT policy
CREATE POLICY "Users can select their own brands" ON brands
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert their own brands" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update their own brands" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own brands" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for brand_positioning table
-- SELECT policy
CREATE POLICY "Users can select positioning of brands they own" ON brand_positioning
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_positioning.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- INSERT policy
CREATE POLICY "Users can insert positioning for brands they own" ON brand_positioning
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_positioning.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- UPDATE policy
CREATE POLICY "Users can update positioning of brands they own" ON brand_positioning
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_positioning.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- DELETE policy
CREATE POLICY "Users can delete positioning of brands they own" ON brand_positioning
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_positioning.brand_id
      AND brands.user_id = auth.uid()
    )
  );

/*
Instructions for applying this SQL in the Supabase dashboard:

1. Log in to your Supabase project
2. Navigate to the SQL Editor
3. Create a new query
4. Paste this entire SQL script
5. Click "Run" to execute the script
6. Verify the tables were created in the Table Editor
*/ 