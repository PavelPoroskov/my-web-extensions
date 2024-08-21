// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import {
  logSettings,
  // logDebug,
} from '../log-api.js'
import {
  getOptions, setOptions
} from '../storage-api.js'
import {
  STORAGE_KEY,
} from '../../constant/index.js';

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

  // TODO move profile start time
  // TODO use promise in cache for profile-start-time
  // cache[setting] = readSettings
  // isSettingsActual = true
  //
  // await cache[settings]
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

      const storedSession = await getOptions(STORAGE_KEY.START_TIME)
      logSettings('storedSession', storedSession)

      if (storedSession[STORAGE_KEY.START_TIME]) {
        this._profileStartTimeMS = storedSession[STORAGE_KEY.START_TIME]
      } else {
        // I get start for service-worker now.
        //    It is correct if this web-extension was installed in the previous browser session
        // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
        //  tab with minimal tabId
        this._profileStartTimeMS = performance.timeOrigin
        await setOptions({
          [STORAGE_KEY.START_TIME]: this._profileStartTimeMS
        })

      }

      logSettings('profileStartTimeMS', new Date(this._profileStartTimeMS).toISOString())
      this._isProfileStartTimeMSActual = true
    }
  },
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
