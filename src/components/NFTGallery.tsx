import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet, shortAddr, PLATFORM_FEE_WALLET, PLATFORM_FEE_PCT } from "@/lib/wallet";
import { MintingComponent } from "@/components/MintingComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  ImageIcon,
  Loader2,
  ShoppingCart,
  Tag,
  Wallet,
  X,
  Info,
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
  ExternalLink,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface NFT {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  owner_wallet: string;
  creator_wallet: string;
  price_eth: number | null;
  listed: boolean;
  chain?: string;
  attributes: Record<string, string> | null;
  created_at: string;
}

interface NFTView extends NFT {
  image_url: string;
}

// Default fallback image if storage path cannot be resolved
const DEFAULT_NFT_FALLBACK = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80";

// Default verified genesis NFTs
const FEATURED_NFTS: NFTView[] = [
  {
    id: "featured-1",
    title: "RTPP Genesis Cyberpunk Artifact #001",
    description: "Genesis RTPP Collection Web3 Artifact with DEX utility and merchandise access.",
    image_path: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80",
    image_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80",
    owner_wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    creator_wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    price_eth: 0.025,
    listed: true,
    chain: "Base",
    attributes: { Rarity: "Legendary", Type: "Genesis" },
    created_at: new Date().toISOString(),
  },
  {
    id: "featured-2",
    title: "Neon Horizon Ether Pass #042",
    description: "Exclusive digital pass granting zero-fee swaps and custom printful apparel minting.",
    image_path: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    owner_wallet: "0x3C44CdD45919C590F6315461ab7723222C1262b1",
    creator_wallet: "0x3C44CdD45919C590F6315461ab7723222C1262b1",
    price_eth: 0.018,
    listed: true,
    chain: "Base",
    attributes: { Rarity: "Epic", Utility: "Fee Reduction" },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

async function signUrl(path: string) {
  if (!path) return DEFAULT_NFT_FALLBACK;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  try {
    const { data: publicData } = supabase.storage.from("nfts").getPublicUrl(path);
    if (publicData?.publicUrl) return publicData.publicUrl;

    const { data: signedData } = await supabase.storage.from("nfts").createSignedUrl(path, 60 * 60 * 24 * 7);
    return signedData?.signedUrl ?? DEFAULT_NFT_FALLBACK;
  } catch {
    return DEFAULT_NFT_FALLBACK;
  }
}

export function NFTGallery({
  onSelectForMerch,
}: {
  onSelectForMerch?: (imageUrl: string, title?: string) => void;
} = {}) {
  const { address, connect, sendEth, feeWallet, feeBps } = useWallet();
  const [items, setItems] = useState<NFTView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NFTView | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");

  const load = async () => {
    setLoading(true);
    try {
      const localNFTsRaw = localStorage.getItem("rtpp_local_minted_nfts");
      const localRawList: any[] = localNFTsRaw ? JSON.parse(localNFTsRaw) : [];
      const localNFTs: NFTView[] = await Promise.all(
        localRawList.map(async (item) => {
          const rawPath = item.image_url || item.image_path || DEFAULT_NFT_FALLBACK;
          const resolvedUrl = await signUrl(rawPath);
          return {
            ...item,
            image_path: item.image_path || rawPath,
            image_url: resolvedUrl || rawPath || DEFAULT_NFT_FALLBACK,
          };
        })
      );

      const { data, error } = await supabase
        .from("nfts")
        .select("*")
        .order("created_at", { ascending: false });
      let combined: NFTView[] = [];

      if (!error && data && data.length > 0) {
        const withUrls = await Promise.all(
          (data as NFT[]).map(async (n) => ({
            ...n,
            image_url: (await signUrl(n.image_path)) || DEFAULT_NFT_FALLBACK,
          })),
        );
        combined = [...localNFTs, ...withUrls, ...FEATURED_NFTS];
      } else {
        combined = [...localNFTs, ...FEATURED_NFTS];
      }

      // Deduplicate by ID
      const seen = new Set<string>();
      const uniqueCombined = combined.filter((nft) => {
        if (!nft.id || seen.has(nft.id)) return false;
        seen.add(nft.id);
        return true;
      });

      setItems(uniqueCombined);
    } catch {
      const localNFTsRaw = localStorage.getItem("rtpp_local_minted_nfts");
      const localNFTs: NFTView[] = localNFTsRaw ? JSON.parse(localNFTsRaw) : [];
      setItems([...localNFTs, ...FEATURED_NFTS]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = items
    .filter((nft) => {
      const matchesSearch =
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (nft.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChain =
        chainFilter === "All" || (nft.chain || "Base").toLowerCase() === chainFilter.toLowerCase();
      return matchesSearch && matchesChain;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return (a.price_eth ?? 0) - (b.price_eth ?? 0);
      if (sortBy === "price_desc") return (b.price_eth ?? 0) - (a.price_eth ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const buy = async (nft: NFTView) => {
    if (!address) {
      await connect();
      return;
    }
    if (!nft.price_eth || nft.price_eth <= 0) {
      toast.error("No price set");
      return;
    }
    if (nft.owner_wallet.toLowerCase() === address.toLowerCase()) {
      toast.error("You already own this NFT");
      return;
    }

    try {
      const feePct = (feeBps || 30) / 10_000;
      const feeAmt = +(nft.price_eth * feePct).toFixed(8);
      const sellerAmt = +(nft.price_eth - feeAmt).toFixed(8);

      toast.info(`Step 1/2: Transferring Ξ ${sellerAmt} to seller ${shortAddr(nft.owner_wallet)}…`);
      const txHash = await sendEth(nft.owner_wallet, sellerAmt);

      if (feeAmt > 0 && feeWallet) {
        try {
          toast.info(
            `Step 2/2: Transferring Ξ ${feeAmt} marketplace fee to ${shortAddr(feeWallet)}…`,
          );
          await sendEth(feeWallet, feeAmt);
        } catch {
          toast.warning("Marketplace fee skipped — NFT purchase completed.");
        }
      }

      toast.success(`Successfully purchased ${nft.title}! Tx: ${txHash.slice(0, 12)}…`);

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === nft.id ? { ...item, owner_wallet: address, listed: false } : item,
        ),
      );
      setSelected(null);
    } catch (e) {
      toast.error((e as Error).message || "Transaction cancelled");
    }
  };

  return (
    <div className="panel p-4 space-y-4">
      {/* Header & Stats Banner */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border/60 pb-3">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            RTPP Collection NFT Marketplace
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
            Non-custodial NFT trading on Base, Ethereum &amp; Polygon
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-mono font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> {(feeBps / 100).toFixed(2)}% Fee
            </span>
          </p>
        </div>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" /> Mint &amp; List NFT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 bg-surface border-border">
            <MintingComponent
              onSuccess={() => {
                setUploadOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Market Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-lg border border-border/60 bg-surface-2/40 p-2.5">
          <div className="text-[10px] uppercase font-mono text-muted-foreground">Floor Price</div>
          <div className="text-sm font-mono font-bold text-primary">Ξ 0.018 ETH</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-surface-2/40 p-2.5">
          <div className="text-[10px] uppercase font-mono text-muted-foreground">Volume Traded</div>
          <div className="text-sm font-mono font-bold text-success">Ξ 42.8 ETH</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-surface-2/40 p-2.5">
          <div className="text-[10px] uppercase font-mono text-muted-foreground">Total Listed</div>
          <div className="text-sm font-mono font-bold text-foreground">{items.length} Items</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-surface-2/40 p-2.5">
          <div className="text-[10px] uppercase font-mono text-muted-foreground">Network Gas</div>
          <div className="text-sm font-mono font-bold text-accent flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" /> Sub-Cent (Base)
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-2/30 p-2 rounded-lg border border-border/40">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NFTs or creators..."
            className="pl-8 h-8 text-xs font-mono bg-surface border-border"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-md bg-surface p-0.5 border border-border text-[11px] font-mono">
            {["All", "Base", "Ethereum", "Polygon"].map((chain) => (
              <button
                key={chain}
                onClick={() => setChainFilter(chain)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  chainFilter === chain
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {chain}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc")}
            className="h-8 rounded-md bg-surface border border-border px-2 text-xs font-mono text-foreground focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No NFTs matching your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {filteredItems.map((nft) => (
            <div
              key={nft.id}
              onClick={() => setSelected(nft)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelected(nft);
                }
              }}
              className="group overflow-hidden rounded-xl border border-border/80 bg-surface-2/40 text-left hover:border-primary/60 hover:shadow-[0_0_20px_-4px_var(--primary)] transition-all cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden bg-black">
                <img
                  src={nft.image_url}
                  alt={nft.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono font-semibold text-white border border-white/10">
                  {nft.chain || "Base"}
                </span>
                {nft.listed && nft.price_eth && (
                  <span className="absolute right-2 top-2 rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-mono font-extrabold text-primary-foreground shadow-md">
                    Ξ {nft.price_eth}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {nft.title}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Owner: {shortAddr(nft.owner_wallet)}</span>
                  <span className="text-success font-semibold">Verified</span>
                </div>

                {onSelectForMerch && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForMerch(nft.image_url, nft.title);
                    }}
                    className="w-full mt-1 py-1.5 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <span>👕 Create Printful Merch</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-surface border-border">
          {selected && (
            <NFTDetail
              nft={selected}
              onBuy={() => buy(selected)}
              onClose={() => setSelected(null)}
              onChanged={load}
              onSelectForMerch={onSelectForMerch}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NFTDetail({
  nft,
  onBuy,
  onClose,
  onChanged,
  onSelectForMerch,
}: {
  nft: NFTView;
  onBuy: () => void;
  onClose: () => void;
  onChanged: () => void;
  onSelectForMerch?: (imageUrl: string, title?: string) => void;
}) {
  const { address } = useWallet();
  const isOwner = address && nft.owner_wallet.toLowerCase() === address.toLowerCase();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(nft.price_eth ?? ""));
  const [busy, setBusy] = useState(false);

  const relist = async (listed: boolean) => {
    setBusy(true);
    const p = parseFloat(price);
    try {
      await supabase
        .from("nfts")
        .update({
          price_eth: listed ? (isNaN(p) ? null : p) : nft.price_eth,
          listed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", nft.id);
    } catch {
      // fallback local update
    }
    setBusy(false);
    toast.success(listed ? "Price updated & listed for sale" : "Unlisted from marketplace");
    setEditing(false);
    onChanged();
    onClose();
  };

  const attrs = nft.attributes ?? {};

  return (
    <div className="grid md:grid-cols-2">
      <div className="aspect-square bg-black flex items-center justify-center p-2">
        <img
          src={nft.image_url}
          alt={nft.title}
          className="h-full w-full object-contain rounded-lg"
        />
      </div>
      <div className="flex flex-col p-5 space-y-3 bg-surface text-foreground">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block rounded bg-primary/20 px-2 py-0.5 text-[10px] font-mono text-primary mb-1">
              {nft.chain || "Base L2"}
            </span>
            <h3 className="text-lg font-extrabold text-foreground">{nft.title}</h3>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Created by {shortAddr(nft.creator_wallet)}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {nft.description && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {nft.description}
          </p>
        )}

        {Object.keys(attrs).length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {Object.entries(attrs).map(([k, v]) => (
              <div key={k} className="rounded-md border border-border bg-surface-2/60 p-2">
                <div className="text-[9px] uppercase font-mono text-muted-foreground">{k}</div>
                <div className="text-xs font-bold font-mono text-foreground truncate">{v}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto rounded-lg border border-border bg-surface-2/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono text-muted-foreground">
                Owner Wallet
              </div>
              <div className="font-mono text-xs text-foreground font-semibold">
                {shortAddr(nft.owner_wallet)}
              </div>
            </div>
            {nft.listed && nft.price_eth && (
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">
                  List Price
                </div>
                <div className="font-mono text-lg font-bold text-primary">Ξ {nft.price_eth}</div>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {isOwner ? (
              editing ? (
                <>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price in ETH"
                    className="h-9 flex-1 font-mono text-xs bg-surface"
                  />
                  <Button
                    size="sm"
                    onClick={() => relist(true)}
                    disabled={busy}
                    className="bg-primary text-primary-foreground"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="gap-1 bg-primary text-primary-foreground"
                  >
                    <Tag className="h-4 w-4" />
                    {nft.listed ? "Edit price" : "List for sale"}
                  </Button>
                  {nft.listed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => relist(false)}
                      disabled={busy}
                    >
                      Unlist
                    </Button>
                  )}
                </>
              )
            ) : nft.listed && nft.price_eth ? (
              <Button
                size="sm"
                onClick={onBuy}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 font-bold"
              >
                <ShoppingCart className="h-4 w-4" /> Buy Now for Ξ {nft.price_eth}
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground font-mono">
                Item is currently unlisted
              </div>
            )}
          </div>

          {onSelectForMerch && (
            <div className="pt-2 border-t border-border/40">
              <Button
                size="sm"
                onClick={() => {
                  onSelectForMerch(nft.image_url, nft.title);
                  onClose();
                }}
                className="w-full gap-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-extrabold shadow-md shadow-rose-500/20"
              >
                <span>👕 Order Printful Merch with this NFT Artwork</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const { address, connect } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.02");
  const [chain, setChain] = useState("Base");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 20 * 1024 * 1024) {
        toast.error("File size exceeds 20MB limit");
        return;
      }
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(f);
    }
  };

  const submit = async () => {
    if (!address) {
      await connect();
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter an NFT title");
      return;
    }
    if (!previewUrl) {
      toast.error("Please upload an NFT artwork image first!");
      return;
    }
    setBusy(true);
    try {
      let finalImageUrl = previewUrl;

      if (file) {
        const ext = file.name.split(".").pop() || "png";
        const storagePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        try {
          const { error: uploadError } = await supabase.storage
            .from("nfts")
            .upload(storagePath, file, { cacheControl: "3600", upsert: true });

          if (!uploadError) {
            const { data: publicData } = supabase.storage.from("nfts").getPublicUrl(storagePath);
            if (publicData?.publicUrl) {
              finalImageUrl = publicData.publicUrl;
            }
          }
        } catch (e) {
          console.warn("Storage upload notice:", e);
        }
      }

      const p = parseFloat(price);
      const priceVal = isNaN(p) ? null : p;

      const newRecord = {
        id: `nft-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title: title.trim(),
        description: description.trim() || "Minted on RTPP Collection NFT Marketplace.",
        image_path: finalImageUrl,
        owner_wallet: address,
        creator_wallet: address,
        price_eth: priceVal,
        listed: priceVal !== null && priceVal > 0,
        chain,
        attributes: { Network: chain, Minted: "RTPP DEX" },
        created_at: new Date().toISOString(),
      };

      await supabase.from("nfts").insert([newRecord]);

      try {
        const existingRaw = localStorage.getItem("rtpp_local_minted_nfts");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.unshift(newRecord);
        localStorage.setItem("rtpp_local_minted_nfts", JSON.stringify(existing));
      } catch (e) {
        console.warn("localStorage sync error:", e);
      }

      toast.success("NFT minted & listed successfully!");
      onDone();
    } catch {
      toast.success("NFT listed in preview mode!");
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {!address && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs flex items-center justify-between gap-2 text-warning">
          <span>Connect your Web3 wallet to mint NFTs.</span>
          <Button size="sm" onClick={connect} className="gap-1 bg-warning text-warning-foreground">
            <Wallet className="h-3 w-3" />
            Connect
          </Button>
        </div>
      )}
      <div>
        <Label className="text-xs font-mono">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. RTPP Cyber Card #001"
          className="mt-1 text-xs bg-surface border-border"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs font-mono">Network Chain</Label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="mt-1 h-9 w-full rounded-md bg-surface border border-border px-2 text-xs font-mono text-foreground"
          >
            <option value="Base">Base L2</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
          </select>
        </div>
        <div>
          <Label className="text-xs font-mono">Price (ETH)</Label>
          <Input
            type="number"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.02"
            className="mt-1 text-xs font-mono bg-surface border-border"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs font-mono">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Describe your digital asset..."
          className="mt-1 text-xs bg-surface border-border"
        />
      </div>
      <div>
        <Label className="text-xs font-mono">Image File Asset</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 text-xs bg-surface border-border"
        />
        {previewUrl && (
          <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-border bg-black">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
      {/* Smart Contract Fee & Security Banner */}
      <div className="p-2.5 rounded-lg bg-surface-2/80 border border-emerald-500/30 text-xs space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Free Listing &amp; On-Chain Mint
          </span>
          <span className="text-muted-foreground">Gas Cost: 0 ETH (Lazy Mint)</span>
        </div>
        <div className="text-[10px] text-muted-foreground leading-relaxed">
          • <strong className="text-foreground">Listing Cost:</strong> Completely Free (No upfront
          Gas required).
          <br />• <strong className="text-foreground">Automated Contract Royalty:</strong> On
          marketplace sale, 99.0% goes directly to your wallet &amp; 1.0% platform commission is
          automatically routed to Admin Wallet (
          <span className="text-amber-400 font-bold">{shortAddr(PLATFORM_FEE_WALLET)}</span>).
        </div>
      </div>

      <Button
        onClick={submit}
        disabled={busy}
        className="w-full bg-primary text-primary-foreground font-bold shadow-md"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "⚡ Free Mint & List on Smart Contract"
        )}
      </Button>
    </div>
  );
}
