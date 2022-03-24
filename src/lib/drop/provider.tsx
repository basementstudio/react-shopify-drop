import * as React from 'react'
import create from 'zustand'
import createContext from 'zustand/context'

import { getFormattedTimeDelta } from './utils'

interface DropContext {
  progress: number | null
  timeRemaining: number
  isCompleted: boolean
  endTimestamp: number
  startTimestamp: number | null
  update: () => void
  humanTimeRemaining: ReturnType<typeof getFormattedTimeDelta>
}

const { Provider, useStore: useDrop } = createContext<DropContext>()

type DropProviderProps = {
  children?: React.ReactNode
  countdownChildren?: React.ReactNode
  endDate: Date
  startDate?: Date
}

const DropProvider = ({
  children,
  countdownChildren,
  endDate,
  startDate
}: DropProviderProps) => {
  const { endTimestamp, startTimestamp } = React.useMemo(() => {
    return {
      endTimestamp: endDate.getTime(),
      startTimestamp: startDate ? startDate.getTime() : null
    }
  }, [endDate, startDate])

  return (
    <Provider
      createStore={() =>
        create<DropContext>((set) => {
          const state = calculateState(endTimestamp, startTimestamp)
          return {
            ...state,
            endTimestamp,
            startTimestamp,
            update: () => {
              set((state) => ({
                ...state,
                ...calculateState(endTimestamp, startTimestamp)
              }))
            }
          }
        })
      }
    >
      <Renderer countdownChildren={countdownChildren}>{children}</Renderer>
    </Provider>
  )
}

function Renderer({
  children,
  countdownChildren
}: {
  children?: React.ReactNode
  countdownChildren?: React.ReactNode
}) {
  const isCompleted = useDrop(
    React.useCallback((state) => state.isCompleted, [])
  )

  //   const { mounted } = useDelayedRender(isCompleted, {
  //     exitDelay: 2000,
  //     enterDelay: 2000
  //   })

  return (
    <>
      {isCompleted ? (
        children
      ) : (
        <CountdownRenderer>{countdownChildren}</CountdownRenderer>
      )}
    </>
  )
}

function CountdownRenderer({ children }: { children?: React.ReactNode }) {
  const { endTimestamp, startTimestamp, update, isCompleted } = useDrop(
    React.useCallback(
      (state) => ({
        endTimestamp: state.endTimestamp,
        startTimestamp: state.startTimestamp,
        update: state.update,
        isCompleted: state.isCompleted
      }),
      []
    )
  )

  React.useEffect(() => {
    if (isCompleted) return
    const interval = window.setInterval(update, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [endTimestamp, startTimestamp, isCompleted, update])

  return <>{children}</>
}

function calculateState(endTimestamp: number, startTimestamp: number | null) {
  const now = Date.now()

  const timeRemaining = endTimestamp - now
  const progress = startTimestamp
    ? (now - startTimestamp) / (endTimestamp - startTimestamp)
    : null
  const isCompleted = timeRemaining <= 0

  const humanTimeRemaining = getFormattedTimeDelta(timeRemaining)

  return { timeRemaining, isCompleted, progress, humanTimeRemaining }
}

export { DropContext, DropProvider, useDrop }
