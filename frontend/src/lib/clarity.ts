import {
  contractPrincipalCV,
  noneCV,
  someCV,
  standardPrincipalCV,
  stringAsciiCV,
  uintCV,
} from "@stacks/transactions";
import type { ClarityValue } from "@stacks/transactions";

import type { ActionParamType } from "../config/contracts";

const uintPattern = /^\d+$/;

export function toClarityValue(type: ActionParamType, rawValue: string) {
  const value = rawValue.trim();

  if (type === "uint") {
    if (!uintPattern.test(value)) {
      throw new Error("Enter a valid unsigned integer.");
    }
    return uintCV(BigInt(value));
  }

  if (type === "string-ascii") {
    if (!value) {
      throw new Error("Enter a value.");
    }
    return stringAsciiCV(value);
  }

  if (type === "optional-principal") {
    if (!value) {
      return noneCV();
    }
    return someCV(parsePrincipal(value));
  }

  if (!value) {
    throw new Error("Enter a value.");
  }
  return parsePrincipal(value);
}

export function parsePrincipal(value: string): ClarityValue {
  const trimmed = value.trim();
  if (trimmed.includes(".")) {
    const [address, contractName] = trimmed.split(".", 2);
    if (!address || !contractName) {
      throw new Error("Enter a valid contract principal.");
    }
    return contractPrincipalCV(address, contractName);
  }
  return standardPrincipalCV(trimmed);
}
