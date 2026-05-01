'use client';
import { useState } from 'react';
import { updateRequestStatus } from './actions';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function RequestStatusButtons({ requestId, currentStatus }: { requestId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  async function handleStatus(status: 'pending' | 'in_cart' | 'fulfilled') {
    setLoading(true);
    await updateRequestStatus(requestId, status);
    setLoading(false);
  }

  if (currentStatus === 'fulfilled') {
    return null; // No actions for fulfilled
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'pending' && (
        <button
          onClick={() => handleStatus('in_cart')}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          In Cart
        </button>
      )}
      <button
        onClick={() => handleStatus('fulfilled')}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Fulfilled
      </button>
    </div>
  );
}
