import { createClient } from '@/utils/supabase/server';
import AddItemModal from './AddItemModal';
import { Package, AlertCircle, CheckCircle2, CircleDashed } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name');

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 shadow-sm">
        Error loading inventory: {error.message}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Full
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Low
          </span>
        );
      case 'empty':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <CircleDashed className="w-3 h-3 mr-1" /> Empty
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all the items in your household pantry.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <AddItemModal />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(!inventory || inventory.length === 0) ? (
          <div className="col-span-full bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new item to your inventory.
            </p>
          </div>
        ) : (
          inventory.map((item) => (
            <div key={item.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 transition-all hover:shadow-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 truncate pr-2">
                    {item.name}
                  </h3>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-500">Quantity</span>
                    <span className="text-gray-900 font-semibold">{item.quantity} {item.unit || ''}</span>
                  </div>
                  {item.category && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-500">Category</span>
                      <span className="text-gray-900">{item.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
