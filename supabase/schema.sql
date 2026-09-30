-- ==============================================================================
-- SakuTrack — Supabase Database Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  campus TEXT,
  currency_code TEXT DEFAULT 'IDR',
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_logged_date DATE DEFAULT CURRENT_DATE,
  is_public BOOLEAN DEFAULT TRUE,
  theme_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Allowance Cycles Table
CREATE TABLE IF NOT EXISTS public.allowance_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'biweekly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL for system categories
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.allowance_cycles(id) ON DELETE SET NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  note TEXT,
  is_impulse BOOLEAN DEFAULT FALSE,
  spent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) DEFAULT 0,
  target_date DATE,
  icon TEXT DEFAULT 'trophy',
  color TEXT DEFAULT '#4EA8DE',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Dashboard Layouts Table
CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  slot_size TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Enablement
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
-- Anyone (including anon) can view public profiles for social sharing
CREATE POLICY "Public profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (is_public = TRUE OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Allowance Cycles Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can manage their own allowance cycles"
  ON public.allowance_cycles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Categories Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Everyone can view categories"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their custom categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Expenses Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can manage their own expenses"
  ON public.expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Savings Goals Policies
-- ------------------------------------------------------------------------------
-- Public goals can be read by anyone if profile is public
CREATE POLICY "Public savings goals are readable by everyone"
  ON public.savings_goals FOR SELECT
  USING (
    auth.uid() = user_id OR
    (is_public = TRUE AND EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.id = savings_goals.user_id AND profiles.is_public = TRUE
    ))
  );

CREATE POLICY "Users can manage their own savings goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Dashboard Layouts Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can manage their own dashboard layouts"
  ON public.dashboard_layouts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
