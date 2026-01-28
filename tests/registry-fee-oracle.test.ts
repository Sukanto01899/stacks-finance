import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const getAddress = (account: string | { address: string }) =>
  typeof account === "string" ? account : account.address;

describe("vault registry", () => {
  it("registers and manages vaults under governor control", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const register = simnet.callPublicFn(
      "vault-registry-v2601221844",
      "register-vault",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(1_000_000)],
      deployer
    );
    expect(register.result).toBeOk(Cl.uint(1));

    const vault = simnet.callReadOnlyFn(
      "vault-registry-v2601221844",
      "get-vault",
      [Cl.uint(1)],
      deployer
    );
    expect(vault.result).toBeSome(
      Cl.tuple({
        vault: Cl.principal(wallet1),
        "risk-tier": Cl.uint(1),
        cap: Cl.uint(1_000_000),
        active: Cl.bool(true),
      })
    );

    const deactivate = simnet.callPublicFn(
      "vault-registry-v2601221844",
      "set-vault-active",
      [Cl.uint(1), Cl.bool(false)],
      deployer
    );
    expect(deactivate.result).toBeOk(Cl.bool(true));

    const setCap = simnet.callPublicFn(
      "vault-registry-v2601221844",
      "set-vault-cap",
      [Cl.uint(1), Cl.uint(2_000_000)],
      deployer
    );
    expect(setCap.result).toBeOk(Cl.bool(true));
  });

  it("rejects non-governor vault changes", () => {
    const accounts = simnet.getAccounts();
    const wallet2 = getAddress(accounts.get("wallet_2")!);

    const register = simnet.callPublicFn(
      "vault-registry-v2601221844",
      "register-vault",
      [Cl.principal(wallet2), Cl.uint(2), Cl.uint(500)],
      wallet2
    );
    expect(register.result).toBeErr(Cl.uint(100));
  });
});

describe("fee manager", () => {
  it("updates fee settings and recipients", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const wallet2 = getAddress(accounts.get("wallet_2")!);

    const setFees = simnet.callPublicFn(
      "fee-manager-v2-v2601221844",
      "set-fees",
      [Cl.uint(1200), Cl.uint(75)],
      deployer
    );
    expect(setFees.result).toBeOk(Cl.bool(true));

    const setRecipients = simnet.callPublicFn(
      "fee-manager-v2-v2601221844",
      "set-recipients",
      [Cl.principal(wallet1), Cl.principal(wallet2)],
      deployer
    );
    expect(setRecipients.result).toBeOk(Cl.bool(true));

    const fees = simnet.callReadOnlyFn("fee-manager-v2-v2601221844", "get-fees", [], deployer);
    expect(fees.result).toBeTuple({
      "performance-fee-bps": Cl.uint(1200),
      "management-fee-bps": Cl.uint(75),
      treasury: Cl.principal(wallet1),
      strategist: Cl.principal(wallet2),
    });
  });

  it("rejects non-governor updates", () => {
    const accounts = simnet.getAccounts();
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const setFees = simnet.callPublicFn(
      "fee-manager-v2-v2601221844",
      "set-fees",
      [Cl.uint(500), Cl.uint(20)],
      wallet1
    );
    expect(setFees.result).toBeErr(Cl.uint(100));
  });
});

describe("oracle nav", () => {
  it("stores nav snapshots from governor", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const setNav = simnet.callPublicFn(
      "oracle-nav-v2601221844",
      "set-nav",
      [Cl.principal(wallet1), Cl.uint(42_000)],
      deployer
    );
    expect(setNav.result).toBeOk(Cl.bool(true));

    const nav = simnet.callReadOnlyFn(
      "oracle-nav-v2601221844",
      "get-nav",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(nav.result).toBeSome(
      Cl.tuple({
        nav: Cl.uint(42_000),
        "updated-at": Cl.uint(0),
      })
    );
  });

  it("rejects non-governor updates", () => {
    const accounts = simnet.getAccounts();
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const setNav = simnet.callPublicFn(
      "oracle-nav-v2601221844",
      "set-nav",
      [Cl.principal(wallet1), Cl.uint(10)],
      wallet1
    );
    expect(setNav.result).toBeErr(Cl.uint(100));
  });
});

