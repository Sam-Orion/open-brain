'use client';

import { useState } from 'react';

export default function TestSharePage() {
  const [generateForm, setGenerateForm] = useState({ entityType: 'brain', entityId: '' });
  const [generateResult, setGenerateResult] = useState<any>(null);
  
  const [retrieveToken, setRetrieveToken] = useState('');
  const [retrieveResult, setRetrieveResult] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateResult({ status: 'generating...' });
    
    try {
      const res = await fetch('/api/share/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateForm),
      });
      const data = await res.json();
      setGenerateResult({ status: res.status, data });
    } catch (error: any) {
      setGenerateResult({ error: error.message });
    }
  };

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    setRetrieveResult({ status: 'retrieving...' });
    
    try {
      const res = await fetch(`/api/share/retrieve?token=${retrieveToken}`);
      const data = await res.json();
      setRetrieveResult({ status: res.status, data });
    } catch (error: any) {
      setRetrieveResult({ error: error.message });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 font-sans">
      <h1 className="text-3xl font-bold mb-4">🧪 Share Engine Testing Grounds</h1>
      
      {/* Generate API Test */}
      <section className="bg-gray-100 dark:bg-zinc-900 p-6 rounded-xl border dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">1. Generate Share Link (/api/share/generate)</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <select 
              value={generateForm.entityType}
              onChange={(e) => setGenerateForm({ ...generateForm, entityType: e.target.value })}
              className="w-full border p-2 rounded max-w-xs dark:bg-zinc-800"
            >
              <option value="brain">Entire Brain</option>
              <option value="thought">Specific Thought</option>
              <option value="tag">Specific Tag</option>
            </select>
          </div>
          
          {generateForm.entityType !== 'brain' && (
            <div>
              <label className="block text-sm font-medium mb-1">Entity ID (e.g. UUID for thought, '#tag' for tag)</label>
              <input 
                type="text" 
                value={generateForm.entityId}
                onChange={(e) => setGenerateForm({ ...generateForm, entityId: e.target.value })}
                placeholder={generateForm.entityType === 'tag' ? '#react' : 'uuid...'}
                className="w-full border p-2 rounded max-w-sm dark:bg-zinc-800"
                required
              />
            </div>
          )}
          
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Generate Token
          </button>
        </form>

        {generateResult && (
          <div className="mt-4 p-4 bg-black text-green-400 font-mono text-sm rounded overflow-auto max-h-64">
             <pre>{JSON.stringify(generateResult, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* Retrieve API Test */}
      <section className="bg-gray-100 dark:bg-zinc-900 p-6 rounded-xl border dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-emerald-600 dark:text-emerald-400">2. Retrieve Shared Content (/api/share/retrieve)</h2>
        <form onSubmit={handleRetrieve} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Share Token</label>
            <input 
              type="text" 
              value={retrieveToken}
              onChange={(e) => setRetrieveToken(e.target.value)}
              placeholder="e.g. abcde12345"
              className="w-full border p-2 rounded max-w-sm dark:bg-zinc-800"
              required
            />
          </div>
          
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">
            Retrieve Data
          </button>
        </form>

        {retrieveResult && (
          <div className="mt-4 p-4 bg-black text-orange-400 font-mono text-sm rounded overflow-auto max-h-96">
             <pre>{JSON.stringify(retrieveResult, null, 2)}</pre>
          </div>
        )}
      </section>

    </div>
  );
}
