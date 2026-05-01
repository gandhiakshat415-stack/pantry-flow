import { getUserProfile } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  if (!profile || !profile.household_id) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <LayoutDashboard className="h-6 w-6 text-blue-600 mr-2" />
                <span className="font-bold text-xl text-gray-900">PantryFlow</span>
              </div>
              <div className="hidden sm:flex space-x-4 ml-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Inventory
                </Link>
                <Link href="/dashboard/requests" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Requests
                </Link>
                <Link href="/dashboard/recipes" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Recipes
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile.name}
              </span>
              <form action={logout}>
                <button type="submit" className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Log Out">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
