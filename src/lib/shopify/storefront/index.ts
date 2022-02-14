import { GraphQLClient } from 'graphql-request'

import { getSdk } from './generated'

export type StorefrontClientProps = { endpoint: string, accessToken: string }

export const createStorefrontClient = ({ endpoint, accessToken }: StorefrontClientProps) => {
  return getSdk(
    new GraphQLClient(endpoint, {
      headers: {
        'x-shopify-storefront-access-token': accessToken,
        accept: 'application/json'
      }
    })
  )
}
