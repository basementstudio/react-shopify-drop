import { calcTimeDelta, CountdownTimeDelta } from 'react-countdown'

import { mode } from '../constants'

export const launchDate =
  mode === 'default'
    ? new Date('2021-12-07T19:00:00.000Z')
    : new Date('2021-12-06T17:34:30.000Z') // this is just a random past date.
export const sevenMinutes = 7 * 60 * 1000

export enum state {
  ready = 'ready',
  almostReady = 'almostReady',
  countdown = 'countdown'
}

export const getCountdownMarks = ({
  delta,
  exact
}: { delta?: CountdownTimeDelta; exact?: boolean } = {}) => {
  const { total: millisecondDistance, completed } =
    delta ?? calcTimeDelta(launchDate)

  const marks = {
    sevenMinuteMark: exact
      ? millisecondDistance === 7 * 60 * 1000
      : millisecondDistance <= 7 * 60 * 1000,
    fiveMinuteMark: exact
      ? millisecondDistance === 5 * 60 * 1000
      : millisecondDistance <= 5 * 60 * 1000,
    threeMinuteMark: exact
      ? millisecondDistance === 3 * 60 * 1000
      : millisecondDistance <= 3 * 60 * 1000,
    oneMinuteMark: exact
      ? millisecondDistance === 60 * 1000
      : millisecondDistance <= 60 * 1000,
    thirtySecondsMark: exact
      ? millisecondDistance === 30 * 1000
      : millisecondDistance <= 30 * 1000,
    fiveSecondsMark: exact
      ? millisecondDistance === 5 * 1000
      : millisecondDistance <= 5 * 1000,
    oneSecondsMark: exact
      ? millisecondDistance === 1 * 1000
      : millisecondDistance <= 1 * 1000,
    isComplete: completed
  }

  return {
    ...marks,
    state: marks.isComplete
      ? state.ready
      : marks.sevenMinuteMark
      ? state.almostReady
      : state.countdown
  }
}
