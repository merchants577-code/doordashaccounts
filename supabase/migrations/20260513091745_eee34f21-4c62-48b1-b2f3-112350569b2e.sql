
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_name TEXT NOT NULL,
  account_no TEXT NOT NULL,
  routing_no TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit"
ON public.submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (true);
