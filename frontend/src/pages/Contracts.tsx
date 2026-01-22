import { Link } from "react-router-dom";

const contracts = [
  {
    id: "vault-core",
    label: "Vault Core",
    role: "Deposits, withdrawals, and share accounting.",
    type: "vault",
  },
  {
    id: "vault-registry",
    label: "Vault Registry",
    role: "Vault discovery, caps, and activity toggles.",
    type: "registry",
  },
  {
    id: "strategy-manager",
    label: "Strategy Manager",
    role: "Risk tiers, weights, and strategy tracking.",
    type: "manager",
  },
  {
    id: "strategy-income",
    label: "Strategy Income",
    role: "Income strategy with manager-driven flows.",
    type: "strategy",
  },
  {
    id: "strategy-lending",
    label: "Strategy Lending",
    role: "Lending strategy hooks and withdrawal routing.",
    type: "strategy",
  },
  {
    id: "strategy-liquidity",
    label: "Strategy Liquidity",
    role: "Liquidity strategy with SIP-010 support.",
    type: "strategy",
  },
  {
    id: "fee-manager",
    label: "Fee Manager",
    role: "Fee configuration and recipients.",
    type: "fees",
  },
  {
    id: "governance",
    label: "Governance",
    role: "Governor controls and pause toggles.",
    type: "governance",
  },
  {
    id: "oracle-nav",
    label: "Oracle NAV",
    role: "NAV feed for vault valuation.",
    type: "oracle",
  },
  {
    id: "mock-token",
    label: "Mock Token",
    role: "SIP-010 token used for testing.",
    type: "token",
  },
];

function ContractsPage() {
  return (
    <section className="stack">
      <header className="section-header">
        <div>
          <p className="eyebrow">Contracts</p>
          <h2>Jump into a module</h2>
          <p className="lede">
            Each page is a starting point for call previews, on-chain reads, and
            approval flows.
          </p>
        </div>
        <button className="ghost-button" type="button">
          Add contract
        </button>
      </header>

      <div className="contract-grid">
        {contracts.map((contract, index) => (
          <Link
            key={contract.id}
            className="contract-tile"
            to={`/contracts/${contract.id}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div>
              <p className="badge">{contract.type}</p>
              <h3>{contract.label}</h3>
              <p>{contract.role}</p>
            </div>
            <span className="tile-link">Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ContractsPage;
