// src/lib/queries.ts
import { gql } from '@apollo/client';

export const CHECK_URL_PRESENCE = gql`
  query CheckUrlPresence($url: String!) {
    isUrlPresent(url: $url)
  }
`;

export const CHECK_COMPANY_PRESENCE = gql`
  query CheckCompanyPresence($companyName: String!) {
    isCompanyPresent(companyName: $companyName)
  }
`;

export const SEMANTIC_SEARCH_URL = gql`
  query SemanticSearchUrl($url: String!, $searchQuery: String!) {
    semanticSearchUrl(url: $url, query: $searchQuery) {
      url
      content
      score
    }
  }
`;

export const SEMANTIC_SEARCH_COMPANY = gql`
  query SemanticSearchCompany($companyName: String!, $searchQuery: String!) {
    semanticSearchCompany(companyName: $companyName, query: $searchQuery) {
      url
      content
      score
    }
  }
`;

export const RAG_SEARCH_COMPANY = gql`
  query RagSearchCompany($companyName: String!, $query: String!) {
    vectorRagSearchCompany(companyName: $companyName, query: $query)
  }
`;


export const RAG_SEARCH_URL = gql`
  query RagSearchUrl($url: String!, $query: String!) {
    vectorRagSearchUrl(url: $url, query: $query) {
      text
      context {
        url
        content
        score
      }
    }
  }
`;

export const GET_COMPANY_CHATBOT_WELCOME = gql`
  query GetChatbotWelcome($companyName: String!) {
    generateChatbotWelcome(companyName: $companyName)
  }
`;

export const GET_STRING_EMBEDDING = gql`
  query GetStringEmbedding($content: String!) {
    getStringEmbedding(content: $content)
  }
`;

export const GET_DOCUMENT_BY_URL = gql`
  query GetDocumentByUrl($url: String!) {
    document(url: $url) {
      url
      content
      chunks {
        content
        embedding
      }
    }
  }
`;

export const GET_COMPANY_DOCUMENTS = gql`
  query GetCompanyDocuments($companyName: String!) {
    company(name: $companyName) {
      name
      documents {
        url
        content
        chunks {
          content
          embedding
        }
      }
    }
  }
`;