import { useCallback, useMemo, useState } from 'react'

import { ProductFragment } from '../lib/shopify/storefront/generated'
import { useStorefront } from '../lib/shopify/storefront/provider'

export const useProductHelper = (product: ProductFragment) => {
  const { onAddLineItem, cartToggleState } = useStorefront()
  const [addToBagState, setAddToBagState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | undefined>
  >(() => {
    const opts: Record<string, string | undefined> = {}

    product.options.forEach((o) => {
      opts[o.name] = undefined
    })

    return opts
  })

  const handleSelectOption = useCallback(
    (name: string, value: string | undefined) =>
      setSelectedOptions((p) => ({ ...p, [name]: value })),
    []
  )

  const selectedVariant = useMemo(() => {
    if (product.variants.edges.length === 1) return product.variants.edges[0]

    const selectedVariant = product.variants.edges.find((variant) => {
      const _selectedOptions = Object.entries(selectedOptions)

      return _selectedOptions.every(([name, value]) =>
        variant.node.selectedOptions.find(
          (option) => option.name === name && option.value === value
        )
      )
    })

    return selectedVariant
  }, [selectedOptions, product.variants])

  const cleanOptions = useMemo(
    () =>
      product.options
        .map((option) => ({
          ...option,
          values: option.values.map((value) => {
            const variants = product.variants.edges.filter((variant) =>
              variant.node.selectedOptions.every((optionInVariant) => {
                if (optionInVariant.name === option.name) {
                  return optionInVariant.value === value
                }

                if (selectedOptions[optionInVariant.name]) {
                  return (
                    optionInVariant.value ===
                    selectedOptions[optionInVariant.name]
                  )
                }

                return true
              })
            )

            const isNotAvailable = variants.every((v) =>
              v
                ? !v.node.availableForSale ||
                  (v.node.quantityAvailable ?? 0) <= 0
                : true
            )

            return { value, notAvailable: isNotAvailable }
          })
        }))
        .filter((o) => !!o),
    [product.options, product.variants.edges, selectedOptions]
  )

  const handleAddToBag = useCallback(
    async (options?: { quantity?: number; openCartOnSuccess?: boolean }) => {
      if (!selectedVariant) return

      setAddToBagState('loading')
      await onAddLineItem({
        merchandiseId: selectedVariant.node.id,
        quantity: options?.quantity ?? 1
      })
      setAddToBagState('success')

      if (options?.openCartOnSuccess) {
        cartToggleState.handleOn()
      }
    },
    [cartToggleState, onAddLineItem, selectedVariant]
  )

  const state = useMemo(
    () => ({
      addToBagState,
      selectedOptions,
      hasOneSelected: Object.keys(selectedOptions).some(
        (o) => !!selectedOptions[o]
      ),
      hasAllSelected: Object.keys(selectedOptions).every(
        (o) => !!selectedOptions[o]
      )
    }),
    [addToBagState, selectedOptions]
  )

  return {
    handleSelectOption,
    handleAddToBag,
    cleanOptions,
    selectedVariant,
    state
  }
}
