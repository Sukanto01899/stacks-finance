import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const getAddress = (account: string | { address: string }) =>
  typeof account === "string" ? account : account.address;

describe("vault core", () => {
  it("mints and burns shares on deposit and withdraw", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const init = simnet.callPublicFn(
      "vault-core-v2601221844",
      "initialize",
      [Cl.uint(0), Cl.none(), Cl.stringAscii("Vault Receipt"), Cl.stringAscii("vTOKEN"), Cl.uint(6)],
      deployer
    );
    expect(init.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "vault-core-v2601221844",
      "deposit",
      [Cl.uint(1_000)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.uint(1_000));

    const balance = simnet.callReadOnlyFn(
      "vault-core-v2601221844",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance.result).toBeOk(Cl.uint(1_000));

    const totals = simnet.callReadOnlyFn("vault-core-v2601221844", "get-totals", [], deployer);
    expect(totals.result).toBeTuple({
      "total-shares": Cl.uint(1_000),
      "total-assets": Cl.uint(1_000),
    });

    const withdraw = simnet.callPublicFn(
      "vault-core-v2601221844",
      "withdraw",
      [Cl.uint(400)],
      wallet1
    );
    expect(withdraw.result).toBeOk(Cl.uint(400));

    const balanceAfter = simnet.callReadOnlyFn(
      "vault-core-v2601221844",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balanceAfter.result).toBeOk(Cl.uint(600));
  });

  it("transfers receipt tokens between users", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const wallet2 = getAddress(accounts.get("wallet_2")!);

    const init = simnet.callPublicFn(
      "vault-core-v2601221844",
      "initialize",
      [Cl.uint(0), Cl.none(), Cl.stringAscii("Vault Receipt"), Cl.stringAscii("vTOKEN"), Cl.uint(6)],
      deployer
    );
    expect(init.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "vault-core-v2601221844",
      "deposit",
      [Cl.uint(200)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.uint(200));

    const transfer = simnet.callPublicFn(
      "vault-core-v2601221844",
      "transfer",
      [Cl.uint(50), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );
    expect(transfer.result).toBeOk(Cl.bool(true));

    const balance1 = simnet.callReadOnlyFn(
      "vault-core-v2601221844",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance1.result).toBeOk(Cl.uint(150));

    const balance2 = simnet.callReadOnlyFn(
      "vault-core-v2601221844",
      "get-balance",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(balance2.result).toBeOk(Cl.uint(50));
  });

  it("rejects withdrawals beyond balance", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet2 = getAddress(accounts.get("wallet_2")!);

    const init = simnet.callPublicFn(
      "vault-core-v2601221844",
      "initialize",
      [Cl.uint(0), Cl.none(), Cl.stringAscii("Vault Receipt"), Cl.stringAscii("vTOKEN"), Cl.uint(6)],
      deployer
    );
    expect(init.result).toBeOk(Cl.bool(true));

    const withdraw = simnet.callPublicFn(
      "vault-core-v2601221844",
      "withdraw",
      [Cl.uint(1)],
      wallet2
    );
    expect(withdraw.result).toBeErr(Cl.uint(101));
  });

  it("supports SIP-010 deposits and withdrawals", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const vaultContract = `${deployer}.vault-core-v2601221844`;
    const mockToken = `${deployer}.mock-token-v2-v2601221844`;

    const init = simnet.callPublicFn(
      "vault-core-v2601221844",
      "initialize",
      [
        Cl.uint(1),
        Cl.some(Cl.principal(mockToken)),
        Cl.stringAscii("Vault Receipt"),
        Cl.stringAscii("vTOKEN"),
        Cl.uint(6),
      ],
      deployer
    );
    expect(init.result).toBeOk(Cl.bool(true));

    const mint = simnet.callPublicFn(
      "mock-token-v2-v2601221844",
      "mint",
      [Cl.principal(wallet1), Cl.uint(1_000)],
      deployer
    );
    expect(mint.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "vault-core-v2601221844",
      "deposit-sip010",
      [Cl.principal(mockToken), Cl.uint(250)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.uint(250));

    const vaultBalance = simnet.callReadOnlyFn(
      "mock-token-v2-v2601221844",
      "get-balance",
      [Cl.principal(vaultContract)],
      deployer
    );
    expect(vaultBalance.result).toBeUint(250);

    const withdraw = simnet.callPublicFn(
      "vault-core-v2601221844",
      "withdraw-sip010",
      [Cl.principal(mockToken), Cl.uint(100)],
      wallet1
    );
    expect(withdraw.result).toBeOk(Cl.uint(100));
  });

  it("allocates and deallocates assets with strategy accounting", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const vaultContract = `${deployer}.vault-core-v2601221844`;
    const strategyContract = `${deployer}.strategy-lending-v2601221844`;

    const initVault = simnet.callPublicFn(
      "vault-core-v2601221844",
      "initialize",
      [Cl.uint(0), Cl.none(), Cl.stringAscii("Vault Receipt"), Cl.stringAscii("vTOKEN"), Cl.uint(6)],
      deployer
    );
    expect(initVault.result).toBeOk(Cl.bool(true));

    const setVaultCore = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "initialize",
      [Cl.principal(vaultContract)],
      deployer
    );
    expect(setVaultCore.result).toBeOk(Cl.bool(true));

    const addStrategy = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "add-strategy",
      [Cl.principal(strategyContract), Cl.uint(1), Cl.uint(100)],
      deployer
    );
    expect(addStrategy.result).toBeOk(Cl.bool(true));

    const setManager = simnet.callPublicFn(
      "strategy-lending-v2601221844",
      "set-manager",
      [Cl.principal(vaultContract)],
      deployer
    );
    expect(setManager.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "vault-core-v2601221844",
      "deposit",
      [Cl.uint(1_000)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.uint(1_000));

    const allocate = simnet.callPublicFn(
      "vault-core-v2601221844",
      "allocate",
      [Cl.principal(`${deployer}.strategy-manager-v2601221844`), Cl.principal(strategyContract), Cl.uint(400)],
      deployer
    );
    expect(allocate.result).toBeOk(Cl.bool(true));

    const totalsAfterAllocate = simnet.callReadOnlyFn(
      "vault-core-v2601221844",
      "get-totals",
      [],
      deployer
    );
    expect(totalsAfterAllocate.result).toBeTuple({
      "total-shares": Cl.uint(1_000),
      "total-assets": Cl.uint(600),
    });

    const deallocate = simnet.callPublicFn(
      "vault-core-v2601221844",
      "deallocate",
      [Cl.principal(`${deployer}.strategy-manager-v2601221844`), Cl.principal(strategyContract), Cl.uint(200)],
      deployer
    );
    expect(deallocate.result).toBeOk(Cl.bool(true));

    const harvest = simnet.callPublicFn(
      "vault-core-v2601221844",
      "harvest",
      [Cl.principal(strategyContract)],
      deployer
    );
    expect(harvest.result).toBeOk(Cl.uint(0));
  });
});

