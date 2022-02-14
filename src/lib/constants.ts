export const isClient = typeof window !== 'undefined'
export const isServer = !isClient

export const mode = (process.env.NEXT_PUBLIC_MODE ?? 'default') as
  | 'default'
  | 'showcase'
