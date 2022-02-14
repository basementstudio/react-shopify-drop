import * as React from 'react'
import { calcTimeDelta } from 'react-countdown'

export const useIsComplete = (targetDate: Date) => {
  const [isComplete, setIsComplete] = React.useState<boolean>(() => {
    return calcTimeDelta(targetDate).completed
  })

  React.useEffect(() => {
    if (isComplete) return
    if (calcTimeDelta(targetDate).completed) {
      setIsComplete(true)
    } else {
      setIsComplete(false)
      const interval = setInterval(() => {
        if (calcTimeDelta(targetDate).completed) {
          setIsComplete(true)
        }
      }, 1000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [targetDate, isComplete])

  return { isComplete }
}
