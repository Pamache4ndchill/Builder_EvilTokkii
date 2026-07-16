-- Table for song requests
CREATE TABLE IF NOT EXISTS public.song_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    video_id TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'playing', 'played', 'skipped'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Allow public access for all operations (needed for client-side bot/player interactions)
CREATE POLICY "Public can manage song requests" 
    ON public.song_requests 
    FOR ALL 
    USING (true)
    WITH CHECK (true);
