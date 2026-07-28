import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "rtpp_theme_mode_v1";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-8 gap-1.5 px-2.5 font-mono text-xs border-border bg-surface hover:bg-surface-2 transition-colors text-foreground"
      title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Terminal"}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Dark Terminal</span>
        </>
      )}
    </Button>
  );
}
