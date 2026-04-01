'use client';

import { useState } from 'react';
import { getSidebarTags } from '@/actions/getSidebarTags';

export default function TestSearchPage() {
  const [semanticQuery, setSemanticQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTag, setFilterTag] = useState('');
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch(`/api/thoughts/search?q=${encodeURIComponent(semanticQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResponse({ type: 'Semantic Search Results', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      let url = '/api/thoughts?';
      if (filterType) url += `type=${encodeURIComponent(filterType)}&`;
      if (filterTag) url += `tag=${encodeURIComponent(filterTag)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResponse({ type: 'Sidebar Filter Results', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTagsAction = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const tags = await getSidebarTags();
      setResponse({ type: 'Server Action Tags', data: tags });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-200 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
            Search & Filtering Pipeline Test
          </h1>
          <p className="text-neutral-400 mt-2">
            Test the Semantic Search, Sidebar Exact Filtering, and tags Server Action.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Semantic Search */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-neutral-100">Semantic Search</h2>
            <form onSubmit={handleSemanticSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Query string</label>
                <input
                  type="text"
                  required
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  placeholder="e.g. /react >youtube state management"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-neutral-100 text-neutral-900 hover:bg-white active:scale-[0.98] rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50"
              >
                Send Request
              </button>
            </form>
          </div>

          {/* Sidebar Filtering */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-neutral-100">Sidebar Filtering API</h2>
            <form onSubmit={handleSidebarFilter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-neutral-300">Type (=)</label>
                   <input
                     type="text"
                     value={filterType}
                     onChange={(e) => setFilterType(e.target.value)}
                     placeholder="article or youtube"
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-neutral-300">Tag (contains)</label>
                   <input
                     type="text"
                     value={filterTag}
                     onChange={(e) => setFilterTag(e.target.value)}
                     placeholder="react or nextjs"
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                   />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-neutral-100 text-neutral-900 hover:bg-white active:scale-[0.98] rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50"
              >
                Send Request
              </button>
            </form>
          </div>
          
          {/* Tags Server Action */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl md:col-span-2 flex flex-col items-center justify-center space-y-4">
             <h2 className="text-xl font-semibold text-neutral-100">Sidebar Tags Server Action</h2>
             <p className="text-sm text-neutral-400 text-center">Fetches the top 10 most used tags based on users active thoughts directly without an API route.</p>
             <button
               onClick={fetchTagsAction}
               disabled={loading}
               className="px-6 py-2 bg-neutral-100 text-neutral-900 hover:bg-white active:scale-[0.98] rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50"
             >
               Load Top 10 Tags
             </button>
          </div>

        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900 p-4 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {response && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mt-8">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-300">{response.type}</span>
            </div>
            <pre className="p-4 max-h-[500px] overflow-y-auto text-sm text-neutral-300 leading-relaxed font-mono">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
