import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Vault Core",
    description:
      "Mint shares, track total assets, and route deposits into strategy managers.",
  },
  {
    title: "Strategies",
    description:
      "Route allocations into lending, liquidity, and income strategies with risk tiers.",
  },
  {
    title: "Governance + Fees",
    description:
      "Set managers, fees, and registry entries with explicit permissions.",
  },
];

function HomePage() {
  return (
    <section className="stack">
      <div className="hero">
        <div className="hero-text">
          <p className="eyebrow">Stacks Finance</p>
          <h1>Design, simulate, and ship contract flows.</h1>
          <p className="lede">
            This workspace is ready for contract calls, state reads, and
            governance configuration. Use the router to wire UI flows for each
            Clarity module.
          </p>
          <div className="hero-actions">
            <Link className="cta-button" to="/contracts">
              Explore contracts
            </Link>
            <Link className="ghost-button" to="/activity">
              View activity
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="stat">
            <p className="stat-label">Contracts</p>
            <p className="stat-value">10</p>
          </div>
          <div className="stat">
            <p className="stat-label">Strategies</p>
            <p className="stat-value">3</p>
          </div>
          <div className="stat">
            <p className="stat-label">Epoch</p>
            <p className="stat-value">3.2</p>
          </div>
        </div>
      </div>

      <div className="card-grid">
        {highlights.map((card, index) => (
          <article
            key={card.title}
            className="card"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