describe("strategy manager", () => {
  it("tracks strategies and managed balances", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const setVaultCore = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "initialize",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(setVaultCore.result).toBeOk(Cl.bool(true));

    const add = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "add-strategy",
      [Cl.principal(wallet1), Cl.uint(1), Cl.uint(100)],
      deployer
    );
    expect(add.result).toBeOk(Cl.bool(true));

    const recordDeposit = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "record-deposit",
      [Cl.principal(wallet1), Cl.uint(500)],
      wallet1
    );
    expect(recordDeposit.result).toBeOk(Cl.bool(true));

    const recordWithdraw = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "record-withdraw",
      [Cl.principal(wallet1), Cl.uint(200)],
      wallet1
    );
    expect(recordWithdraw.result).toBeOk(Cl.bool(true));

    const strategy = simnet.callReadOnlyFn(
      "strategy-manager-v2601221844",
      "get-strategy",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(strategy.result).toBeSome(
      Cl.tuple({
        active: Cl.bool(true),
        "risk-tier": Cl.uint(1),
        weight: Cl.uint(100),
        managed: Cl.uint(300),
      })
    );
  });

  it("rejects record calls from non-vault-core-v2601221844", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);

    const init = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "initialize",
      [Cl.principal(deployer)],
      deployer
    );
    expect(init.result).toBeOk(Cl.bool(true));

    const add = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "add-strategy",
      [Cl.principal(wallet1), Cl.uint(2), Cl.uint(50)],
      deployer
    );
    expect(add.result).toBeOk(Cl.bool(true));

    const recordDeposit = simnet.callPublicFn(
      "strategy-manager-v2601221844",
      "record-deposit",
      [Cl.principal(wallet1), Cl.uint(10)],
      wallet1
    );
    expect(recordDeposit.result).toBeErr(Cl.uint(100));
  });
});

