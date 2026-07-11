-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.support_tickets;

-- Create row-level policies
-- 1. Anyone can submit a ticket
CREATE POLICY "Anyone can insert tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

-- 2. Users can view tickets they submitted if they were logged in
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Administrators can read, update, and delete all tickets
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
