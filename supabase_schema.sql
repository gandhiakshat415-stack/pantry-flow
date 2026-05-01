-- ==========================================
-- Enum Definitions
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'member', 'househelp');
CREATE TYPE inventory_status AS ENUM ('full', 'low', 'empty');
CREATE TYPE request_status AS ENUM ('pending', 'in_cart', 'fulfilled');

-- ==========================================
-- Table Definitions
-- ==========================================

-- Table 1: households
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 2: users (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'member',
  name TEXT NOT NULL
);

-- Table 3: inventory
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT,
  is_untrackable BOOLEAN DEFAULT false,
  status inventory_status DEFAULT 'full'
);

-- Table 4: requests
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Row Level Security (RLS) Enablement
-- ==========================================
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- Households Policies
CREATE POLICY "Users can view their own household"
ON public.households
FOR SELECT
USING (id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can create households"
ON public.households
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users Policies
CREATE POLICY "Users can view members of their household"
ON public.users
FOR SELECT
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (id = auth.uid());

-- Inventory Policies
CREATE POLICY "Users can view their household inventory"
ON public.inventory
FOR SELECT
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert inventory in their household"
ON public.inventory
FOR INSERT
WITH CHECK (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update inventory in their household"
ON public.inventory
FOR UPDATE
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete inventory in their household"
ON public.inventory
FOR DELETE
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

-- Requests Policies
CREATE POLICY "Users can view their household requests"
ON public.requests
FOR SELECT
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert requests in their household"
ON public.requests
FOR INSERT
WITH CHECK (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update requests in their household"
ON public.requests
FOR UPDATE
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete requests in their household"
ON public.requests
FOR DELETE
USING (household_id = (SELECT household_id FROM public.users WHERE id = auth.uid()));
