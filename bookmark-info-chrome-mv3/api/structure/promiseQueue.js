import {
  logIgnore,
  logPromiseQueue,
} from '../log-api.js'
import {
  SOURCE,
} from '../../constant/index.js'

class PromiseQueue {
  constructor () {
    this.promise = {};
    this.tasks = {};
  }

  async continueQueue(key, prevResult) {
    // console.log('this.tasks[key]', this.tasks[key]);
    const task = this.tasks[key]?.shift()

    if (task) {
      const isActual = prevResult?.taskName === task.taskName  
        && prevResult?.url === task.options.url
        && prevResult?.source === SOURCE.ACTUAL;
      logPromiseQueue('task', task);
      logPromiseQueue('prevResult', prevResult);
      logPromiseQueue('isActual', isActual);

      if (!isActual) {
        logPromiseQueue(' PromiseQueue: exec task', key, task.options);
        return task.fn(task.options)
          .catch((er) => {
            logIgnore(' IGNORING error: PromiseQueue', er);
            return this.continueQueue(key);
          })
          .then((result) => (
            this.continueQueue(
              key,
              {
                ...result,
                taskName: task.taskName,
                url: task.options.url,
              }
            )
          ));
      } else {
        logPromiseQueue(' PromiseQueue: exec task, skip : source actual', key, task.options);
        return this.continueQueue(key, prevResult);
      }
    } else {
      logPromiseQueue(' PromiseQueue: finish', key)
      delete this.tasks[key];
      delete this.promise[key];

      return prevResult;
    }
  }

  add ({ key, fn, options }) {
    const taskName = fn.name;

    if (!this.tasks[key]) {
      logPromiseQueue(' PromiseQueue: start', key, options)
      this.tasks[key] = [{ fn, options, taskName }]
      this.promise[key] = this.continueQueue(key);
    } else {
      logPromiseQueue(' PromiseQueue: add task', key, options)
      this.tasks[key].push({ fn, options, taskName })
    }
  }
}

export const promiseQueue = new PromiseQueue();
