
CREATE TABLE public.nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_path text NOT NULL,
  owner_wallet text NOT NULL,
  creator_wallet text NOT NULL,
  price_eth numeric,
  listed boolean NOT NULL DEFAULT false,
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.nfts TO anon, authenticated;
GRANT ALL ON public.nfts TO service_role;
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nfts read all" ON public.nfts FOR SELECT USING (true);
CREATE POLICY "nfts insert anyone" ON public.nfts FOR INSERT WITH CHECK (true);
CREATE POLICY "nfts update anyone" ON public.nfts FOR UPDATE USING (true);

CREATE TABLE public.nft_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid NOT NULL REFERENCES public.nfts(id) ON DELETE CASCADE,
  from_wallet text NOT NULL,
  to_wallet text NOT NULL,
  price_eth numeric NOT NULL,
  tx_hash text,
  chain text NOT NULL DEFAULT 'ethereum',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.nft_trades TO anon, authenticated;
GRANT ALL ON public.nft_trades TO service_role;
ALTER TABLE public.nft_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trades read all" ON public.nft_trades FOR SELECT USING (true);
CREATE POLICY "trades insert anyone" ON public.nft_trades FOR INSERT WITH CHECK (true);

-- Storage policies for private bucket 'nfts' — public read via signed URLs, but allow anon read too so we can use getPublicUrl-like flow
CREATE POLICY "nft images anyone can read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'nfts');

CREATE POLICY "nft images anyone can insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'nfts');
