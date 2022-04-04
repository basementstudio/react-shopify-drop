type EventArgs = {
  event:
    | 'createCartError'
    | 'addLineItemError'
    | 'updateLineItemError'
    | 'removeLineItemError'
    | 'createCartSuccess'
    | 'addLineItemSuccess'
    | 'updateLineItemSuccess'
    | 'removeLineItemSuccess'
  callback: (...args: any[]) => any
}
type Events = { [k: string]: EventArgs['callback'][] }

export const createEventManager = () => {
  const events: Events = {}

  const on = (event: EventArgs['event'], callback: EventArgs['callback']) => {
    if (typeof events[event] !== 'object') {
      events[event] = []
    }

    events[event].push(callback)

    return callback
  }

  const removeListener = (
    event: EventArgs['event'],
    callback: EventArgs['callback']
  ) => {
    let idx

    if (typeof events[event] === 'object') {
      idx = events[event].indexOf(callback)

      if (idx > -1) {
        events[event].splice(idx, 1)
      }
    }
  }

  const emit = function (event: EventArgs['event'], ...args: any[]) {
    let i, listeners, length

    if (typeof events[event] === 'object') {
      listeners = events[event].slice()
      length = listeners.length

      for (i = 0; i < length; i++) {
        listeners[i].apply(self, args)
      }
    }
  }

  const only = function (
    event: EventArgs['event'],
    callback: EventArgs['callback']
  ) {
    events[event] = [callback]

    return callback
  }

  return {
    on,
    removeListener,
    emit,
    only
  }
}

export type EventManager = {
  on: typeof createEventManager.prototype.on
  removeListener: typeof createEventManager.prototype.removeListener
  emit: typeof createEventManager.prototype.emit
  only: typeof createEventManager.prototype.only
}
