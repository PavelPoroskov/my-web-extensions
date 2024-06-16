// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import { readSettings } from './settings-api.js'
import {
  logSettings,
} from './debug.js'

export const memo = {
  activeTabId: '',
  previousTabId: '',
  // previousActiveTabId: '',
  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
  // tabId -> bookmarkId
  tabMap: new Map(),
  // isRemovingOnlyUncleanUrlBookmarkSet: new Set(),

  _settings: {},
  async readActualSettings () {
    this._settings = await readSettings();
    logSettings('readActualSettings')
    logSettings(`actual settings: ${Object.entries(this.settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
  },
  get settings() {
    return { ...this._settings }
  },

  profileStartMS: undefined,

  _isMemoInitDone: false,
  async initMemo() {
    if (!this._isMemoInitDone) {
      this._isMemoInitDone = true

      const SESSION_OPTION_START_TIME = 'SESSION_OPTION_START_TIME'
      const storedSession = await chrome.storage.session.get(SESSION_OPTION_START_TIME)
      logSettings('storedProfileStartTime', storedSession)

      if (storedSession[SESSION_OPTION_START_TIME]) {
        this.profileStartMS = storedSession[SESSION_OPTION_START_TIME]
      } else {
        this.profileStartMS = performance.timeOrigin
        await chrome.storage.session.set({
          [SESSION_OPTION_START_TIME]: this.profileStartMS
        })
      }
      logSettings('profileStartMS', new Date(this.profileStartMS).toISOString())

      await this.readActualSettings()
    }
  }
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
