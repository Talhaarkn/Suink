import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { 
  createNetworkConfig,
  SuiClientProvider, 
  useSuiClientContext,
  WalletProvider 
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki';
import { getFullnodeUrl } from '@mysten/sui/client';
import App from './App.tsx'
import '@mysten/dapp-kit/dist/index.css'
import './index.css'

const queryClient = new QueryClient();

// Create network config with Enoki support
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// Register Enoki wallets component
function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    if (!isEnokiNetwork(network)) return;

    const { unregister } = registerEnokiWallets({
      apiKey: import.meta.env.VITE_ENOKI_PUBLIC_KEY || 'enoki_public_6e46f0c830405ece028b6c6d7a938b73',
      providers: {
        google: {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '665551195395-qu5pu13dkt5lj3oh0g12u28tks711p3o.apps.googleusercontent.com',
          // Force account selection on every login
          extraParams: {
            prompt: 'select_account',
          },
        },
      },
      client: client as any,
      network,
    });

    return unregister;
  }, [client, network]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <RegisterEnokiWallets />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)