import { useEffect, useState, useCallback, useMemo } from "react";

export type OrderMode = "BUY" | "SELL";

export interface OrderShortcutItem {
  key: string;
  label: string;
  description: string;
  action: () => void;
}

export interface OrderShortcutsConfig {
  /** Callback triggered when 'B' is pressed for quick BUY mode / order */
  onBuy?: () => void;
  /** Callback triggered when 'S' is pressed for quick SELL mode / order */
  onSell?: () => void;
  /** Callback triggered when 'F' or 'X' is pressed to flip/invert trading pair */
  onFlipTokens?: () => void;
  /** Callback triggered when Ctrl+Enter or Cmd+Enter is pressed to execute order */
  onExecute?: () => void;
  /** Callback triggered when Escape is pressed to cancel/close/clear */
  onCancel?: () => void;
  /** Callback triggered when 'M' is pressed to set Max amount */
  onMax?: () => void;
  /** Callback triggered when 'H' is pressed to set Half amount */
  onHalf?: () => void;
  /** Whether keyboard shortcuts are active (defaults to true) */
  enabled?: boolean;
  /** Whether to ignore character keys (b, s, f, etc.) when an input is focused (defaults to true) */
  ignoreWhenInputFocused?: boolean;
  /** Initial order mode (defaults to "BUY") */
  defaultMode?: OrderMode;
}

export interface UseOrderShortcutsReturn {
  activeMode: OrderMode;
  setActiveMode: (mode: OrderMode) => void;
  shortcuts: OrderShortcutItem[];
  triggerBuy: () => void;
  triggerSell: () => void;
  triggerFlip: () => void;
  triggerExecute: () => void;
}

/**
 * Reusable hook to handle keyboard shortcuts for rapid order execution
 * ('B' for BUY, 'S' for SELL, 'F' for FLIP, 'Ctrl+Enter' for EXECUTE),
 * improving terminal trading efficiency.
 */
export function useOrderShortcuts({
  onBuy,
  onSell,
  onFlipTokens,
  onExecute,
  onCancel,
  onMax,
  onHalf,
  enabled = true,
  ignoreWhenInputFocused = true,
  defaultMode = "BUY",
}: OrderShortcutsConfig = {}): UseOrderShortcutsReturn {
  const [activeMode, setActiveMode] = useState<OrderMode>(defaultMode);

  const triggerBuy = useCallback(() => {
    setActiveMode("BUY");
    onBuy?.();
  }, [onBuy]);

  const triggerSell = useCallback(() => {
    setActiveMode("SELL");
    onSell?.();
  }, [onSell]);

  const triggerFlip = useCallback(() => {
    onFlipTokens?.();
  }, [onFlipTokens]);

  const triggerExecute = useCallback(() => {
    onExecute?.();
  }, [onExecute]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      // Handle Ctrl+Enter or Cmd+Enter for instant execution even inside inputs if desired
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (onExecute) {
          event.preventDefault();
          triggerExecute();
        }
        return;
      }

      // Handle Escape for cancel/clear
      if (event.key === "Escape") {
        if (onCancel) {
          onCancel();
        }
        return;
      }

      // Ignore character shortcuts when user is typing inside an input field
      if (ignoreWhenInputFocused && isInputFocused) {
        return;
      }

      // Do not trigger if any modifier keys (Ctrl, Alt, Meta) are held down
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case "b": // BUY shortcut
          event.preventDefault();
          triggerBuy();
          break;
        case "s": // SELL shortcut
          event.preventDefault();
          triggerSell();
          break;
        case "f": // FLIP tokens shortcut
        case "x":
          if (onFlipTokens) {
            event.preventDefault();
            triggerFlip();
          }
          break;
        case "m": // MAX amount shortcut
          if (onMax) {
            event.preventDefault();
            onMax();
          }
          break;
        case "h": // HALF amount shortcut
          if (onHalf) {
            event.preventDefault();
            onHalf();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    ignoreWhenInputFocused,
    onExecute,
    onCancel,
    onFlipTokens,
    onMax,
    onHalf,
    triggerBuy,
    triggerSell,
    triggerFlip,
    triggerExecute,
  ]);

  const shortcuts: OrderShortcutItem[] = useMemo(
    () => [
      {
        key: "B",
        label: "BUY",
        description: "Switch to BUY Mode",
        action: triggerBuy,
      },
      {
        key: "S",
        label: "SELL",
        description: "Switch to SELL Mode",
        action: triggerSell,
      },
      ...(onFlipTokens
        ? [
            {
              key: "F",
              label: "FLIP",
              description: "Invert Trading Pair",
              action: triggerFlip,
            },
          ]
        : []),
      ...(onExecute
        ? [
            {
              key: "Ctrl+Enter",
              label: "EXECUTE",
              description: "Execute Order Immediately",
              action: triggerExecute,
            },
          ]
        : []),
    ],
    [triggerBuy, triggerSell, triggerFlip, triggerExecute, onFlipTokens, onExecute],
  );

  return {
    activeMode,
    setActiveMode,
    shortcuts,
    triggerBuy,
    triggerSell,
    triggerFlip,
    triggerExecute,
  };
}
