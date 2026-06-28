import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi';
import { polygon } from 'wagmi/chains';

const ConnectWallet = () => {
  const connect = useConnect();
  const connectors = useConnectors();
  const { address, isConnected } = useConnection();
  const disconnect = useDisconnect();

  // Find the injected connector (MetaMask)
  const injectedConnector = connectors.find(c => c.id === 'injected');

  if (isConnected) {
    return (
      <div className="wallet-container">
        <span className="address">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        <button 
          className="btn-disconnect"
          onClick={() => disconnect.mutate()}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn-primary"
      onClick={() => connect.mutate({ connector: injectedConnector, chainId: polygon.id })}
      disabled={connect.isPending || !injectedConnector}
    >
      {connect.isPending ? (
        <>
          <span className="loading"></span>
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

export default ConnectWallet; 