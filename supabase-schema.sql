-- CloverFit v2 Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Participants table (名前 + PIN認証)
-- ============================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pin_code TEXT NOT NULL CHECK (length(pin_code) = 4),
  email TEXT,
  birth_date DATE,
  company_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Unique constraint on name (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_name ON participants (name);

-- ============================================
-- 2. Instructors table
-- ============================================
CREATE TABLE IF NOT EXISTS instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'instructor' CHECK (role IN ('admin', 'instructor')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- 3. Measurements table
-- ============================================
CREATE TABLE IF NOT EXISTS measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id),
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resting_hr INTEGER NOT NULL,
  max_hr INTEGER NOT NULL,
  recovery_hr INTEGER NOT NULL,
  recovery_amount INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  fatigue INTEGER CHECK (fatigue BETWEEN 1 AND 5),
  concentration INTEGER CHECK (concentration BETWEEN 1 AND 5),
  stress INTEGER CHECK (stress BETWEEN 1 AND 5),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  subjective_score DECIMAL(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_measurements_participant ON measurements (participant_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements (measurement_date DESC);

-- ============================================
-- 4. Feedback table (1:1 with measurement)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  measurement_id UUID NOT NULL UNIQUE REFERENCES measurements(id) ON DELETE CASCADE,
  auto_score_feedback TEXT,
  auto_recovery_feedback TEXT,
  auto_trend_feedback TEXT,
  instructor_good_points TEXT,
  instructor_improvements TEXT,
  next_suggestion TEXT,
  created_by UUID REFERENCES instructors(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_measurement ON feedback (measurement_id);

-- ============================================
-- 5. RLS Policies (public access via anon key for now)
-- ============================================
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (MVP stage)
-- TODO: Tighten policies for production
CREATE POLICY "Allow all for participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for instructors" ON instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for measurements" ON measurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for feedback" ON feedback FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 6. Seed: Create first instructor (Owā)
-- ============================================
-- After running this, create the Supabase Auth user with the same email
-- via Supabase Dashboard > Authentication > Users > Add User
INSERT INTO instructors (name, email, role)
VALUES ('Owā', 'owa@cloverfit.jp', 'admin')
ON CONFLICT (email) DO NOTHING;
