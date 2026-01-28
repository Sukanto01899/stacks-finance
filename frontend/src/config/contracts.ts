export type ActionParamType =
  | "uint"
  | "principal"
  | "optional-principal"
  | "string-ascii"
  | "bool"
  | "optional-buff-34";

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
  postConditions?: PostConditionPreset[];
};

export type PostConditionPreset = {
  asset: "stx";
  direction: "sent" | "received";
  amountParam: string;
  principal: "origin" | "contract";
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
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "vault-core-v2601221844",
    type: "vault",
    description:
      "Supply, withdraw, and route assets into registered strategies.",
    actions: [
      {
        id: "initialize",
        label: "Initialize vault",
        description: "Set vault metadata and base asset.",
        functionName: "initialize",
        params: [
          {
            key: "kind",
            label: "Asset kind (0=STX, 1=SIP-010)",
            type: "uint",
            placeholder: "0",
          },
          {
            key: "token",
            label: "Token principal (optional)",
            type: "optional-principal",
            placeholder: "ST...mock-token",
          },
          {
            key: "name",
            label: "Token name",
            type: "string-ascii",
            placeholder: "Vault Receipt",
          },
          {
            key: "symbol",
            label: "Token symbol",
            type: "string-ascii",
            placeholder: "vTOKEN",
          },
          {
            key: "decimals",
            label: "Decimals",
            type: "uint",
            placeholder: "6",
          },
        ],
      },
      {
        id: "set-registry",
        label: "Set registry",
        description: "Update the vault registry address.",
        functionName: "set-registry",
        params: [
          {
            key: "new-registry",
            label: "Registry principal",
            type: "principal",
            placeholder: "ST...vault-registry",
          },
        ],
      },
      {
        id: "set-fee-manager",
        label: "Set fee manager",
        description: "Update fee manager contract.",
        functionName: "set-fee-manager",
        params: [
          {
            key: "new-fee-manager",
            label: "Fee manager principal",
            type: "principal",
            placeholder: "ST...fee-manager",
          },
        ],
      },
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
        postConditions: [
          {
            asset: "stx",
            direction: "sent",
            amountParam: "amount",
            principal: "origin",
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
        postConditions: [
          {
            asset: "stx",
            direction: "received",
            amountParam: "shares",
            principal: "origin",
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
        id: "transfer",
        label: "Transfer vault shares",
        description: "Move vault receipt tokens between users.",
        functionName: "transfer",
        params: [
          {
            key: "amount",
            label: "Shares",
            type: "uint",
            placeholder: "100000",
          },
          {
            key: "sender",
            label: "Sender principal",
            type: "principal",
            placeholder: "ST...sender",
          },
          {
            key: "recipient",
            label: "Recipient principal",
            type: "principal",
            placeholder: "ST...recipient",
          },
          {
            key: "memo",
            label: "Memo (optional hex)",
            type: "optional-buff-34",
            placeholder: "0x",
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
            key: "manager",
            label: "Strategy manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
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
        postConditions: [
          {
            asset: "stx",
            direction: "sent",
            amountParam: "amount",
            principal: "contract",
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
            key: "manager",
            label: "Strategy manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
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
      {
        id: "allocate-sip010",
        label: "Allocate SIP-010",
        description: "Route a SIP-010 token into a strategy.",
        functionName: "allocate-sip010",
        params: [
          {
            key: "token",
            label: "Token principal",
            type: "principal",
            placeholder: "ST...mock-token",
          },
          {
            key: "manager",
            label: "Strategy manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-lending",
          },
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "500000",
          },
        ],
      },
      {
        id: "deallocate-sip010",
        label: "Deallocate SIP-010",
        description: "Withdraw a SIP-010 token from a strategy.",
        functionName: "deallocate-sip010",
        params: [
          {
            key: "token",
            label: "Token principal",
            type: "principal",
            placeholder: "ST...mock-token",
          },
          {
            key: "manager",
            label: "Strategy manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-lending",
          },
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "250000",
          },
        ],
      },
      {
        id: "harvest",
        label: "Harvest strategy",
        description: "Harvest returns for a strategy.",
        functionName: "harvest",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-income",
          },
        ],
      },
    ],
  },
  {
    id: "strategy-manager",
    label: "Strategy Manager",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "strategy-manager-v2601221844",
    type: "manager",
    description: "Manage strategy weights and activity.",
    actions: [
      {
        id: "initialize",
        label: "Initialize manager",
        description: "Set the vault core address.",
        functionName: "initialize",
        params: [
          {
            key: "new-vault-core",
            label: "Vault core principal",
            type: "principal",
            placeholder: "ST...vault-core",
          },
        ],
      },
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
      {
        id: "set-strategy-active",
        label: "Set strategy active",
        description: "Toggle a strategy on or off.",
        functionName: "set-strategy-active",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-income",
          },
          {
            key: "active",
            label: "Active (true/false)",
            type: "bool",
            placeholder: "true",
          },
        ],
      },
      {
        id: "update-weight",
        label: "Update weight",
        description: "Adjust strategy weight.",
        functionName: "update-weight",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-income",
          },
          {
            key: "weight",
            label: "Weight",
            type: "uint",
            placeholder: "1000",
          },
        ],
      },
      {
        id: "record-deposit",
        label: "Record deposit",
        description: "Track deposits for a strategy.",
        functionName: "record-deposit",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-income",
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
        id: "record-withdraw",
        label: "Record withdraw",
        description: "Track withdrawals for a strategy.",
        functionName: "record-withdraw",
        params: [
          {
            key: "strategy",
            label: "Strategy principal",
            type: "principal",
            placeholder: "ST...strategy-income",
          },
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "500000",
          },
        ],
      },
    ],
  },
  {
    id: "strategy-income",
    label: "Strategy Income",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "strategy-income-v2601221844",
    type: "strategy",
    description: "Income strategy controls.",
    actions: [
      {
        id: "set-manager",
        label: "Set manager",
        description: "Update strategy manager.",
        functionName: "set-manager",
        params: [
          {
            key: "new-manager",
            label: "Manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
        ],
      },
      {
        id: "deposit",
        label: "Deposit",
        description: "Record strategy deposit.",
        functionName: "deposit",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
      {
        id: "withdraw",
        label: "Withdraw",
        description: "Withdraw managed funds.",
        functionName: "withdraw",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "500000",
          },
        ],
        postConditions: [
          {
            asset: "stx",
            direction: "received",
            amountParam: "amount",
            principal: "origin",
          },
        ],
      },
      {
        id: "withdraw-sip010",
        label: "Withdraw SIP-010",
        description: "Withdraw SIP-010 from strategy.",
        functionName: "withdraw-sip010",
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
            placeholder: "250000",
          },
        ],
      },
      {
        id: "harvest",
        label: "Harvest",
        description: "Harvest strategy returns.",
        functionName: "harvest",
        params: [],
      },
    ],
  },
  {
    id: "strategy-lending",
    label: "Strategy Lending",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "strategy-lending-v2601221844",
    type: "strategy",
    description: "Lending strategy controls.",
    actions: [
      {
        id: "set-manager",
        label: "Set manager",
        description: "Update strategy manager.",
        functionName: "set-manager",
        params: [
          {
            key: "new-manager",
            label: "Manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
        ],
      },
      {
        id: "deposit",
        label: "Deposit",
        description: "Record strategy deposit.",
        functionName: "deposit",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
      {
        id: "withdraw",
        label: "Withdraw",
        description: "Withdraw managed funds.",
        functionName: "withdraw",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "500000",
          },
        ],
        postConditions: [
          {
            asset: "stx",
            direction: "received",
            amountParam: "amount",
            principal: "origin",
          },
        ],
      },
      {
        id: "withdraw-sip010",
        label: "Withdraw SIP-010",
        description: "Withdraw SIP-010 from strategy.",
        functionName: "withdraw-sip010",
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
            placeholder: "250000",
          },
        ],
      },
      {
        id: "harvest",
        label: "Harvest",
        description: "Harvest strategy returns.",
        functionName: "harvest",
        params: [],
      },
    ],
  },
  {
    id: "strategy-liquidity",
    label: "Strategy Liquidity",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "strategy-liquidity-v2601221844",
    type: "strategy",
    description: "Liquidity strategy controls.",
    actions: [
      {
        id: "set-manager",
        label: "Set manager",
        description: "Update strategy manager.",
        functionName: "set-manager",
        params: [
          {
            key: "new-manager",
            label: "Manager principal",
            type: "principal",
            placeholder: "ST...strategy-manager",
          },
        ],
      },
      {
        id: "deposit",
        label: "Deposit",
        description: "Record strategy deposit.",
        functionName: "deposit",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
      {
        id: "withdraw",
        label: "Withdraw",
        description: "Withdraw managed funds.",
        functionName: "withdraw",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "500000",
          },
        ],
        postConditions: [
          {
            asset: "stx",
            direction: "received",
            amountParam: "amount",
            principal: "origin",
          },
        ],
      },
      {
        id: "withdraw-sip010",
        label: "Withdraw SIP-010",
        description: "Withdraw SIP-010 from strategy.",
        functionName: "withdraw-sip010",
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
            placeholder: "250000",
          },
        ],
      },
      {
        id: "harvest",
        label: "Harvest",
        description: "Harvest strategy returns.",
        functionName: "harvest",
        params: [],
      },
    ],
  },
  {
    id: "fee-manager",
    label: "Fee Manager",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "fee-manager-v2-v2601221844",
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
      {
        id: "set-recipients",
        label: "Set recipients",
        description: "Update treasury and strategist addresses.",
        functionName: "set-recipients",
        params: [
          {
            key: "new-treasury",
            label: "Treasury principal",
            type: "principal",
            placeholder: "ST...treasury",
          },
          {
            key: "new-strategist",
            label: "Strategist principal",
            type: "principal",
            placeholder: "ST...strategist",
          },
        ],
      },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "governance-v2-v2601221844",
    type: "governance",
    description: "Governor permissions and pause control.",
    actions: [
      {
        id: "set-governor",
        label: "Set governor",
        description: "Transfer governor authority.",
        functionName: "set-governor",
        params: [
          {
            key: "new-governor",
            label: "Governor principal",
            type: "principal",
            placeholder: "ST...governor",
          },
        ],
      },
      {
        id: "set-paused",
        label: "Set paused",
        description: "Pause or unpause protocol actions.",
        functionName: "set-paused",
        params: [
          {
            key: "flag",
            label: "Paused (true/false)",
            type: "bool",
            placeholder: "false",
          },
        ],
      },
    ],
  },
  {
    id: "vault-registry",
    label: "Vault Registry",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "vault-registry-v2601221844",
    type: "registry",
    description: "Register vaults and manage caps.",
    actions: [
      {
        id: "register-vault",
        label: "Register vault",
        description: "Add a new vault to the registry.",
        functionName: "register-vault",
        params: [
          {
            key: "vault",
            label: "Vault principal",
            type: "principal",
            placeholder: "ST...vault-core",
          },
          {
            key: "risk-tier",
            label: "Risk tier",
            type: "uint",
            placeholder: "1",
          },
          {
            key: "cap",
            label: "Cap",
            type: "uint",
            placeholder: "1000000000",
          },
        ],
      },
      {
        id: "set-vault-active",
        label: "Set vault active",
        description: "Toggle a vault on or off.",
        functionName: "set-vault-active",
        params: [
          {
            key: "id",
            label: "Vault id",
            type: "uint",
            placeholder: "1",
          },
          {
            key: "active",
            label: "Active (true/false)",
            type: "bool",
            placeholder: "true",
          },
        ],
      },
      {
        id: "set-vault-cap",
        label: "Set vault cap",
        description: "Update the vault cap.",
        functionName: "set-vault-cap",
        params: [
          {
            key: "id",
            label: "Vault id",
            type: "uint",
            placeholder: "1",
          },
          {
            key: "cap",
            label: "Cap",
            type: "uint",
            placeholder: "2000000000",
          },
        ],
      },
    ],
  },
  {
    id: "oracle-nav",
    label: "Oracle NAV",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "oracle-nav-v2601221844",
    type: "oracle",
    description: "Report NAV values for vaults.",
    actions: [
      {
        id: "set-nav",
        label: "Set NAV",
        description: "Update vault NAV.",
        functionName: "set-nav",
        params: [
          {
            key: "vault",
            label: "Vault principal",
            type: "principal",
            placeholder: "ST...vault-core",
          },
          {
            key: "nav",
            label: "NAV",
            type: "uint",
            placeholder: "1000000",
          },
        ],
      },
    ],
  },
  {
    id: "mock-token",
    label: "Mock Token",
    address: "SP1G4ZDXED8XM2XJ4Q4GJ7F4PG4EJQ1KKXRCD0S3K",
    name: "mock-token-v2-v2601221844",
    type: "token",
    description: "Test SIP-010 token operations.",
    actions: [
      {
        id: "transfer",
        label: "Transfer",
        description: "Transfer SIP-010 tokens.",
        functionName: "transfer",
        params: [
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "1000000",
          },
          {
            key: "sender",
            label: "Sender principal",
            type: "principal",
            placeholder: "ST...sender",
          },
          {
            key: "recipient",
            label: "Recipient principal",
            type: "principal",
            placeholder: "ST...recipient",
          },
          {
            key: "memo",
            label: "Memo (optional hex)",
            type: "optional-buff-34",
            placeholder: "0x",
          },
        ],
      },
      {
        id: "mint",
        label: "Mint",
        description: "Mint new tokens.",
        functionName: "mint",
        params: [
          {
            key: "recipient",
            label: "Recipient principal",
            type: "principal",
            placeholder: "ST...recipient",
          },
          {
            key: "amount",
            label: "Amount",
            type: "uint",
            placeholder: "1000000",
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
