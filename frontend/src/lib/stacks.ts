import { networkFromName } from "@stacks/network";

export type NetworkName = "testnet" | "mainnet";

export const STACKS_NETWORK =
  ((import.meta.env.VITE_STACKS_NETWORK as NetworkName | undefined) ??
    "testnet") === "mainnet"
    ? "mainnet"
    : "testnet";

export const networkLabel = STACKS_NETWORK === "mainnet" ? "Mainnet" : "Testnet";

export const stacksNetwork = networkFromName(STACKS_NETWORK);
