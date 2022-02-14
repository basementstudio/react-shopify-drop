import * as React from 'react'
import { useForm } from 'react-hook-form'

import { formatError } from '../utils'

export const getAdminEndpoint = (endpoint: string) =>
  `https://${process.env.SHOPIFY_ADMIN_API_KEY}:${process.env.SHOPIFY_ADMIN_PASSWORD}@${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}${endpoint}`

const createCustomerWithEmail = async (email: string) => {
  const res = await fetch(`/api/customer`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ email: email })
  })

  const data = await res.json()

  if (res.status !== 200) {
    throw new Error(data.error.message)
  }
  return data.message
}

const useEmailSubscriptionForm = () => {
  const { register, handleSubmit, setValue } = useForm<{ email: string }>()
  const [status, setStatus] = React.useState<
    'submitting' | 'error' | 'success'
  >()
  const [message, setMessage] = React.useState<React.ReactNode | undefined>()

  const emailInputProps = React.useMemo(() => {
    return {
      placeholder: 'Enter your email to stay updated',
      autoComplete: 'email',
      ...register('email'),
      type: 'email',
      required: true
    }
  }, [register])

  const onSubmit = React.useMemo(() => {
    return handleSubmit(async (data) => {
      setStatus('submitting')
      setMessage(undefined)
      try {
        const _message = await createCustomerWithEmail(data.email)
        setStatus('success')
        setMessage(_message)
        setValue('email', '')
      } catch (error) {
        setStatus('error')
        setMessage(formatError(error).message)
      }
    })
  }, [handleSubmit, setValue])

  return { emailInputProps, onSubmit, status, message }
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

export const formatPrice = (amount: string) => {
  return formatter.format(parseFloat(amount))
}

export { createCustomerWithEmail, useEmailSubscriptionForm }
