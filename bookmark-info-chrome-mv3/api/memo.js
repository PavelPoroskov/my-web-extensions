import { CacheWithLimit } from './cache.js'

export const memo = {
  activeTabId: '',
  activeTabUrl: '',
  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
};

