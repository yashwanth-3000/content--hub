import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const isProduction = process.env.NODE_ENV === 'production';

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // Dynamically set the URI based on the environment
      uri: isProduction
        ? process.env.NEXT_PUBLIC_HYPERMODE_API_ENDPOINT
        : 'https://dev-docs-modus-dev-docs.hypermode.app/graphql', // Replace with your development API base
      headers: isProduction
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.HYPERMODE_API_TOKEN}`,
          }
        : {
            'Content-Type': 'application/json',
          },
      fetchOptions: { cache: 'no-store' }, // Disable result caching
    }),
  });
});
