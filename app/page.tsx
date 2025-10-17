'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (flavor: string) => {
    setLoading(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1, flavor }),
    });

    const data = await res.json();
    if (data.url) {
      const stripe = await stripePromise;
      window.location.href = data.url;
    } else {
      console.error('Checkout failed', data);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 p-8">
      <h1 className="text-4xl font-bold mb-6">🥟 Digital Empanada Prints</h1>
      <p className="mb-4 italic text-gray-600">Never frozen, always digital.</p>
      <div className="flex gap-4">
        <button
          onClick={() => handleCheckout('Beef')}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Buy Beef Token 🥩
        </button>
        <button
          onClick={() => handleCheckout('Chicken')}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Buy Chicken Token 🐔
        </button>
      </div>
    </main>
  );
}
