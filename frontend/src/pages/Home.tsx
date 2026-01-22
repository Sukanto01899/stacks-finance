import { Link } from "react-router-dom";

const markets = [
  { name: "STX Vault", apy: "6.4%", liquidity: "$12.4M", utilization: "68%" },
  { name: "sBTC Vault", apy: "4.1%", liquidity: "$5.7M", utilization: "52%" },
  { name: "USDA Vault", apy: "8.9%", liquidity: "$9.2M", utilization: "71%" },
];

function HomePage() {
  return (
    <section className="stack">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Supply, borrow, and route capital.</h1>
          <p className="lede">
            Track vault health, yield, and strategy allocation in one place.
          </p>
        </div>
        <div className="balance-card">
          <p className="balance-label">Total supplied</p>
          <p className="balance-value">$1,482,930</p>
          <p className="balance-meta">Net APY 6.2% · Health 1.84</p>
          <div className="balance-actions">
            <button className="cta-button" type="button">
              Deposit
            </button>
            <button className="ghost-button" type="button">
              Borrow
            </button>
          </div>
        </div>
      </header>

      <div className="card-grid">
        <article className="card">
          <h3>Vault positions</h3>
          <p className="lede">
            Three active positions with automated rebalancing enabled.
          </p>
          <div className="metric-row">
            <span>Liquidity deployed</span>
            <strong>$642,210</strong>
          </div>
          <div className="metric-row">
            <span>Pending rewards</span>
            <strong>+ $12,480</strong>
          </div>
        </article>
        <article className="card">
          <h3>Strategy allocation</h3>
          <p className="lede">
            Lending 45% · Liquidity 35% · Income 20%.
          </p>
          <div className="progress">
            <span style={{ width: "45%" }} />
          </div>
          <div className="progress muted">
            <span style={{ width: "35%" }} />
          </div>
          <div className="progress warm">
            <span style={{ width: "20%" }} />
          </div>
        </article>
        <article className="card">
          <h3>Governance</h3>
          <p className="lede">3 active proposals · 2 days to close.</p>
          <div className="metric-row">
            <span>Participation</span>
            <strong>82%</strong>
          </div>
          <Link className="ghost-button" to="/activity">
            Review proposals
          </Link>
        </article>
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Markets</h2>
            <p className="lede">
              Key vaults configured for supply and borrow flows.
            </p>
          </div>
          <Link className="ghost-button" to="/contracts">
            Manage contracts
          </Link>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>Market</span>
            <span>APY</span>
            <span>Liquidity</span>
            <span>Utilization</span>
            <span />
          </div>
          {markets.map((market) => (
            <div key={market.name} className="table-row">
              <span>{market.name}</span>
              <span className="positive">{market.apy}</span>
              <span>{market.liquidity}</span>
              <span>{market.utilization}</span>
              <button className="ghost-button" type="button">
                Supply
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomePage;
