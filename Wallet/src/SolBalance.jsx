import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useEffect, useState, useCallback } from "react";

const SolBalance = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
      setError(null);
    } catch (error) {
      console.error("Failed to get balance:", error);
      setError("Failed to fetch balance.");
    } finally {
      setLoading(false);
    }
  }, [connected, connection, publicKey]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        SOL Balance
      </h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <p
        aria-live="polite"
        className="text-2xl font-mono mb-4 text-gray-900 dark:text-gray-200"
      >
        {loading
          ? "Loading..."
          : connected
          ? balance !== null
            ? `${balance.toFixed(3)} SOL`
            : "No balance data"
          : "Wallet not connected"}
      </p>

      <button
        onClick={fetchBalance}
        disabled={loading || !connected}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition flex items-center justify-center gap-2 mx-auto"
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        )}
        Refresh Balance
      </button>
    </div>
  );
};

export default SolBalance;
