// src/components/TestServerActions.tsx
'use client';

import React, { useState } from 'react';
import {
  checkUrlPresence,
  checkCompanyPresence,
  semanticSearchUrl,
  semanticSearchCompany,
  ragSearchCompany,
  ragSearchUrl,
  getCompanyChatbotWelcome,
  getStringEmbedding,
  getDocumentByUrl,
  getCompanyDocuments
} from '@/lib/actions';

export function TestServerActions() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('url');

  // Form states
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      switch (action) {
        case 'checkUrl':
          result = await checkUrlPresence({ url });
          break;
        case 'checkCompany':
          result = await checkCompanyPresence({ companyName });
          break;
        case 'semanticSearchUrl':
          result = await semanticSearchUrl({ url, searchQuery });
          break;
        case 'semanticSearchCompany':
          result = await semanticSearchCompany({ companyName, searchQuery });
          break;
        case 'ragSearchCompany':
          result = await ragSearchCompany({ companyName, query: searchQuery });
          break;
        case 'ragSearchUrl':
          result = await ragSearchUrl({ url, query: searchQuery });
          break;
        case 'chatbotWelcome':
          result = await getCompanyChatbotWelcome({ companyName });
          break;
        case 'stringEmbedding':
          result = await getStringEmbedding({ content });
          break;
        case 'documentByUrl':
          result = await getDocumentByUrl({ url });
          break;
        case 'companyDocuments':
          result = await getCompanyDocuments({ companyName });
          break;
      }
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Test Server Actions</h1>

        <div className="mb-6">
          <div className="flex border-b">
            {['url', 'company', 'search', 'other'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Tests
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleSubmit('checkUrl')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Check URL Presence
                    </button>
                    <button
                      onClick={() => handleSubmit('documentByUrl')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Get Document
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Enter Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleSubmit('checkCompany')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Check Company
                    </button>
                    <button
                      onClick={() => handleSubmit('chatbotWelcome')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Get Welcome Message
                    </button>
                    <button
                      onClick={() => handleSubmit('companyDocuments')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Get Documents
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Enter Search Query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleSubmit('semanticSearchUrl')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Semantic Search URL
                    </button>
                    <button
                      onClick={() => handleSubmit('ragSearchUrl')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      RAG Search URL
                    </button>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Enter Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleSubmit('semanticSearchCompany')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Semantic Search Company
                    </button>
                    <button
                      onClick={() => handleSubmit('ragSearchCompany')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      RAG Search Company
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'other' && (
              <div className="space-y-4">
                <div>
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Enter content for embedding"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleSubmit('stringEmbedding')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Get String Embedding
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          {loading && <p className="text-gray-600">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {results && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
