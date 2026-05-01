'use client';

import { ShoppingCart } from 'lucide-react';

export default function ExportRequestsButton({ activeItems }: { activeItems: string[] }) {
  const handleExport = () => {
    if (activeItems.length === 0) return;
    const searchString = activeItems.join(' ');
    const itemsParams = encodeURIComponent(searchString);
    window.open(`https://blinkit.com/s/?q=${itemsParams}`, '_blank');
  };

  if (activeItems.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mb-4"
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      Export Active to Blinkit
    </button>
  );
}
