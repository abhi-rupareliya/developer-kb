import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: '/api/graphql',
    credentials: 'same-origin'
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}
