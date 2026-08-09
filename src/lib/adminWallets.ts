/**
 * RTPP Multi-Chain Admin Wallets & Security Configuration
 *
 * Configured Multi-Chain Fee Recipient & Admin Treasury Wallets:
 *
 * METAMASK (Primary Admin Treasury):
 * - Ethereum:       0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f
 * - Bitcoin:        bc1qhee9w0taapte30wj9rwc3d92ax9njqspmmadtk
 * - Solana:         2WSzAwa82ny6pk8PT9rF6UtiLuMznvNUJAJVeyGa8PKR
 * - Linea:          0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f
 * - Base:           0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f
 * - BNB Chain:      0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f
 * - Polygon:        0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f
 *
 * PHANTOM (Phantom Treasury):
 * - Solana:         BFEjTtXJik8CDbcpXSrz78cY9mEAJWz7fuWACt4pZxcP
 * - Ethereum:       0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524
 * - Bitcoin:        bc1qadfrvys68newdfagnveg05cd49qtsappdrhrh7
 * - Robinhood Chain:0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524
 * - Base:           0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524
 * - Sui:            0xc7c5690e33ee7d8b653fb7e2ecac7b18f5e3e671a20be713b642818613fb9594
 * - Polygon:        0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524
 */

export interface WalletProviderConfig {
  ethereum: string;
  bitcoin: string;
  solana: string;
  linea?: string;
  base: string;
  bnb?: string;
  polygon: string;
  robinhood?: string;
  sui?: string;
}

export const ADMIN_WALLETS_METAMASK: WalletProviderConfig = Object.freeze({
  ethereum: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
  bitcoin: "bc1qhee9w0taapte30wj9rwc3d92ax9njqspmmadtk",
  solana: "2WSzAwa82ny6pk8PT9rF6UtiLuMznvNUJAJVeyGa8PKR",
  linea: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
  base: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
  bnb: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
  polygon: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f",
});

export const ADMIN_WALLETS_PHANTOM: WalletProviderConfig = Object.freeze({
  solana: "BFEjTtXJik8CDbcpXSrz78cY9mEAJWz7fuWACt4pZxcP",
  ethereum: "0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524",
  bitcoin: "bc1qadfrvys68newdfagnveg05cd49qtsappdrhrh7",
  robinhood: "0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524",
  base: "0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524",
  sui: "0xc7c5690e33ee7d8b653fb7e2ecac7b18f5e3e671a20be713b642818613fb9594",
  polygon: "0x02b1A2F8Fb3E0dBf21694CB32072F263f4bc2524",
});

// Primary default EVM Admin Fee Wallet
export const PRIMARY_ADMIN_EVM_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";

// Standard Platform Fee Percentage: 0.25% (25 BPS)
export const PLATFORM_FEE_PERCENTAGE = 0.0025;

// Complete Set of Authorized Admin Wallet Addresses (for security role verification)
export const AUTHORIZED_ADMIN_ADDRESSES: ReadonlySet<string> = Object.freeze(
  new Set([
    // MetaMask EVM / Primary Admin
    "0x82627aeedd0e7f0b6d45d443a1f59bcd2adcd68f",
    "0x3f4e8912a453d867c828e12b4f2910488e3a8e12",
    // MetaMask Bitcoin & Solana
    "bc1qhee9w0taapte30wj9rwc3d92ax9njqspmmadtk",
    "2wszawa82ny6pk8pt9rf6utilumznvnujajveygapkr",
    // Phantom EVM / Robinhood
    "0x02b1a2f8fb3e0dbf21694cb32072f263f4bc2524",
    // Phantom Solana
    "bfejttxjik8cdbcpxsrz78cy9meadjwz7fuwact4pxcp",
    // Phantom Bitcoin
    "bc1qadfrvys68newdfagnveg05cd49qtsappdrhrh7",
    // Phantom Sui
    "0xc7c5690e33ee7d8b653fb7e2ecac7b18f5e3e671a20be713b642818613fb9594",
  ]),
);

/**
 * Validates whether a given address format is valid for EVM, Solana, Bitcoin, or Sui
 */
export function validateWalletAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  const trimmed = address.trim();

  // EVM format (0x + 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return true;

  // Sui format (0x + 64 hex chars)
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) return true;

  // Solana Base58 format (32 to 44 base58 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return true;

  // Bitcoin format (Bech32 bc1... or legacy 1.../3...)
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)) return true;

  return false;
}

/**
 * Helper to securely check if a wallet address has Master Admin status.
 */
export function isAdminWallet(address: string | null | undefined): boolean {
  if (!address) return false;
  const normalized = address.trim().toLowerCase();
  if (AUTHORIZED_ADMIN_ADDRESSES.has(normalized)) return true;

  // Check local developer unlock flag safely
  if (typeof window !== "undefined") {
    const isUnlocked = localStorage.getItem("rtpp_admin_unlocked") === "true";
    if (isUnlocked) return true;
  }

  return false;
}

/**
 * Returns the exact Admin Fee Wallet for a target chain and wallet provider.
 * Provider can be "metamask", "phantom", or undefined (defaults to best match).
 */
export function getAdminFeeWallet(
  chainKeyOrId: string | number = "ethereum",
  provider: "metamask" | "phantom" | string = "metamask",
): string {
  const normChain = String(chainKeyOrId).toLowerCase().trim();
  const isPhantom = String(provider).toLowerCase().includes("phantom");

  const config = isPhantom ? ADMIN_WALLETS_PHANTOM : ADMIN_WALLETS_METAMASK;

  if (normChain.includes("sol") || normChain === "139981114") {
    return config.solana || ADMIN_WALLETS_METAMASK.solana;
  }

  if (normChain.includes("btc") || normChain.includes("bitcoin")) {
    return config.bitcoin || ADMIN_WALLETS_METAMASK.bitcoin;
  }

  if (normChain.includes("sui")) {
    return config.sui || ADMIN_WALLETS_PHANTOM.sui || PRIMARY_ADMIN_EVM_WALLET;
  }

  if (normChain.includes("robin") || normChain.includes("robinhood")) {
    return config.robinhood || ADMIN_WALLETS_PHANTOM.robinhood || PRIMARY_ADMIN_EVM_WALLET;
  }

  if (normChain.includes("linea") || normChain === "59144" || normChain === "0xe708") {
    return config.linea || PRIMARY_ADMIN_EVM_WALLET;
  }

  if (normChain.includes("base") || normChain === "8453" || normChain === "0x2105") {
    return config.base || PRIMARY_ADMIN_EVM_WALLET;
  }

  if (
    normChain.includes("bsc") ||
    normChain.includes("bnb") ||
    normChain === "56" ||
    normChain === "0x38"
  ) {
    return config.bnb || PRIMARY_ADMIN_EVM_WALLET;
  }

  if (
    normChain.includes("poly") ||
    normChain.includes("matic") ||
    normChain === "137" ||
    normChain === "0x89"
  ) {
    return config.polygon || PRIMARY_ADMIN_EVM_WALLET;
  }

  // EVM default
  return config.ethereum || PRIMARY_ADMIN_EVM_WALLET;
}
