'use client';

import { useState } from 'react';
import { createHousehold } from './actions';
import { Home, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const result = await createHousehold(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (e: any) {
      if (e.message && e.message !== 'NEXT_REDIRECT') {
        setError(e.message || 'An error occurred');
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Home className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to PantryFlow!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get started by setting up your household.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Household Name
              </label>
              <p className="text-xs text-gray-500 mb-2">
                e.g. "The Smith Residence" or "Apartment 4B"
              </p>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="My Awesome Home"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 border px-3 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : 'Create Household'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
