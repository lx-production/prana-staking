import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './config/wagmiConfig'
import { ThemeProvider } from './context/ThemeContext'
import { startSpinningFavicon } from './spinningFavicon'

// Create a client for React Query
const queryClient = new QueryClient()

// Start the spinning favicon animation
startSpinningFavicon();

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
) 