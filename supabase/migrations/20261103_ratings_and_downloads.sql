-- Migration: Document ratings and download counter

-- 1. Add download_count, rating_avg, and rating_count to documents
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0 NOT NULL;

-- 2. Create document_ratings table
CREATE TABLE IF NOT EXISTS document_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_document_rating UNIQUE (document_id, user_id)
);

-- Index for querying document ratings
CREATE INDEX IF NOT EXISTS idx_document_ratings_doc_id ON document_ratings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_ratings_user_id ON document_ratings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE document_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone authenticated to read ratings
CREATE POLICY "Allow authenticated read ratings"
ON document_ratings FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert their own rating
CREATE POLICY "Allow user to rate"
ON document_ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own rating
CREATE POLICY "Allow user to update own rating"
ON document_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own rating
CREATE POLICY "Allow user to delete own rating"
ON document_ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Trigger function to keep rating_avg and rating_count updated on documents
CREATE OR REPLACE FUNCTION update_document_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE documents
    SET 
        rating_count = (SELECT COUNT(*) FROM document_ratings WHERE document_id = COALESCE(NEW.document_id, OLD.document_id)),
        rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM document_ratings WHERE document_id = COALESCE(NEW.document_id, OLD.document_id)), 0.00)
    WHERE id = COALESCE(NEW.document_id, OLD.document_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_document_rating_stats ON document_ratings;
CREATE TRIGGER trg_update_document_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON document_ratings
FOR EACH ROW
EXECUTE FUNCTION update_document_rating_stats();

-- 4. RPC to safely increment download count
CREATE OR REPLACE FUNCTION increment_download_count(doc_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE documents
    SET download_count = download_count + 1
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

