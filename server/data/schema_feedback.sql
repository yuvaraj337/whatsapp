-- Migration: Schema for Customer Feedback & Reviews
-- Run this in Supabase SQL Editor if needed.

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  source TEXT DEFAULT 'Direct',
  external_review_id TEXT,
  reviewer_name TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT DEFAULT '',
  review_date TIMESTAMPTZ DEFAULT NOW(),
  project_name TEXT,
  property_code TEXT,
  status TEXT DEFAULT 'NEW',
  is_visible BOOLEAN DEFAULT FALSE,
  source_url TEXT,
  transaction_type TEXT,
  transaction_id TEXT,
  lead_id UUID,
  property_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedback_requests (
  token TEXT PRIMARY KEY,
  lead_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  site_visit_id UUID,
  booking_id UUID,
  property_id UUID,
  project_id UUID,
  project_name TEXT,
  property_code TEXT,
  status TEXT DEFAULT 'SENT', -- SENT, OPENED, SUBMITTED
  rating INTEGER,
  feedback_text TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_requests_token ON public.feedback_requests(token);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_status ON public.feedback_requests(status);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON public.reviews(is_visible);
