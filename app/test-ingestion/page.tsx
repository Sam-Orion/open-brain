'use client';

import { useState, useEffect } from 'react';

export default function TestIngestionPage() {
  const [url, setUrl] = useState('');
  const [manualTags, setManualTags] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);

  // Automatically poll the backend if the thought is not done
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (response && response.id && response.status !== 'done' && response.status !== 'failed') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/thoughts/${response.id}`);
          if (res.ok) {
            const data = await res.json();
            setPollCount(prev => prev + 1);
            setResponse(data);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    setPollCount(0);

    try {
      const tagsArray = manualTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch('/api/thoughts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          manualTags: tagsArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      case 'failed': return 'bg-red-950 text-red-400 border border-red-800';
      case 'processing': return 'bg-amber-950 text-amber-400 border border-amber-800';
      default: return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-200 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
            Ingestion Pipeline Test
          </h1>
          <p className="text-neutral-400 mt-2">
            Submit a URL to Supermemory and view the mapped JSON result. 
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Manual Tags (comma separated)</label>
            <input
              type="text"
              value={manualTags}
              onChange={(e) => setManualTags(e.target.value)}
              placeholder="AI, Development, NextJS"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
              loading 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-900 hover:bg-white active:scale-[0.98]'
            }`}
          >
            {loading ? 'Processing through Supermemory...' : 'Ingest URL'}
          </button>
        </form>

        {error && (
          <div className="bg-red-950/50 border border-red-900 p-4 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {response && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-300">Document Status</span>
                <div className="flex items-center gap-3">
                  {response.status === 'processing' && (
                    <span className="text-xs text-neutral-500">
                      Polled {pollCount}x
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(response.status)}`}>
                    {response.status?.toUpperCase() || 'UNKNOWN'}
                    {response.supermemory_status && response.supermemory_status !== response.status && (
                      <span className="opacity-70"> ({response.supermemory_status})</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Error Details Banner */}
              {response.status === 'failed' && (
                <div className="px-4 py-3 bg-red-950/30 border-b border-red-900/50">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-sm mt-0.5">⚠</span>
                    <div>
                      <p className="text-sm font-medium text-red-400">Processing Failed</p>
                      <p className="text-xs text-red-400/80 mt-1">
                        {response.error_details || 'No error details available from Supermemory.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stale Warning */}
              {response.stale && (
                <div className="px-4 py-3 bg-amber-950/30 border-b border-amber-900/50">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 text-sm mt-0.5">⏳</span>
                    <div>
                      <p className="text-sm font-medium text-amber-400">Document Processing Stale</p>
                      <p className="text-xs text-amber-400/80 mt-1">
                        This document has been processing for over 10 minutes. It may be stuck on Supermemory&apos;s end.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Response */}
              <pre className="p-4 overflow-x-auto text-sm text-neutral-300 leading-relaxed font-mono">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
