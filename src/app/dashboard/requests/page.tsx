import { getUserProfile, createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import RequestForm from './RequestForm';
import RequestStatusButtons from './RequestStatusButtons';

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Pending</span>;
  }
  if (status === 'in_cart') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Cart</span>;
  }
  if (status === 'fulfilled') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Fulfilled</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
  }).format(date);
};

export default async function RequestsPage() {
  const { user, profile } = await getUserProfile();

  if (!user || !profile || !profile.household_id) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch requests and users concurrently
  const [requestsRes, usersRes] = await Promise.all([
    supabase.from('requests').select('*').eq('household_id', profile.household_id).order('created_at', { ascending: false }),
    supabase.from('users').select('id, name').eq('household_id', profile.household_id)
  ]);

  const requests = requestsRes.data || [];
  const usersMap = new Map((usersRes.data || []).map(u => [u.id, u.name]));

  const isHousehelp = profile.role === 'househelp';
  const isAdminOrMember = profile.role === 'admin' || profile.role === 'member';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Requests Feed</h1>
        <p className="mt-1 text-sm text-gray-500">Manage items requested for the household.</p>
      </div>

      {isHousehelp && <RequestForm />}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No requests found.
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {usersMap.get(request.created_by) || 'Unknown User'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {request.raw_text}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <StatusBadge status={request.status} />
                      <p className="flex items-center text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {isAdminOrMember && (
                    <div className="ml-4 flex-shrink-0">
                      <RequestStatusButtons requestId={request.id} currentStatus={request.status} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
