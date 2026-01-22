export type ActionParamType =
  | "uint"
  | "principal"
  | "optional-principal"
  | "string-ascii";

export type ActionParam = {
  key: string;
  label: string;
  type: ActionParamType;
  placeholder?: string;
};

export type ContractAction = {
  id: string;
  label: string;
  description: string;
  functionName: string;
  params: ActionParam[];
};

export type ContractConfig = {
  id: string;
  label: string;
  address: string;
  name: string;
  description: string;
  type: string;
  actions: ContractAction[];
};

export const CONTRACTS: ContractConfig[] = [
  {
    id: "vault-core",
    label: "Vault Core",
    address: "ST1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXVPSAX13",
    name: "vault-core-v20260122091342",
    type: "vault",
    description:
      "Supply, withdraw, and route assets into registered strategies.",
    actions: [
      {
        id: "deposit",
        label: "Supply STX",
        description: "Deposit STX and mint vault shares.",
        functionName: "deposit",
        params: [
          {
            key: "amount",
            label: "Amount (uSTX)",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
      {
        id: "withdraw",
        label: "Withdraw STX",
        description: "Redeem vault shares for STX.",
        functionName: "withdraw",
        params: [
          {
            key: "shares",
            label: "Shares (uSTX)",
            type: "uint",
            placeholder: "500000",
          },
        ],
      },
      {
        id: "deposit-sip010",
        label: "Supply SIP-010",
        description: "Deposit a SIP-010 asset into the vault.",
        functionName: "deposit-sip010",
        params: [
          {
            key: "token",
            label: "Token principal",
            type: "principal",
            placeholder: "ST...mock-token",
          },
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
      {
        id: "withdraw-sip010",
        label: "Withdraw SIP-010",
        description: "Withdraw a SIP-010 asset from the vault.",
        functionName: "withdraw-sip010",
        params: [
          {
            key: "token",
            label: "Token principal",
            type: "principal",
            placeholder: "ST...mock-token",
          },
          {
            key: "shares",
            label: "Shares",
            type: "uint",
            placeholder: "500000",
          },
        ],
      },
      {
        id: "allocate",
        label: "Allocate to strategy",
        description: "Route STX into a strategy contract.",
        functionName: "allocate",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-lending",
          },
          {
            key: "amount",
            label: "Amount (uSTX)",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
      {
        id: "deallocate",
        label: "Deallocate from strategy",
        description: "Pull STX back from a strategy contract.",
        functionName: "deallocate",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-lending",
          },
          {
            key: "amount",
            label: "Amount (uSTX)",
            type: "uint",
            placeholder: "500000",
          },
        ],
      },
    ],
  },
  {
    id: "strategy-manager",
    label: "Strategy Manager",
    address: "ST1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXVPSAX13",
    name: "strategy-manager-v20260122091342",
    type: "manager",
    description: "Manage strategy weights and activity.",
    actions: [
      {
        id: "add-strategy",
        label: "Add strategy",
        description: "Register a new strategy contract.",
        functionName: "add-strategy",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-income",
          },
          {
            key: "risk-tier",
            label: "Risk tier",
            type: "uint",
            placeholder: "1",
          },
          {
            key: "weight",
            label: "Weight",
            type: "uint",
            placeholder: "1000",
          },
        ],
      },
    ],
  },
  {
    id: "fee-manager",
    label: "Fee Manager",
    address: "ST1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXVPSAX13",
    name: "fee-manager-v2-v20260122091342",
    type: "fees",
    description: "Update fee settings and recipients.",
    actions: [
      {
        id: "set-fees",
        label: "Set fees",
        description: "Update performance and management fees.",
        functionName: "set-fees",
        params: [
          {
            key: "performance-bps",
            label: "Performance fee (bps)",
            type: "uint",
            placeholder: "200",
          },
          {
            key: "management-bps",
            label: "Management fee (bps)",
            type: "uint",
            placeholder: "100",
          },
        ],
      },
    ],
  },
];

export const contractMap = CONTRACTS.reduce<Record<string, ContractConfig>>(
  (acc, contract) => {
    acc[contract.id] = contract;
    return acc;
  },
  {},
);
