import React from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from './components/ConnectWallet';
import PranaBalance from './components/PranaBalance';
import StakingForm from './components/StakingForm';
import ActiveStakes from './components/ActiveStakes';
import InterestContractBalance from './components/InterestContractBalance';
import StakingContractBalance from './components/StakingContractBalance';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="container">
      <header className="header">
        <h1>PRANA Staking - Heo Đất PRANA 3.0</h1>        
        <ConnectWallet />
      </header>
      
      <main>
        <div className="interest-balance-container">
          <div className="balance-half">
            <InterestContractBalance />
          </div>
          <div className="balance-half">
            <StakingContractBalance />
          </div>
        </div>
        
        {isConnected ? (
          <div className="card">
            <PranaBalance />
            <StakingForm />
            <ActiveStakes />
          </div>
        ) : (
          <div className="card">
            <h2>Welcome to PRANA Staking - Heo Đất PRANA 3.0</h2>
            <p>Connect your wallet to get started. Kết nối Ví của bạn để bắt đầu.</p>
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