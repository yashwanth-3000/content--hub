// src/app/test/graphql/actions.ts
'use server';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import {
  CHECK_URL_PRESENCE,
  CHECK_COMPANY_PRESENCE,
  SEMANTIC_SEARCH_URL,
  SEMANTIC_SEARCH_COMPANY,
  RAG_SEARCH_COMPANY,
  RAG_SEARCH_URL,
  GET_COMPANY_CHATBOT_WELCOME,
  GET_STRING_EMBEDDING,
  GET_DOCUMENT_BY_URL,
  GET_COMPANY_DOCUMENTS
} from '@/lib/queries';

// Create the http link
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HYPERMODE_API_ENDPOINT,
});

// Create the auth link
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.HYPERMODE_API_TOKEN}`,
    }
  };
});

// Create the Apollo Client with auth
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const checkUrlPresence = async ({ url }: { url: string }) => {
  const { data, errors } = await client.query({
    query: CHECK_URL_PRESENCE,
    variables: { url },
  });
  return { data, errors };
};

export const checkCompanyPresence = async ({ companyName }: { companyName: string }) => {
  const { data, errors } = await client.query({
    query: CHECK_COMPANY_PRESENCE,
    variables: { companyName },
  });
  return { data, errors };
};

export const semanticSearchUrl = async ({ 
  url, 
  searchQuery 
}: { 
  url: string;
  searchQuery: string;
}) => {
  const { data, errors } = await client.query({
    query: SEMANTIC_SEARCH_URL,
    variables: { url, searchQuery },
  });
  return { data, errors };
};

export const semanticSearchCompany = async ({ 
  companyName, 
  searchQuery 
}: { 
  companyName: string;
  searchQuery: string;
}) => {
  const { data, errors } = await client.query({
    query: SEMANTIC_SEARCH_COMPANY,
    variables: { companyName, searchQuery },
  });
  return { data, errors };
};

export const ragSearchCompany = async ({ 
  companyName, 
  query 
}: { 
  companyName: string;
  query: string;
}) => {
  const { data, errors } = await client.query({
    query: RAG_SEARCH_COMPANY,
    variables: { companyName, query },
  });
  return { data, errors };
};

export const ragSearchUrl = async ({ 
  url, 
  query 
}: { 
  url: string;
  query: string;
}) => {
  const { data, errors } = await client.query({
    query: RAG_SEARCH_URL,
    variables: { url, query },
  });
  return { data, errors };
};

export const getCompanyChatbotWelcome = async ({ companyName }: { companyName: string }) => {
  const { data, errors } = await client.query({
    query: GET_COMPANY_CHATBOT_WELCOME,
    variables: { companyName },
  });
  return { data, errors };
};

export const getStringEmbedding = async ({ content }: { content: string }) => {
  const { data, errors } = await client.query({
    query: GET_STRING_EMBEDDING,
    variables: { content },
  });
  return { data, errors };
};

export const getDocumentByUrl = async ({ url }: { url: string }) => {
  const { data, errors } = await client.query({
    query: GET_DOCUMENT_BY_URL,
    variables: { url },
  });
  return { data, errors };
};

export const getCompanyDocuments = async ({ companyName }: { companyName: string }) => {
  const { data, errors } = await client.query({
    query: GET_COMPANY_DOCUMENTS,
    variables: { companyName },
  });
  return { data, errors };
};