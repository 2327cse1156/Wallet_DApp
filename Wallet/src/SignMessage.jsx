import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { useState } from 'react';
import toast from 'react-hot-toast';

const SignMessage = () => {
  const { publicKey, signMessage } = useWallet();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState(null);

  const onClick = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!signMessage) {
      toast.error("This wallet does not support message signing.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message to sign.");
      return;
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);

      toast.success(`Message signed successfully!`, { duration: 2000 });
      setSignature(signatureBase58);
      setMessage('');
    } catch (error) {
      console.error("Signing failed:", error);
      toast.error("Failed to sign message.");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-10 flex justify-center">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Sign a Message
        </h2>
        <input
          type="text"
          placeholder="Enter your message"
          aria-label="Message to sign"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        <button
          onClick={onClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-base transition duration-200"
        >
          Sign Message
        </button>

        {signature && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md break-all text-sm">
            <p><strong>Signature (Base58):</strong></p>
            <p>{signature}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignMessage;
