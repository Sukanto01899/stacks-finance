import { Link, useParams } from "react-router-dom";

const contractMeta: Record<
  string,
  { title: string; summary: string; calls: string[] }
> = {
  "vault-core": {
    title: "Vault Core",
    summary: "Handle deposits, withdrawals, and share accounting logic.",
    calls: ["deposit", "withdraw", "allocate", "harvest"],
  },
  "strategy-manager": {
    title: "Strategy Manager",
    summary: "Register strategies, weights, and track managed balances.",
    calls: ["add-strategy", "set-strategy-active", "record-deposit"],
  },
  "fee-manager": {
    title: "Fee Manager",
    summary: "Update performance and management fees.",
    calls: ["set-fees", "set-recipients"],
  },
  governance: {
    title: "Governance",
    summary: "Control pause states and governor permissions.",
    calls: ["set-governor", "pause", "unpause"],
  },
};

function ContractDetailPage() {
  const { contractId } = useParams();
  const info = contractId ? contractMeta[contractId] : undefined;

  return (
    <section className="stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Contract detail</p>
          <h2>{info?.title ?? contractId ?? "Unknown contract"}</h2>
          <p className="lede">
            {info?.summary ??
              "Wire in the contract ABI and outline the call flows here."}
          </p>
        </div>
        <Link className="ghost-button" to="/contracts">
          Back to contracts
        </Link>
      </div>

      <div className="detail-grid">
        <article className="panel">
          <h3>Read-only calls</h3>
          <ul className="pill-list">
            <li>get-balance</li>
            <li>get-total-supply</li>
            <li>get-asset</li>
          </ul>
        </article>
        <article className="panel">
          <h3>Write calls</h3>
          <ul className="pill-list">
            {(info?.calls ?? ["deploy", "configure", "execute"]).map((call) => (
              <li key={call}>{call}</li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h3>Interaction planner</h3>
          <p>
            Add wallet connection, simulate calls with Clarinet, then dispatch
            transactions with Stacks.js.
          </p>
          <button className="cta-button" type="button">
            Launch simulator
          </button>
        </article>
      </div>
    </section>
  );
}

export default ContractDetailPage;
