import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const alchemyUrl = import.meta.env.VITE_ALCHEMY_POLYGON_MAIN;

if (!alchemyUrl) {
  throw new Error('Missing VITE_ALCHEMY_POLYGON_MAIN environment variable');
}

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [injected()],
  transports: {
    [polygon.id]: http(alchemyUrl),
  },
});
