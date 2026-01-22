import { useCallback, useEffect, useMemo, useState } from "react";
import { showConnect } from "@stacks/connect";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import ContractDetailPage from "./pages/ContractDetail";
import ContractsPage from "./pages/Contracts";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import { networkLabel, STACKS_NETWORK } from "./lib/stacks";
import { userSession } from "./wallet/stacksSession";

function App() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [bns, setBns] = useState("");
  const isMainnet = STACKS_NETWORK === "mainnet";

  const appDetails = useMemo(
    () => ({
      name: "Stacks Finance",
      icon: "https://stacks.co/favicon.ico",
    }),
    [],
  );

  const resolveAddress = useCallback((userData: any) => {
    const stxAddress = userData?.profile?.stxAddress;
    if (typeof stxAddress === "string") {
      return stxAddress;
    }
    if (STACKS_NETWORK === "mainnet") {
      return stxAddress?.mainnet ?? userData?.profile?.stxAddresses?.mainnet;
    }
    return stxAddress?.testnet ?? userData?.profile?.stxAddresses?.testnet;
  }, []);

  const getBns = useCallback(async (stxAddress: string) => {
    const bnsNetwork = isMainnet ? "mainnet" : "testnet";
    const response = await fetch(
      `https://api.bnsv2.com/${bnsNetwork}/names/address/${stxAddress}/valid`,
    );
    const data = await response.json();
    return data?.names?.[0]?.full_name ?? "";
  }, [isMainnet]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = resolveAddress(userData);
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
      }
    }
  }, [resolveAddress]);

  const handleConnect = useCallback(async () => {
    if (isConnecting) {
      return;
    }
    setIsConnecting(true);
    try {
      showConnect({
        appDetails,
        userSession,
        onFinish: async () => {
          const userData = userSession.loadUserData();
          const address = resolveAddress(userData);
          if (address) {
            const bnsName = await getBns(address);
            setWalletAddress(address);
            setBns(bnsName);
            setIsConnected(true);
          }
          setIsConnecting(false);
        },
        onCancel: () => {
          setIsConnecting(false);
        },
      });
    } catch (error) {
      setIsConnecting(false);
    }
  }, [appDetails, getBns, isConnecting, resolveAddress]);

  const handleDisconnect = useCallback(() => {
    userSession.signUserOut();
    setIsConnected(false);
    setWalletAddress(null);
    setBns("");
  }, []);

  const walletLabel = useMemo(() => {
    if (!isConnected) {
      return null;
    }
    if (bns) {
      return bns;
    }
    if (!walletAddress) {
      return "Connected";
    }
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [bns, isConnected, walletAddress]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">SF</span>
          <div>
            <p className="brand-title">Stacks Finance</p>
            <p className="brand-subtitle">Protocol control center</p>
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
        <div className="header-actions">
          <span className="network-pill">{networkLabel}</span>
          {isConnected ? (
            <div className="wallet-pill">
              <span>{walletLabel}</span>
              <button
                className="ghost-button"
                type="button"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button className="cta-button" type="button" onClick={handleConnect}>
              {isConnecting ? "Connecting..." : "Connect wallet"}
            </button>
          )}
        </div>
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
        <p>Borrow, supply, and route capital with Stacks-native strategies.</p>
        <button className="ghost-button" type="button">
          View risk dashboard
        </button>
      </footer>
    </div>
  );
}

export default App;
