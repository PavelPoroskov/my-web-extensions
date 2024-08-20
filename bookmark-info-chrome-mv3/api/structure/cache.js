
import {
  logCache,
} from '../log-api.js'

export class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  removeStale () {
    if (this.LIMIT < this.cache.size) {
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
    logCache(`   ${this.name}.add: ${key}`, value);
    
    this.removeStale();
  }
  
  get(key) {
    const value = this.cache.get(key);
    logCache(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    logCache(`   ${this.name}.delete: ${key}`);
  }
  
  clear() {
    this.cache.clear();
    logCache(`   ${this.name}.clear()`);
  }

  has(key) {
    return this.cache.has(key);
  }

  print() {
    logCache(this.cache);
  }
}