describe("strategy implementations", () => {
  it("allows manager to move balances in lending strategy", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const mockToken = `${deployer}.mock-token-v2-v2601221844`;

    const setManager = simnet.callPublicFn(
      "strategy-lending-v2601221844",
      "set-manager",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(setManager.result).toBeOk(Cl.bool(true));

    const mint = simnet.callPublicFn(
      "mock-token-v2-v2601221844",
      "mint",
      [Cl.principal(`${deployer}.strategy-lending-v2601221844`), Cl.uint(500)],
      deployer
    );
    expect(mint.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "strategy-lending-v2601221844",
      "deposit",
      [Cl.uint(250)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.bool(true));

    const withdraw = simnet.callPublicFn(
      "strategy-lending-v2601221844",
      "withdraw-sip010",
      [Cl.principal(mockToken), Cl.uint(100)],
      wallet1
    );
    expect(withdraw.result).toBeOk(Cl.bool(true));

    const harvest = simnet.callPublicFn("strategy-lending-v2601221844", "harvest", [], wallet1);
    expect(harvest.result).toBeOk(Cl.uint(0));
  });

  it("rejects non-manager calls and insufficient withdraws", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const mockToken = `${deployer}.mock-token-v2-v2601221844`;

    const setManager = simnet.callPublicFn(
      "strategy-liquidity-v2601221844",
      "set-manager",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(setManager.result).toBeOk(Cl.bool(true));

    const mint = simnet.callPublicFn(
      "mock-token-v2-v2601221844",
      "mint",
      [Cl.principal(`${deployer}.strategy-liquidity-v2601221844`), Cl.uint(100)],
      deployer
    );
    expect(mint.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "strategy-liquidity-v2601221844",
      "deposit",
      [Cl.uint(100)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.bool(true));

    const withdrawTooMuch = simnet.callPublicFn(
      "strategy-liquidity-v2601221844",
      "withdraw",
      [Cl.uint(200)],
      deployer
    );
    expect(withdrawTooMuch.result).toBeErr(Cl.uint(100));

    const nonManagerDeposit = simnet.callPublicFn(
      "strategy-liquidity-v2601221844",
      "deposit",
      [Cl.uint(1)],
      deployer
    );
    expect(nonManagerDeposit.result).toBeErr(Cl.uint(100));
  });

  it("supports income strategy manager flows", () => {
    const accounts = simnet.getAccounts();
    const deployer = getAddress(accounts.get("deployer")!);
    const wallet1 = getAddress(accounts.get("wallet_1")!);
    const mockToken = `${deployer}.mock-token-v2-v2601221844`;

    const setManager = simnet.callPublicFn(
      "strategy-income-v2601221844",
      "set-manager",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(setManager.result).toBeOk(Cl.bool(true));

    const mint = simnet.callPublicFn(
      "mock-token-v2-v2601221844",
      "mint",
      [Cl.principal(`${deployer}.strategy-income-v2601221844`), Cl.uint(50)],
      deployer
    );
    expect(mint.result).toBeOk(Cl.bool(true));

    const deposit = simnet.callPublicFn(
      "strategy-income-v2601221844",
      "deposit",
      [Cl.uint(20)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.bool(true));

    const withdraw = simnet.callPublicFn(
      "strategy-income-v2601221844",
      "withdraw-sip010",
      [Cl.principal(mockToken), Cl.uint(10)],
      wallet1
    );
    expect(withdraw.result).toBeOk(Cl.bool(true));
  });
});

