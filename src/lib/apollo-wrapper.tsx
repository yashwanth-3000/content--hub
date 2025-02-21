'use client'; // This pragma ensures the file can run on the client side

import { HttpLink } from '@apollo/client';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support';

// Function to create the Apollo Client instance
function makeClient() {
  const isProduction = process.env.NODE_ENV === 'production';

  const httpLink = new HttpLink({
    // Dynamically set the URI based on the environment
    uri: isProduction
      ? "https://dev-docs-modus-dev-docs.hypermode.app/graphql"// Set this to " in production
      : 'http://localhost:8686/graphql', // Development API base
    headers: {
      'Content-Type': 'application/json',
      Authorization: isProduction
        ? `Bearer ${process.env.HYPERMODE_API_TOKEN}` // Use token in production
        : '', // Empty string in development to avoid undefined
    },
    fetchOptions: { cache: 'no-store' }, // Disable result caching for fresh data
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

// ApolloWrapper component to wrap your application
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
