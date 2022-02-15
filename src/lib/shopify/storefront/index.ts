import { GraphQLClient } from 'graphql-request'
import * as Dom from 'graphql-request/dist/types.dom';

import { getSdk } from './generated'

export type StorefrontClientProps = { endpoint: string, accessToken: string }

export const createStorefrontClient = ({ endpoint, accessToken }: StorefrontClientProps) => {
  const graphqlClient = new GraphQLClient(endpoint, {
    headers: {
      'x-shopify-storefront-access-token': accessToken,
      accept: 'application/json'
    }
  })
  const generatedSdk =  getSdk(graphqlClient)

  return {
    ...generatedSdk,
    query: async (query: string, requestHeaders?: Dom.RequestInit["headers"]) => {
      try {
        return await graphqlClient.request(query, requestHeaders)
      } catch (error) {
        return error
      }
    },
    mutation: async (
      mutation: string,
      variables?: { [k: string]: string },
      requestHeaders?: Dom.RequestInit["headers"]
    ) => {
      try {
        return await graphqlClient.request(mutation, variables, requestHeaders)
      } catch (error) {
        return error
      }
    }
  }
}
