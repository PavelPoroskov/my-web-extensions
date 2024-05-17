import { CacheWithLimit } from './cache.js'
import { USER_SETTINGS_DEFAULT_VALUE } from '../constants.js'
import { readSettings } from './settings-api.js'
import {
  log,
} from './debug.js'

export const memo = {
  activeTabId: '',
  activeTabUrl: '',
  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
  settings: USER_SETTINGS_DEFAULT_VALUE,

  async readActualSettings () {
    this.settings = await readSettings();
    log('readActualSettings')
    log(`actual settings: ${Object.entries(this.settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
  },
};

