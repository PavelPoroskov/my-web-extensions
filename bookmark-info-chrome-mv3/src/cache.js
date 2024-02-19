import {
  log,
} from './utils.js'

const CACHE_SIZE_LIMIT = 100;

const cache = new Map();

export const addToCache = (url,folder) => {
  cache.set(url, folder);
  log('cache.add: folder, url', folder, url);

  if (CACHE_SIZE_LIMIT < cache.size) {
    let deleteCount = cache.size - CACHE_SIZE_LIMIT;
    const keyToDelete = [];
    
    // Map.key() returns keys in insertion order
    for (const key of cache.keys()) {
      keyToDelete.push(key);
      deleteCount -= 1;
      if (deleteCount <= 0) {
        break;
      }
    }

    for (const key of keyToDelete) {
      cache.delete(key);
    }
  }
}

export const getFromCache = (url) => {
  const result = cache.get(url);
  log('cache.get: folder, url', result, url);

  return result;
}
