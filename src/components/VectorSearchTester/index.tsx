"use client"
import React, { useState } from 'react';

const VectorSearchTester = () => {
  const [companyName, setCompanyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = `
    query($companyName: String!, $query: String!) {
      vectorRagSearchCompany(companyName: $companyName, query: $query)
    }
  `;

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            companyName,
            query: searchQuery
          }
        }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        setError(result.error || 'An error occurred');
        return;
      }
      
      if (result.errors) {
        setError(Array.isArray(result.errors) 
          ? result.errors.map((e: any) => e.message).join('\n') 
          : JSON.stringify(result.errors, null, 2)
        );
      } else {
        setResponse(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Vector Search Test</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-bold text-red-700 mb-2">Error:</h3>
            <pre className="whitespace-pre-wrap text-sm text-red-600">
              {error}
            </pre>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter company name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Search Query</label>
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-md h-24"
              placeholder="Enter your search query..."
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading || !companyName.trim() || !searchQuery.trim()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          {response && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-bold text-green-700 mb-2">Response:</h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VectorSearchTester;