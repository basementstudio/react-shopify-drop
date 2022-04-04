import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import useSWR from 'swr'

import { ToggleState, useToggleState } from '../../../hooks/use-toggle-state'
import type { EventManager } from '../../utils/events'
import { createEventManager } from '../../utils/events'
import { CartFragment, Sdk } from './generated'

type TErrors = {
  createCartError: Error | null
  addLineItemError: Error | null
  updateLineItemError: Error | null
  removeLineItemError: Error | null
}

type LineItem = { merchandiseId: string; quantity: number }

type Context = {
  onAddLineItem: (params: {
    merchandiseId: string
    quantity: number
  }) => Promise<void>
  onUpdateLineItem: (params: {
    merchandiseId: string
    quantity: number
  }) => Promise<void>
  onRemoveLineItem: (params: { merchandiseId: string }) => Promise<void>
  cart: CartFragment | undefined | null
  cartItemsCount: number | undefined
  cartToggleState: ToggleState
  errors: TErrors
  event: {
    subscribe: EventManager['on']
    unsubscribe: EventManager['removeListener']
    only: EventManager['only']
  }
}

const Context = createContext<Context | undefined>(undefined)

type InternalContextProviderProps = {
  client: Sdk
  appCartId: string
}

const InternalContextProvider: React.FC<InternalContextProviderProps> = ({
  children,
  client,
  appCartId
}) => {
  const cartToggleState = useToggleState()
  const { data: cart, mutate } = useSWR('cart', cartFetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  const [errors, setErrors] = useState<TErrors>({
    createCartError: null,
    addLineItemError: null,
    updateLineItemError: null,
    removeLineItemError: null
  })
  const event = createEventManager()

  const cartLocalStorage = {
    set: (id: string) => {
      localStorage.setItem(`${appCartId}-cart-id`, id)
    },
    get: () => localStorage.getItem(`${appCartId}-cart-id`),
    clear: () => localStorage.removeItem(`${appCartId}-cart-id`)
  }

  const setError = (key: keyof TErrors, value: Error | null) =>
    setErrors((prevErrors) => ({
      ...prevErrors,
      [key]: value
    }))

  async function cartFetcher() {
    try {
      const id = cartLocalStorage.get()
      if (!id) return null
      const { cart } = await client.FetchCart({ id })
      if (cart === null) {
        cartLocalStorage.clear()
      }
      return cart
    } catch (error) {
      return undefined
    }
  }

  const createCart = useCallback(
    async (lines?: LineItem[]): Promise<CartFragment | null | undefined> => {
      try {
        const data = lines
          ? await client.CreateCartWithLines({ lines })
          : await client.CreateCart()

        const cart = data.cartCreate?.cart
        const cartId = cart?.id

        mutate(cart, false)
        cartLocalStorage.set(cartId ?? '')

        setError('createCartError', null)

        event.emit('createCartSuccess', cart)
        return cart
      } catch (error) {
        setError('createCartError', error as Error)
        event.emit('createCartError', error)
        return null
      }
    },
    [mutate]
  )

  const onAddLineItem = useCallback(
    async ({
      merchandiseId,
      quantity
    }: {
      merchandiseId: string
      quantity: number
    }) => {
      try {
        let cart: CartFragment | undefined | null
        const localStorageCheckoutId = cartLocalStorage.get()
        if (!localStorageCheckoutId) {
          // create new cart
          cart = await createCart([{ merchandiseId, quantity }])
        } else {
          const { cartLinesAdd } = await client.AddLineItem({
            cartId: localStorageCheckoutId,
            lines: [{ merchandiseId, quantity }]
          })
          cart = cartLinesAdd?.cart
        }

        if (cart) {
          mutate(cart, false)
        }

        event.emit('addLineItemSuccess', cart)
        setError('addLineItemError', null)
      } catch (error) {
        setError('addLineItemError', error as Error)
        event.emit('addLineItemError', error)
      }
    },
    [createCart, mutate]
  )

  const onUpdateLineItem = useCallback(
    async ({
      merchandiseId,
      quantity
    }: {
      merchandiseId: string
      quantity: number
    }) => {
      try {
        const id = cartLocalStorage.get()
        if (!id) return
        const { cartLinesUpdate } = await client.UpdateLineItem({
          cartId: id,
          lines: [{ id: merchandiseId, quantity }]
        })

        const cart = cartLinesUpdate?.cart

        if (cart) {
          mutate(cart, false)
        }

        event.emit('updateLineItemSuccess', cart)
        setError('updateLineItemError', null)
      } catch (error) {
        setError('updateLineItemError', error as Error)
        event.emit('updateLineItemError', error)
      }
    },
    [mutate]
  )

  const onRemoveLineItem = useCallback(
    async ({ merchandiseId }: { merchandiseId: string }) => {
      try {
        const id = cartLocalStorage.get()
        if (!id) return
        const { cartLinesRemove } = await client.RemoveLineItem({
          cartId: id,
          lineIds: [merchandiseId]
        })

        const cart = cartLinesRemove?.cart

        if (cart) {
          mutate(cart, false)
        }

        event.emit('removeLineItemSuccess', cart)
        setError('removeLineItemError', null)
      } catch (error) {
        setError('removeLineItemError', error as Error)
        event.emit('removeLineItemError', error)
      }
    },
    [mutate]
  )

  const cartItemsCount = useMemo(() => {
    if (cart === null) return 0
    if (!cart?.lines?.edges) return undefined
    let result = 0
    cart?.lines?.edges.forEach((i) => {
      result += i.node.quantity
    })
    return result
  }, [cart])

  return (
    <Context.Provider
      value={{
        cart,
        cartToggleState,
        cartItemsCount,
        onAddLineItem,
        onUpdateLineItem,
        onRemoveLineItem,
        event: {
          subscribe: event.on,
          unsubscribe: event.removeListener,
          only: event.only
        },
        errors
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const StorefrontProvider: React.FC<InternalContextProviderProps> = ({
  children,
  client,
  appCartId
}) => {
  return (
    <InternalContextProvider client={client} appCartId={appCartId}>
      {children}
    </InternalContextProvider>
  )
}

export const useStorefront = () => {
  const ctx = useContext(Context)
  if (ctx === undefined) {
    throw new Error('useStorefront must be used below <StorefrontProvider />')
  }
  return ctx
}
