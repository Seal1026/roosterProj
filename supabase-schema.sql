-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  prompt TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  slider_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_processed TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_prompts_email ON prompts(email);

-- Create index on last_processed for scheduler queries
CREATE INDEX IF NOT EXISTS idx_prompts_last_processed ON prompts(last_processed);

-- Create index on is_active for scheduler queries
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to see only their own prompts
CREATE POLICY select_own_prompts ON prompts
  FOR SELECT
  USING (auth.uid()::text = email);

-- Create policy for authenticated users to insert their own prompts
CREATE POLICY insert_own_prompts ON prompts
  FOR INSERT
  WITH CHECK (auth.uid()::text = email);

-- Create policy for authenticated users to update their own prompts
CREATE POLICY update_own_prompts ON prompts
  FOR UPDATE
  USING (auth.uid()::text = email);

-- Create policy for authenticated users to delete their own prompts
CREATE POLICY delete_own_prompts ON prompts
  FOR DELETE
  USING (auth.uid()::text = email);

-- Create policy for service role to access all prompts (for scheduler)
CREATE POLICY service_role_access ON prompts
  FOR ALL
  USING (auth.role() = 'service_role');