import {
  logPromiseQueue,
} from '../log-api.js'

function debounce(func, timeout = 300){
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(
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
}

class DebounceQueue {
  constructor () {
    this.tasks = {};
    this.lastCallTimeMap = new Map();
  }

  run({ key, fn, options }) {
    if (!this.tasks[key]) {
      logPromiseQueue(' PromiseQueue: first call', key, options)
      this.tasks[key] = debounce(fn, 30)
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
      delete this.tasks[deleteKey]
      this.lastCallTimeMap.delete(deleteKey)
    })
  }
}

export const debounceQueue = new DebounceQueue();
