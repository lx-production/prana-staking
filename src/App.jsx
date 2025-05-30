import React from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from './components/ConnectWallet';
import PranaBalance from './components/PranaBalance';
import StakingForm from './components/StakingForm';
import ActiveStakes from './components/ActiveStakes';
import InterestContractBalance from './components/InterestContractBalance';
import StakingContractBalance from './components/StakingContractBalance';
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="container">
      <header className="header">
        <h1 style={{ fontWeight: '800' }}>PRANA Staking</h1>        
        <ConnectWallet />
      </header>
      
      <div className="theme-slogan-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="slogan">
          <h4>Engineered to outperform</h4>
        </div>
        <ThemeSwitcher />
      </div>
      
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
      
      <footer className="footer">
        <p>©2025 PRANA Protocol</p>
        <a
          href="https://polygonscan.com/address/0x714425A4F4d624ef83fEff810a0EEC30B0847868"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Staking Contract
        </a>
        <a
          href="https://polygonscan.com/address/0x1DE1E9BEF781fb3440C2c22E8ca1bF61BD26f69d#tokentxns"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Interest Contract
        </a>
        <div className="footer-links">          
          <a 
            href="https://github.com/lx-production/prana-staking"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github"
          >
            <svg
              height="20"
              width="20"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App; 