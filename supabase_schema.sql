-- Schema for News Module in Supabase

-- Create the news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    header_image_url TEXT,
    content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: [{ "type": "text", "content": "..." }, { "type": "image", "url": "..." }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    published BOOLEAN DEFAULT false
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published news
CREATE POLICY "Public can view published news"
    ON public.news
    FOR SELECT
    USING (published = true);

-- Allow authenticated users (e.g. admins) to manage news
CREATE POLICY "Authenticated users can manage news"
    ON public.news
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the update function before each update on the news table
DROP TRIGGER IF EXISTS handle_news_updated_at ON public.news;
CREATE TRIGGER handle_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Note: Ensure that appropriate storage buckets are created if you are uploading images directly to Supabase Storage.
-- e.g., A bucket named 'news-images'
-- INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);
