import { CacheWithLimit } from './cache.js'
import { USER_SETTINGS_DEFAULT_VALUE } from '../constants.js'
import { readSettings } from './settings-api.js'
import {
  log,
  logDebug
} from './debug.js'

export const memo = {
  activeTabId: '',
  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
  settings: USER_SETTINGS_DEFAULT_VALUE,
  profileStartMS: undefined,

  async readActualSettings () {
    this.settings = await readSettings();
    log('readActualSettings')
    log(`actual settings: ${Object.entries(this.settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
  },

  setProfileStartTime () {
    if (!this.profileStartTime) {
      this.profileStartMS = Date.now() 
      logDebug('memo.setProfileStartTime', this.profileStartMS)
    }
  }
};

