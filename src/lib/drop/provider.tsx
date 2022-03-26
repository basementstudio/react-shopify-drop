import { classNames } from 'lib/utils'
import * as React from 'react'
import useDelayedRender from 'use-delayed-render'
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
  countdownProps?: CountdownProps
  endDate: Date | number
  startDate?: Date | number
}

const DropProvider = ({
  children,
  endDate,
  startDate,
  countdownProps
}: DropProviderProps) => {
  const { endTimestamp, startTimestamp } = React.useMemo(() => {
    return {
      endTimestamp: typeof endDate === 'number' ? endDate : endDate.getTime(),
      startTimestamp: startDate
        ? typeof startDate === 'number'
          ? startDate
          : startDate.getTime()
        : null
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
      <Renderer countdownProps={countdownProps}>{children}</Renderer>
    </Provider>
  )
}

function Renderer({
  countdownProps,
  children
}: {
  children?: React.ReactNode
  countdownProps?: CountdownProps
}) {
  const isCompleted = useDrop(
    React.useCallback((state) => state.isCompleted, [])
  )

  const { mounted, rendered } = useDelayedRender(!isCompleted, {
    exitDelay: countdownProps?.exitDelay ?? 0
  })

  return (
    <>
      {isCompleted && children}
      {mounted && (
        <CountdownRenderer rendered={rendered} {...countdownProps}>
          {countdownProps?.children}
        </CountdownRenderer>
      )}
    </>
  )
}

interface CountdownProps {
  children?: React.ReactNode
  className?: string
  exitDelay?: number
  exitClassName?: string
}

function CountdownRenderer({
  children,
  className,
  exitClassName,
  rendered
}: CountdownProps & { rendered: boolean }) {
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

  return (
    <div className={classNames(className, !rendered && exitClassName)}>
      {children}
    </div>
  )
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
