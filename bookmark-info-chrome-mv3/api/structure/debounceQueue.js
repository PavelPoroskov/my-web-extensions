import {
  logPromiseQueue,
} from '../log-api.js'

class DebounceQueue {
  constructor () {
    this.tasks = {};
    this.timers = {};
    this.lastCallTimeMap = new Map();
  }

  debounce(key, func, timeout = 30){  
    const debouncedFn = (...args) => {
      clearTimeout(this.timers[key]);

      this.timers[key] = setTimeout(
        () => {
          logPromiseQueue(' PromiseQueue: execute task', args[0])
          func.apply(this, args)
            .catch((er) => {
              logPromiseQueue(' IGNORING error: PromiseQueue', er);
            });
        },
        timeout,
      );
    };

    return debouncedFn
  }
  cancelTask(deleteKey) {
    clearTimeout(this.timers[deleteKey])
    delete this.timers[deleteKey]
    delete this.tasks[deleteKey]
    this.lastCallTimeMap.delete(deleteKey)
  }
  
  run({ key, fn, options }) {
    if (!this.tasks[key]) {
      logPromiseQueue(' PromiseQueue: first call', key, options)
      this.tasks[key] = this.debounce(key, fn)
    } else {
      logPromiseQueue(' PromiseQueue: second call', key, options)
    }
    this.tasks[key](options);
    this.lastCallTimeMap.set(key, Date.now())

    const expireLimit = Date.now() - 5000;
    const deleteKeyList = []

    for (const [testKey, lastCallTime] of this.lastCallTimeMap.entries()) {
      if (lastCallTime < expireLimit) {
        deleteKeyList.push(testKey)
      } else {
        break
      }
    }

    deleteKeyList.forEach((deleteKey) => {
      this.cancelTask(deleteKey)
    })
  }
}

export const debounceQueue = new DebounceQueue();
