import { LANGUAGES, useI18n } from "@/lib/i18n";
import { Check, Globe } from "lucide-react";
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border bg-surface hover:bg-surface-2"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">
            {info.flag} {info.name}
          </span>
          <span className="sm:hidden">{info.flag}</span>
          <span className="hidden md:inline font-mono text-xs text-muted-foreground">
            {info.currency}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-surface border-border">
        <DropdownMenuLabel>Language & Currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{l.flag}</span>
              <span>{l.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{l.currency}</span>
            </span>
            {lang === l.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
