import { ExternalLink, Github } from "lucide-react";

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  const cls = compact
    ? "inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface-2/40 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:border-primary/50 hover:text-primary transition"
    : "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition";

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <a
        href="https://x.com/readytoprintpat"
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
      >
        <XIcon className="h-3 w-3 text-sky-400" /> @readytoprintpat
      </a>
      <a
        href="https://t.me/rtppcollection"
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
      >
        <TelegramIcon className="h-3 w-3 text-blue-400" /> Telegram
        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
      </a>
      <a
        href="https://opensea.io/Ready_To_Print_Pattern"
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
      >
        <OpenSeaIcon className="h-3 w-3 text-blue-500" /> OpenSea
        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
      </a>
      <a
        href="https://github.com/rtppcollection-stack/RTPP-.git"
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
      >
        <Github className="h-3 w-3 text-foreground" /> GitHub
        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
      </a>
      <a href="https://zora.co/@rtpp" target="_blank" rel="noreferrer noopener" className={cls}>
        <ZoraIcon className="h-3 w-3 text-indigo-400" /> zora/@rtpp
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

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.05-.75 4.12-1.8 6.87-2.98 8.25-3.56 3.93-1.64 4.75-1.93 5.28-1.94.12 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function OpenSeaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm.02 4.17a.64.64 0 0 1 .53.28l.05.08 2.65 4.57 2.12.87a.64.64 0 0 1 .38.77l-.02.08a.65.65 0 0 1-.3.35l-2.02 1.16a.64.64 0 0 1-.65-.02l-2.06-1.33-2.06 1.33a.64.64 0 0 1-.65.02l-2.02-1.16a.65.65 0 0 1-.32-.43l-.01-.08a.64.64 0 0 1 .38-.77l2.12-.87 2.65-4.57a.64.64 0 0 1 .23-.27zm-3.23 6.94 1.83-1.18 1.4 2.42-3.23-1.24zm6.46 0-3.23 1.24 1.4-2.42 1.83 1.18z" />
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
