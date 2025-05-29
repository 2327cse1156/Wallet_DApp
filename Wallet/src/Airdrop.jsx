import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const Airdrop = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [publicKey, connection]);

  const requestAirdrop = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first.');
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Enter a valid amount of SOL.');
      return;
    }

    try {
      setLoading(true);
      const signature = await connection.requestAirdrop(
        publicKey,
        parsedAmount * LAMPORTS_PER_SOL
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'finalized'
      );

      toast.success(`Airdropped ${parsedAmount} SOL to ${publicKey.toBase58()}`);
      triggerConfetti();
      setAmount('');
      fetchBalance();
    } catch (error) {
      console.error('Airdrop failed:', error);
      if (error.message.includes('429')) {
        toast.error(
          "Airdrop rate limit reached. Try https://faucet.solana.com or use a VPN."
        );
      } else {
        toast.error('Airdrop failed. See console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600 dark:text-indigo-400">
        Solana Airdrop
      </h2>

      {publicKey && balance !== null && (
        <p className="text-sm text-gray-500 text-center mb-2 dark:text-gray-400">
          Current Balance: <strong>{balance.toFixed(3)} SOL</strong>
        </p>
      )}

      <input
        type="number"
        value={amount}
        placeholder="Amount in SOL"
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        disabled={loading}
        min="0"
        step="0.0001"
      />

      <button
        onClick={requestAirdrop}
        disabled={loading || !publicKey}
        className={`w-full py-2 px-4 rounded-lg transition duration-200 ${
          publicKey
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? 'Requesting Airdrop...' : 'Request Airdrop'}
      </button>
    </div>
  );
};

export default Airdrop;
