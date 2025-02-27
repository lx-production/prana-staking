import React from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from './components/ConnectWallet';
import PranaBalance from './components/PranaBalance';
import StakingForm from './components/StakingForm';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="container">
      <header className="header">
        <h1>PRANA Staking</h1>
        <ConnectWallet />
      </header>
      
      <main>
        {isConnected ? (
          <div className="card">
            <PranaBalance />
            <StakingForm />
          </div>
        ) : (
          <div className="card">
            <h2>Welcome to PRANA Staking</h2>
            <p>Connect your wallet to get started.</p>
          </div>
        )}
      </main>
      
      <footer>
        <p>© {new Date().getFullYear()} PRANA Protocol</p>
      </footer>
    </div>
  );
}

export default App; 