-- Migration: Document ratings and download counter

-- 1. Add download_count, rating_avg, and rating_count to documents
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0 NOT NULL;

-- 2. Create document_ratings table referencing public.users
CREATE TABLE IF NOT EXISTS document_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE OR REPLACE FUNCTION public.increment_download_count(doc_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE documents
    SET download_count = download_count + 1
    WHERE id = doc_id;
END;
$$;

-- Restrict RPC execution to service_role only (prevents unauthorized public increments)
REVOKE EXECUTE ON FUNCTION public.increment_download_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO service_role;
