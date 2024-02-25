import {
  log,
} from './debug.js'

class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  // addToCache = (url,folder) => {
  add (key,value) {
    this.cache.set(key, value);
    log(`   ${this.name}.add: ${key}`, value);
  
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
  
  get(key) {
    const value = this.cache.get(key);
    log(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const cacheUrlToInfo = new CacheWithLimit({ name: 'cacheUrlToInfo', size: 100 });
export const cacheTabToInfo = new CacheWithLimit({ name: 'cacheTabToInfo', size: 20 });