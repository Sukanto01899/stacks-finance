import { Link } from "react-router-dom";
import { CONTRACTS } from "../config/contracts";

function ContractsPage() {
  return (
    <section className="stack">
      <header className="section-header">
        <div>
          <p className="eyebrow">Contracts</p>
          <h2>Protocol modules</h2>
          <p className="lede">
            Each page is a starting point for call previews, on-chain reads, and
            approval flows.
          </p>
        </div>
        <button className="ghost-button" type="button">
          Add contract
        </button>
      </header>

      <div className="contract-metrics">
  <div className="metric">
    <span className="metric-value">{contract.totalCalls || 0}</span>
    <span className="metric-label">Calls</span>
  </div>
  <div className="metric">
    <span className="metric-value">{contract.lastCall || "Never"}</span>
    <span className="metric-label">Last used</span>
  </div>
</div>

      <div className="contract-grid">
        {CONTRACTS.map((contract, index) => (
          <Link
            key={contract.id}
            className="contract-tile"
            to={`/contracts/${contract.id}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div>
              <p className="badge">{contract.type}</p>
              <h3>{contract.label}</h3>
              <p>{contract.description}</p>
              <div className="contract-metrics">
                <div className="metric">
                  <span className="metric-value">{contract.totalCalls || 0}</span>
                  <span className="metric-label">Calls</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{contract.lastCall || "Never"}</span>
                  <span className="metric-label">Last used</span>
                </div>
              </div>
            </div>
           
            <span className="tile-link">Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ContractsPage;
