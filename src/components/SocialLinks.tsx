import { ExternalLink } from "lucide-react";

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  const cls = compact
    ? "inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface-2/40 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:border-primary/50 hover:text-primary transition"
    : "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a
        href="https://x.com/readytoprintpat"
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
      >
        <XIcon className="h-3 w-3" /> @readytoprintpat
      </a>
      <a href="https://zora.co/@rtpp" target="_blank" rel="noreferrer noopener" className={cls}>
        <ZoraIcon className="h-3 w-3" /> zora/@rtpp
        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
      </a>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}
function ZoraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">
        Z
      </text>
    </svg>
  );
}
