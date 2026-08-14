import { createFileRoute } from "@tanstack/react-router";
import { ThemeProvider, ThemeToggle, useTheme } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { WalletProvider } from "@/lib/wallet";
import { AdminControlPanel } from "@/components/AdminControlPanel";
import { Logo } from "@/components/Logo";
import { WalletButton } from "@/components/WalletButton";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { adminGuard } from "@/lib/adminGuard";

function AppToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} richColors />;
}

function AdminRouteComponent() {
  return (
    <>
      <AdminGatePage />
      <AppToaster />
    </>
  );
}

export const Route = createFileRoute("/admin")({
  beforeLoad: adminGuard,
  head: () => ({
    meta: [
      { title: "RTPP Private Admin Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRouteComponent,
});

function AdminGatePage() {
  return (
    <div className="min-h-screen text-foreground bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_70%)]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-mono rounded-xl">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </Button>
            </a>
            <Logo />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/30 text-[10px] font-mono font-bold text-destructive">
              <ShieldAlert className="h-3.5 w-3.5" /> Admin Route
            </div>
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        <AdminControlPanel />
      </main>
    </div>
  );
}
