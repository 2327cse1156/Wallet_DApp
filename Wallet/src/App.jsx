import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  UnsafeBurnerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { clusterApiUrl } from "@solana/web3.js";

import Airdrop from "./Airdrop";
import SolBalance from "./SolBalance";
import SignMessage from "./SignMessage";
import SendSol from "./SendSol";

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new UnsafeBurnerWalletAdapter(), // For quick dev testing
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
              <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
                Solana Faucet DApp
              </h1>

              <div className="flex justify-center gap-4 mb-6">
                <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 !text-white rounded-lg shadow-md transition-all duration-200" />
                <WalletDisconnectButton className="!bg-red-500 hover:!bg-red-600 !text-white rounded-lg shadow-md transition-all duration-200" />
              </div>

              <div className="space-y-6">
                <Airdrop />
                <SolBalance />
                <SendSol />
                <SignMessage />
              </div>

              <p className="mt-6 text-center text-gray-500 text-sm">
                Solana Faucet DApp &mdash; Devnet
              </p>
            </div>
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
