import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const getAddress = (account: string | { address: string }) =>
  typeof account === "string" ? account : account.address;

describe("governance", () => {
  it("allows governor to manage pause and governor role", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const isGov = simnet.callReadOnlyFn(
      "governance",
      "is-governor",
      [Cl.principal(deployer)],
      deployer
    );
    expect(isGov.result).toBeBool(true);

    const isGovOther = simnet.callReadOnlyFn(
      "governance",
      "is-governor",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(isGovOther.result).toBeBool(false);

    const pause = simnet.callPublicFn(
      "governance",
      "set-paused",
      [Cl.bool(true)],
      deployer
    );
    expect(pause.result).toBeOk(Cl.bool(true));

    const paused = simnet.callReadOnlyFn("governance", "is-paused", [], deployer);
    expect(paused.result).toBeBool(true);

    const setGovernor = simnet.callPublicFn(
      "governance",
      "set-governor",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(setGovernor.result).toBeOk(Cl.bool(true));

    const isGovAfter = simnet.callReadOnlyFn(
      "governance",
      "is-governor",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(isGovAfter.result).toBeBool(true);
  });

  it("rejects non-governor admin actions", () => {
    const accounts = simnet.getAccounts();
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const pause = simnet.callPublicFn(
      "governance",
      "set-paused",
      [Cl.bool(true)],
      wallet1
    );
    expect(pause.result).toBeErr(Cl.uint(100));
  });
});
