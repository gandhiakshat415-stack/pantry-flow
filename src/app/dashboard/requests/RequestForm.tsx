'use client';
import { useRef, useState } from 'react';
import { createRequest } from './actions';
import { Send } from 'lucide-react';

export default function RequestForm() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createRequest(formData);
    formRef.current?.reset();
    setLoading(false);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-2">
      <input 
        type="text" 
        name="raw_text" 
        required 
        placeholder="What is finished? (e.g. Milk, Bread)" 
        className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-12 px-4 border"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="inline-flex items-center justify-center px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <Send className="h-5 w-5 mr-2" />
        {loading ? 'Sending...' : 'Send Request'}
      </button>
    </form>
  );
}
