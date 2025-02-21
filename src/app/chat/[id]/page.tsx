// ChatPage.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatbotInterface } from '@/components/ChatbotInterface';

interface Company {
  id: string;
  properties: {
    name: string;
    description: string;
    logo_urls?: string | string[];
    elementId?: string;
    created_at?: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const companyName = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/test-neo4j');
        const data = await response.json();
        
        if (!data.companies || !Array.isArray(data.companies)) {
          console.error('Invalid data format received:', data);
          setCompany(null);
          return;
        }

        const decodedCompanyName = decodeURIComponent(companyName).toLowerCase();
        const foundCompany = data.companies.find((c: Company) => 
          c.properties.name.toLowerCase() === decodedCompanyName
        );

        setCompany(foundCompany || null);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyName) {
      fetchCompanies();
    }
  }, [companyName]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-white">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-950 gap-4">
        <p className="text-white">Company not found</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-950">
      <div className="h-full max-w-6xl mx-auto p-4">
        <ChatbotInterface
          companyName={company.properties.name}
          companyDescription={company.properties.description}
        />
      </div>
    </div>
  );
}