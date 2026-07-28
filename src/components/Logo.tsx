export function RTPPLogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} shrink-0 drop-shadow-[0_0_12px_rgba(0,80,255,0.6)]`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rtppBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0018FF" />
          <stop offset="50%" stopColor="#0043FE" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>
      </defs>
      {/* Blue Circle Base */}
      <circle cx="100" cy="100" r="96" fill="url(#rtppBlueGrad)" />

      {/* White Crescent Arc on Left */}
      <path d="M 125,8 A 92,92 0 1,0 125,192 A 80,80 0 1,1 125,8 Z" fill="#FFFFFF" />

      {/* Black Text "RTPP" */}
      <text
        x="105"
        y="108"
        fill="#000000"
        fontSize="50"
        fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="-1"
      >
        RTPP
      </text>

      {/* Black Text "collection" */}
      <text
        x="105"
        y="146"
        fill="#000000"
        fontSize="32"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        collection
      </text>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0">
        {/* RTPP Collection Logo Circle SVG */}
        <RTPPLogoMark className="h-10 w-10" />

        {/* Live dot indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background shadow-[0_0_8px_var(--success)] animate-pulse" />
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1">
          <span className="font-mono text-base font-extrabold tracking-wider text-foreground">
            RTPP
          </span>
          <span className="rounded bg-primary/20 px-1 py-0.2 text-[9px] font-bold font-mono text-primary">
            DEX
          </span>
        </div>
        <span className="text-[10px] uppercase font-medium tracking-widest text-primary/90">
          Collection&nbsp;Trading
        </span>
      </div>
    </div>
  );
}
