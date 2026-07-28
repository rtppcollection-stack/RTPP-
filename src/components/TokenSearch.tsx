import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { searchCoins } from "@/lib/coingecko";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";

interface Props {
  onSelect: (id: string) => void;
}

export function TokenSearch({ onSelect }: Props) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchCoins(q),
    enabled: q.trim().length >= 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = data?.coins?.slice(0, 8) ?? [];

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("search.placeholder")}
          className="pl-9 h-11 bg-surface border-border font-mono text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>
      {open && q.length >= 1 && (
        <div className="absolute z-50 mt-2 w-full panel overflow-hidden">
          {results.length === 0 && !isFetching ? (
            <div className="p-4 text-sm text-muted-foreground text-center">{t("search.empty")}</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelect(c.id);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 transition-colors"
                  >
                    <img src={c.thumb} alt="" className="h-6 w-6 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground uppercase font-mono">
                        {c.symbol}
                      </div>
                    </div>
                    {c.market_cap_rank && (
                      <span className="text-xs text-muted-foreground font-mono">
                        #{c.market_cap_rank}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
