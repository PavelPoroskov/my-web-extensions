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
    this.callTime = {};
  }

  run({ key, fn, options }) {
    if (!this.tasks[key]) {
      logPromiseQueue(' PromiseQueue: first call', key, options)
      this.tasks[key] = debounce(fn, 30)
    } else {
      logPromiseQueue(' PromiseQueue: second call', key, options)
    }
    this.tasks[key](options);
    this.callTime[key] = Date.now();

    const expireLimit = Date.now() - 60000;
    Object.entries(this.callTime)
      .filter(([, callTimeItem]) => callTimeItem < expireLimit)
      .forEach(([key]) => {
        delete this.callTime[key]
        delete this.tasks[key]
      })
  }
}

export const debounceQueue = new DebounceQueue();
