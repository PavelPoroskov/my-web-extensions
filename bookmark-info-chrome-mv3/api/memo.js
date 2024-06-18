// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import { readSettingsFromStorage } from './settings-api.js'
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

  _isSettingsActual: false,
  get isSettingsActual() {
    return this._isSettingsActual
  },
  invalidateSettings () {
    this._isSettingsActual = false
  },
  _settings: {},
  async readSettings() {
    if (!this._isSettingsActual) {
      this._isSettingsActual = true

      this._settings = await readSettingsFromStorage();
      logSettings('readSavedSettings')
      logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  
    }
  },
  get settings() {
    return { ...this._settings }
  },

  _profileStartTimeMS: undefined,
  get profileStartTimeMS() {
    return this._profileStartTimeMS
  },
  _isProfileStartTimeMSActual: false,
  get isProfileStartTimeMSActual() {
    return this._isProfileStartTimeMSActual
  },
  async readProfileStartTimeMS() {
    if (!this._isProfileStartTimeMSActual) {
      this._isProfileStartTimeMSActual = true

      const SESSION_OPTION_START_TIME = 'SESSION_OPTION_START_TIME'
      const storedSession = await chrome.storage.session.get(SESSION_OPTION_START_TIME)
      logSettings('storedSession', storedSession)

      if (storedSession[SESSION_OPTION_START_TIME]) {
        this._profileStartTimeMS = storedSession[SESSION_OPTION_START_TIME]
      } else {
        // I get start for service-worker now.
        //    It is correct if this web-extension was installed in the previous browser session
        // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
        //  tab with minimal tabId
        this._profileStartTimeMS = performance.timeOrigin
        await chrome.storage.session.set({
          [SESSION_OPTION_START_TIME]: this._profileStartTimeMS
        })
      }
      logSettings('profileStartTimeMS', new Date(this._profileStartTimeMS).toISOString())
    }
  }
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
