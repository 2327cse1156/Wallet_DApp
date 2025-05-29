import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import toast from "react-hot-toast";

const SendSol = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const onSend = async () => {
    if (!publicKey) {
      toast.error("Connect your wallet first!");
      return;
    }

    if (!recipient) {
      toast.error("Please enter a recipient address.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Enter a valid amount of SOL to send.");
      return;
    }

    let toPubkey;
    try {
      toPubkey = new PublicKey(recipient);
    } catch {
      toast.error("Invalid recipient address.");
      return;
    }

    const lamports = Math.round(Number(amount) * LAMPORTS_PER_SOL);

    try {
      setSending(true);

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports,
        })
      );

      // Get recent blockhash & last valid block height for confirmation
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction for user approval
      const signature = await sendTransaction(transaction, connection);

      toast.success(`Transaction sent! Signature: ${signature}`);

      // Confirm transaction with strong commitment
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "finalized"
      );

      toast.success("Transaction confirmed!");

      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error(error);
      toast.error(`Transaction failed: ${error?.message || error}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">
        Send SOL
      </h2>

      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full mb-4 p-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={sending}
      />

      <input
        type="number"
        placeholder="Amount in SOL"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.0001"
        className="w-full mb-6 p-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={sending}
      />

      <button
        onClick={onSend}
        disabled={sending}
        className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 ${
          sending
            ? "bg-indigo-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {sending ? "Sending..." : "Send SOL"}
      </button>
    </div>
  );
};

export default SendSol;
