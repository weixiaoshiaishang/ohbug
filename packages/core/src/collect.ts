import { Event, Execution } from '@ohbug/types'
import { getHub } from './hub'
import { getEnhancer } from './enhancer'

/**
 * Used to store the event in the hub and handle the collect in the plugin
 *
 * @param event
 * @param execution
 */
function collect<T = Window>(event: Event<any> | any, execution: Execution = 'sync') {
  const hub = getHub<T>()
  let enhancedEvent = event

  // Insert plugin
  let enhancer = getEnhancer<T>()
  if (Array.isArray(enhancer) && enhancer.length) {
    // compose enhancer.event
    enhancedEvent = enhancer.reduce(
      (pre: (e: Event<any>) => Event<any>, cur) => {
        if (cur.event) {
          return _event => pre(cur.event!(_event))
        }
        return _event => pre(_event)
      },
      (e: Event<any>) => e
    )(event)

    const state = enhancer.reduce((pre, cur) => ({ ...pre, ...cur?.state?.(enhancedEvent) }), {})

    if (Object.keys(state).length) {
      enhancedEvent.state = state
    }
  }

  hub.addEvent(enhancedEvent, execution)
}

export default collect