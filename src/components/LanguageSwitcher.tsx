import { useEffect, useState } from "react";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { Check, Globe, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { lang, setLang, info } = useI18n();
  const [search, setSearch] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.currency.toLowerCase().includes(search.toLowerCase()) ||
      l.currencyName.toLowerCase().includes(search.toLowerCase()),
  );

  const displayFlag = hasMounted ? info.flag : "🇺🇸";
  const displayName = hasMounted ? info.name : "English";
  const displayCurrency = hasMounted ? info.currency : "USD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border bg-surface hover:bg-surface-2 transition-colors px-2.5"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline font-medium text-xs" suppressHydrationWarning>
            {displayFlag} {displayName}
          </span>
          <span className="sm:hidden text-xs" suppressHydrationWarning>
            {displayFlag}
          </span>
          <span
            className="hidden md:inline font-mono text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded border border-border/40"
            suppressHydrationWarning
          >
            {displayCurrency}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-surface border-border p-2 shadow-xl z-50">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
          Select Language & Currency / ဘာသာစကား ရွေးချယ်ပါ
        </DropdownMenuLabel>

        <div className="relative my-1 px-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search / ရှာဖွေပါ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-surface-2 pl-8 pr-3 py-1 text-xs focus:border-primary focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <DropdownMenuSeparator className="my-1" />

        <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
          {filteredLanguages.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">No language found</div>
          ) : (
            filteredLanguages.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setSearch("");
                }}
                className={`flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-md cursor-pointer transition-colors ${
                  lang === l.code ? "bg-primary/10 text-primary font-medium" : "hover:bg-surface-2"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{l.flag}</span>
                  <span className="font-sans text-xs">{l.name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded border border-border/50">
                    {l.currency} ({l.currencySymbol})
                  </span>
                  {lang === l.code && <Check className="h-4 w-4 text-primary shrink-0" />}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
