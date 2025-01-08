import { CacheWithLimit } from './cache.js'
import {
  makeLogFunction,
} from '../api-low/log.api.js'

const logM = makeLogFunction({ module: 'memo' })

export const memo = {
  previousTabId: '',
  activeTabId: '',
  activeTabUrl: '',

  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  // cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
}

logM('IMPORT END', 'memo.js', new Date().toISOString())
