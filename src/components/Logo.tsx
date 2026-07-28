export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0">
        {/* RTPP Collection Logo Circle */}
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#0030d8] via-[#005eff] to-[#00c8ff] p-0.5 shadow-[0_0_15px_rgba(0,102,255,0.6)] ring-1 ring-white/20">
          {/* White Crescent Arc */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-white/90 border-t-transparent border-r-transparent -rotate-45" />

          {/* Internal Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center leading-none">
            <span className="font-extrabold tracking-tight text-black text-[10px] font-sans drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
              RTPP
            </span>
            <span className="text-[6.5px] font-bold text-black tracking-tighter opacity-90 -mt-0.5">
              collection
            </span>
          </div>
        </div>

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
