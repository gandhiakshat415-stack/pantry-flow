'use client';

import { useState } from 'react';
import { analyzeRecipe, RecipeAnalysisResult } from './actions';
import { ClipboardList, CheckCircle2, XCircle, ShoppingCart } from 'lucide-react';

export default function RecipesPage() {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecipeAnalysisResult | null>(null);

  async function handleAnalyze() {
    if (!rawText.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeRecipe(rawText);
      setResult(res);
    } catch (e: any) {
      console.error(e);
      setResult({ available: [], missing: [], error: e.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!result || result.missing.length === 0) return;
    
    // Generate mock deep link
    const itemsParams = encodeURIComponent(result.missing.join(','));
    alert(`Redirecting to: instamart://cart?items=${itemsParams}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recipe Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">Paste your recipe ingredients below to instantly see what you have in your pantry and what you need to buy.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <label htmlFor="recipe" className="block text-sm font-medium text-gray-700 mb-2">
          Ingredients List
        </label>
        <textarea
          id="recipe"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g.&#10;2 cups milk&#10;1 tsp salt&#10;3 tomatoes"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !rawText.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <ClipboardList className="h-5 w-5 mr-2" />
            {loading ? 'Analyzing...' : 'Analyze Recipe'}
          </button>
        </div>
      </div>

      {result && result.error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          Error: {result.error}
        </div>
      )}

      {result && !result.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-green-800 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                In Your Pantry
              </h3>
            </div>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {result.available.length === 0 ? (
                <li className="px-4 py-4 text-sm text-gray-500 text-center">No matching items in your pantry.</li>
              ) : (
                result.available.map((item, idx) => (
                  <li key={idx} className="px-4 py-3 text-sm text-gray-700">{item}</li>
                ))
              )}
            </ul>
          </div>

          {/* Missing Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-red-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-red-800 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Missing Items
              </h3>
            </div>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto flex-1">
              {result.missing.length === 0 ? (
                <li className="px-4 py-4 text-sm text-gray-500 text-center">You have everything you need!</li>
              ) : (
                result.missing.map((item, idx) => (
                  <li key={idx} className="px-4 py-3 text-sm text-gray-700">{item}</li>
                ))
              )}
            </ul>
            {result.missing.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Export to Qcom Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
