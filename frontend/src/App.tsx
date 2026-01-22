import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import ContractDetailPage from "./pages/ContractDetail";
import ContractsPage from "./pages/Contracts";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">SF</span>
          <div>
            <p className="brand-title">Stacks Finance Lab</p>
            <p className="brand-subtitle">Contract interaction hub</p>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
            to="/"
            end
          >
            Overview
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
            to="/contracts"
          >
            Contracts
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
            to="/activity"
          >
            Activity
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
          <Route
            path="/activity"
            element={
              <section className="panel">
                <h2>Activity feed</h2>
                <p>
                  Connect a wallet and start simulating calls. Once you wire in
                  Clarinet or Hiro API, recent deployments and transactions can
                  appear here.
                </p>
              </section>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Prototype UI for vaults, strategies, and governance modules.</p>
        <button className="cta-button" type="button">
          Connect wallet
        </button>
      </footer>
    </div>
  );
}

export default App;
