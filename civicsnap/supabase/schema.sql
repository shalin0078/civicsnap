-- CivicSnap Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Profiles Table (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'authority', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Under Review', 'In Progress', 'Resolved')),
    photo_url TEXT,
    user_id TEXT DEFAULT NULL,
    author_name TEXT DEFAULT 'Citizen',
    is_guest BOOLEAN NOT NULL DEFAULT false,
    guest_name TEXT,
    guest_contact TEXT,
    upvotes INTEGER NOT NULL DEFAULT 1,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints (category);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 4. Complaints RLS Policies
-- Allow anyone (authenticated and guest) to view complaints
DROP POLICY IF EXISTS "Public complaints are viewable by everyone" ON public.complaints;
CREATE POLICY "Public complaints are viewable by everyone" 
ON public.complaints FOR SELECT 
USING (true);

-- Allow anyone (authenticated and guest) to insert complaints
DROP POLICY IF EXISTS "Anyone can report a complaint" ON public.complaints;
CREATE POLICY "Anyone can report a complaint" 
ON public.complaints FOR INSERT 
WITH CHECK (true);

-- Allow updates to complaints (for status changes, upvotes, and resolution notes)
DROP POLICY IF EXISTS "Allow status updates on complaints" ON public.complaints;
CREATE POLICY "Allow status updates on complaints" 
ON public.complaints FOR UPDATE 
USING (true);

-- 5. Profiles RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- 6. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- 7. Seed Initial Demo Authority and Citizen Profiles
INSERT INTO public.profiles (email, username, role)
VALUES 
    ('admin@civicsnap.com', 'Municipal Admin', 'authority'),
    ('user@civicsnap.com', 'John Citizen', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- 8. Seed Initial Complaints
INSERT INTO public.complaints (title, category, description, location, priority, status, author_name, upvotes)
VALUES 
    (
        'Overflowing Garbage Bin', 
        'Garbage & Waste Dumps', 
        'The garbage bin near the central park entrance has been overflowing for 3 days. It causes an unbearable odor and attracts stray animals.',
        'Central Park East Gate',
        'High',
        'Reported',
        'John Citizen',
        14
    ),
    (
        'Deep Pothole on Main Arterial Road',
        'Potholes',
        'A large pothole has formed after the monsoon rains. Two vehicles sustained wheel damage this morning.',
        'Green Avenue cross section near Metro Pillar 42',
        'Emergency',
        'In Progress',
        'Commuter Daily',
        27
    ),
    (
        'Faulty Streetlight Pole',
        'Streetlight Problems',
        'Streetlight pole #14 has been flickering and completely off at night for the past week, creating an unsafe dark stretch.',
        'Sector 9 North Promenade',
        'Medium',
        'Under Review',
        'Neighborhood Watch',
        8
    ),
    (
        'Broken Water Main Pipe',
        'Water Supply & Pipeline Leakage',
        'Clean water is gushing out of a broken supply valve onto the road.',
        '4th Cross Road, Industrial Area',
        'High',
        'Resolved',
        'Local Resident',
        19
    )
ON CONFLICT DO NOTHING;

