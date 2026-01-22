import { userSession } from "../wallet/stacksSession";
import type { NetworkName } from "./stacks";

export function getUserAddress(network: NetworkName) {
  if (!userSession.isUserSignedIn()) {
    return null;
  }
  const userData = userSession.loadUserData();
  const stxAddress = userData?.profile?.stxAddress;
  if (typeof stxAddress === "string") {
    return stxAddress;
  }
  if (network === "mainnet") {
    return stxAddress?.mainnet ?? userData?.profile?.stxAddresses?.mainnet ?? null;
  }
  return stxAddress?.testnet ?? userData?.profile?.stxAddresses?.testnet ?? null;
}
