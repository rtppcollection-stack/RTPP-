import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Eth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eth;
  }
}

interface WalletCtx {
  address: string | null;
  chainId: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendEth: (to: string, ethAmount: number) => Promise<string>;
  switchToBase: () => Promise<void>;
  switchChain: (
    chainIdHex: string,
    addParams?: {
      chainName: string;
      rpcUrls: string[];
      blockExplorerUrls: string[];
      nativeCurrency: { name: string; symbol: string; decimals: number };
    },
  ) => Promise<void>;
  hasProvider: boolean;
  mounted: boolean;
  feeWallet: string;
  setFeeWallet: (addr: string) => void;
  feeBps: number;
  setFeeBps: (bps: number) => void;
}

const Ctx = createContext<WalletCtx | null>(null);

function toWeiHex(eth: number): string {
  const wei = BigInt(Math.floor(eth * 1e9)) * 1_000_000_000n;
  return "0x" + wei.toString(16);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);
  const [feeWallet, setFeeWalletState] = useState<string>(
    "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
  );
  const [feeBps, setFeeBpsState] = useState<number>(10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWallet = localStorage.getItem("rtpp_fee_wallet_address");
      if (savedWallet) setFeeWalletState(savedWallet);
      const savedBps = localStorage.getItem("rtpp_fee_rate_bps");
      if (savedBps) {
        const val = Number(savedBps);
        setFeeBpsState(val > 0 ? val : 10);
      } else {
        setFeeBpsState(10);
      }
    }
  }, []);

  const setFeeWallet = useCallback((addr: string) => {
    setFeeWalletState(addr);
    if (typeof window !== "undefined") {
      localStorage.setItem("rtpp_fee_wallet_address", addr);
    }
  }, []);

  const setFeeBps = useCallback((bps: number) => {
    setFeeBpsState(bps);
    if (typeof window !== "undefined") {
      localStorage.setItem("rtpp_fee_rate_bps", String(bps));
    }
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      const accts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
      setAddress(accts?.[0] ?? null);
      const cid = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(cid);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setHasProvider(typeof window !== "undefined" && !!window.ethereum);
    if (typeof window === "undefined" || !window.ethereum) return;
    refresh();
    const onAcc = (a: unknown) => {
      const addr = (a as string[])?.[0] ?? null;
      setAddress(addr);
      if (typeof window !== "undefined") {
        if (addr) localStorage.setItem("rtpp_connected_wallet_address", addr);
        else localStorage.removeItem("rtpp_connected_wallet_address");
      }
    };
    const onChain = (c: unknown) => setChainId(c as string);
    window.ethereum.on?.("accountsChanged", onAcc);
    window.ethereum.on?.("chainChanged", onChain);
    return () => {
      const eth = window.ethereum;
      if (!eth) return;
      if (typeof eth.removeListener === "function") {
        try {
          eth.removeListener("accountsChanged", onAcc);
          eth.removeListener("chainChanged", onChain);
        } catch {
          /* noop */
        }
      }
      if (typeof (eth as { off?: (e: string, h: unknown) => void }).off === "function") {
        try {
          (eth as { off: (e: string, h: unknown) => void }).off("accountsChanged", onAcc);
          (eth as { off: (e: string, h: unknown) => void }).off("chainChanged", onChain);
        } catch {
          /* noop */
        }
      }
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      const demoAddress = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
      setAddress(demoAddress);
      setChainId("0x1");
      localStorage.setItem("rtpp_connected_wallet_address", demoAddress);
      return;
    }
    setConnecting(true);
    try {
      const accts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const activeAddr =
        accts && accts[0] ? accts[0] : "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
      setAddress(activeAddr);
      localStorage.setItem("rtpp_connected_wallet_address", activeAddr);
      const cid = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(cid || "0x1");
    } catch {
      const demoAddress = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
      setAddress(demoAddress);
      setChainId("0x1");
      localStorage.setItem("rtpp_connected_wallet_address", demoAddress);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rtpp_connected_wallet_address");
    }
  }, []);

  const sendEth = useCallback(
    async (to: string, ethAmount: number) => {
      if (!window.ethereum || !address) throw new Error("Wallet not connected");
      const hash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: address, to, value: toWeiHex(ethAmount) }],
      })) as string;
      return hash;
    },
    [address],
  );

  const switchToBase = useCallback(async () => {
    if (!window.ethereum) throw new Error("No wallet");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }, []);

  const switchChain = useCallback(
    async (
      chainIdHex: string,
      addParams?: {
        chainName: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        nativeCurrency: { name: string; symbol: string; decimals: number };
      },
    ) => {
      if (!window.ethereum) throw new Error("No wallet");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (err: unknown) {
        const code = (err as { code?: number })?.code;
        if (code === 4902 && addParams) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: chainIdHex, ...addParams }],
          });
        } else {
          throw err;
        }
      }
    },
    [],
  );

  return (
    <Ctx.Provider
      value={{
        address,
        chainId,
        connecting,
        connect,
        disconnect,
        sendEth,
        switchToBase,
        switchChain,
        hasProvider,
        mounted,
        feeWallet,
        setFeeWallet,
        feeBps,
        setFeeBps,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWallet must be inside WalletProvider");
  return v;
}

export function shortAddr(a: string | null) {
  if (!a) return "";
  return a.slice(0, 6) + "…" + a.slice(-4);
}

// Platform fee wallet (Base network) — transparent marketplace fee
export const PLATFORM_FEE_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
export const PLATFORM_FEE_PCT = 0.01; // 1%
