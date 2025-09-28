import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useState } from "react";

export function WalletStatus() {
  const account = useCurrentAccount();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: balance } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    }
  );

  if (!account) {
    return (
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/60 rounded-2xl p-6 shadow-2xl">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-white/80">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/60 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Wallet Status</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/80 hover:text-white transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/80">Address:</span>
          <span className="text-white font-mono text-sm">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/80">Balance:</span>
          <span className="text-white font-semibold">
            {balance ? (Number(balance.totalBalance) / 1_000_000_000).toFixed(4) : "Loading..."} SUI
          </span>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-700/60">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Full Address:</span>
                <button
                  onClick={() => navigator.clipboard.writeText(account.address)}
                  className="text-white/80 hover:text-white transition-colors text-xs"
                >
                  Copy
                </button>
              </div>
              <div className="text-white/90 font-mono text-xs break-all">
                {account.address}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

