import {
  log,
} from './debug.js'
import {
  SOURCE,
} from '../constants.js'

class PromiseQueue {
  constructor () {
    this.promise = {};
    this.tasks = {};
  }

  async continueQueue(key, prevResult) {
    // console.log('this.tasks[key]', this.tasks[key]);
    const task = this.tasks[key]?.shift()

    if (task) {
      const isActual = prevResult?.url === task.options.url && prevResult?.source === SOURCE.ACTUAL && prevResult?.sendMessage;
      log('task', task);
      log('prevResult', prevResult);
      log('isActual', isActual);

      if (isActual) {
        log(' PromiseQueue: exec task, skip : source actual', key, task.options);
        return this.continueQueue(key, prevResult);
      } else {
        log(' PromiseQueue: exec task', key, task.options);
        return task.fn(task.options)
          .catch((er) => {
            log(' IGNORING error: PromiseQueue', er);
            return this.continueQueue(key);
          })
          .then((result) => this.continueQueue(key,result));
      }  
    } else {
      log(' PromiseQueue: finish', key)
      delete this.promise[key];
      delete this.tasks[key];

      return prevResult;
    }
  }

  add ({ key, fn, options }) {
    if (!this.promise[key]) {
      log(' PromiseQueue: start', key, options)
      this.tasks[key] = [{ fn, options }]
      this.promise[key] = this.continueQueue(key);
    } else {
      log(' PromiseQueue: add task', key, options)
      this.tasks[key].push({ fn, options })
    }
  }
}

export const promiseQueue = new PromiseQueue();
