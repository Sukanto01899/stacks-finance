import {
  contractPrincipalCV,
  boolCV,
  bufferCV,
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

  if (type === "bool") {
    if (!value) {
      throw new Error("Enter true or false.");
    }
    const normalized = value.toLowerCase();
    if (normalized !== "true" && normalized !== "false") {
      throw new Error("Enter true or false.");
    }
    return boolCV(normalized === "true");
  }

  if (type === "optional-principal") {
    if (!value) {
      return noneCV();
    }
    return someCV(parsePrincipal(value));
  }

  if (type === "optional-buff-34") {
    if (!value) {
      return noneCV();
    }
    const bytes = parseHexBytes(value);
    return someCV(bufferCV(bytes));
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

function parseHexBytes(input: string) {
  const cleaned = input.trim().replace(/^0x/i, "");
  if (!cleaned) {
    return new Uint8Array();
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error("Hex string must have an even length.");
  }
  if (!/^[\da-fA-F]+$/.test(cleaned)) {
    throw new Error("Enter a valid hex string.");
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16);
  }
  if (bytes.length > 34) {
    throw new Error("Buffer must be 34 bytes or less.");
  }
  return bytes;
}
