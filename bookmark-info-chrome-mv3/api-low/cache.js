
import {
  makeLogFunction,
} from './log.api.js'

const logC = makeLogFunction({ module: 'cache' })

export class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  removeStale () {
    if (this.LIMIT + 100 < this.cache.size) {
      let deleteCount = this.cache.size - this.LIMIT;
      const keyToDelete = [];

      // Map.key() returns keys in insertion order
      for (const key of this.cache.keys()) {
        keyToDelete.push(key);
        deleteCount -= 1;
        if (deleteCount <= 0) {
          break;
        }
      }

      for (const key of keyToDelete) {
        this.cache.delete(key);
      }
    }
  }

  add (key,value) {
    this.cache.set(key, value);
    logC(`   ${this.name}.add: ${key}`, value);

    this.removeStale();
  }

  get(key) {
    const value = this.cache.get(key);
    logC(`   ${this.name}.get: ${key}`, value);

    return value;
  }

  delete(key) {
    this.cache.delete(key);
    logC(`   ${this.name}.delete: ${key}`);
  }

  clear() {
    this.cache.clear();
    logC(`   ${this.name}.clear()`);
  }

  has(key) {
    return this.cache.has(key);
  }

  print() {
    logC(this.cache);
  }
}

