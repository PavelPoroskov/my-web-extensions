// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import {
  logSettings,
} from '../log-api.js'

export const memo = {
  previousTabId: '',
  activeTabId: '',
  activeTabUrl: '',
  isActiveTabBookmarkManager: false,

  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
  // tabId -> bookmarkId
  tabMap: new Map(),
  urlToTempBkmIdMap: new Map(),
  tabIdToUrlMap: new Map(),
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
