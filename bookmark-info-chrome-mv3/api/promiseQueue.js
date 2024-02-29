import {
  CacheWithLimit,
} from './cache.js'
import {
  log,
} from './debug.js'

class PromiseQueue {
  constructor () {
    this.cache = new CacheWithLimit({ name: 'cachePromiseQueue', size: 50 });
  }

  add ({ key, fn, isOverwrite }) {
    let promiseInQueue = this.cache.get(key);

    const getStepPromise = () => fn()
      .then(() => {
        this.cache.delete(key) 
      })
      .catch((e) => {
        log(' IGNORING error: PromiseQueue', e);

        return { isError: true }
      })

    if (!promiseInQueue) {
      log(' PromiseQueue: create first');
      this.cache.add(
        key,
        getStepPromise()
      )
    } else if (isOverwrite) {
      log(' PromiseQueue: repeat after always');
      this.cache.add(
        key,
        promiseInQueue.finally(() => getStepPromise())
      )
    } else {
      log(' PromiseQueue: repeat if error');
      this.cache.add(
        key,
        promiseInQueue.then((v) => v?.isError && getStepPromise())
      )
    }
  }
}

export const promiseQueue = new PromiseQueue();
