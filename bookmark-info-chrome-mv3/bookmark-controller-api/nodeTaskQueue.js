export const NODE_ACTION = {
  CREATE: `CREATE`,
  MOVE: `MOVE`,
  CHANGE: `CHANGE`,
  DELETE: `DELETE`,
};

export class NodeTaskQueue {
  queue = []
  nRunningTask = 0
  concurrencyLimit = 1
  runTask

  constructor(fnRunTask) {
    this.runTask = fnRunTask
  }

  async _run() {
    if (this.nRunningTask >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    this.nRunningTask++;
    const task = this.queue.shift();
    if (task) {
      await this.runTask(task);
    }
    this.nRunningTask--;

    this._run();
  }

  enqueue(task) {
    this.queue.push(task);
    this._run();
  }
  enqueueCreate(task) {
    this.enqueue({ ...task, action: NODE_ACTION.CREATE });
  }
  enqueueMove(task) {
    this.enqueue({ ...task, action: NODE_ACTION.MOVE });
  }
  enqueueChange(task) {
    this.enqueue({ ...task, action: NODE_ACTION.CHANGE });
  }
  enqueueDelete(task) {
    this.enqueue({ ...task, action: NODE_ACTION.DELETE });
  }
}
