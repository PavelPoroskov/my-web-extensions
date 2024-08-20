// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import {
  logSettings,
  // logDebug,
} from './log-api.js'
import {
  getOptions, setOptions
} from './storage-api.js'
import {
  STORAGE_KEY,
} from '../constant/index.js';
import { tagList } from './tagList.js';

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

  // TODO use promise in cache for setting and profile-start-time
  // cache[setting] = readSettings
  // isSettingsActual = true
  //
  // await cache[settings]
  _isSettingsActual: false,
  _settings: {},
  get isSettingsActual() {
    return this._isSettingsActual
  },
  invalidateSettings () {
    this._isSettingsActual = false
  },
  async readSettings() {
    logSettings('readSavedSettings START')

    this._settings = await getOptions([
      STORAGE_KEY.CLEAR_URL,
      STORAGE_KEY.SHOW_PATH_LAYERS,
      STORAGE_KEY.SHOW_PREVIOUS_VISIT,
      STORAGE_KEY.SHOW_BOOKMARK_TITLE,
      STORAGE_KEY.ADD_BOOKMARK_IS_ON,
      STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
      STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
      STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH,
      STORAGE_KEY.ADD_BOOKMARK_HIGHLIGHT_LAST,
      STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE,
    ]);
    logSettings('readSavedSettings')
    logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  
  },
  async init() {
    this._isSettingsActual = true
    await this.readSettings()
    await tagList.readFromStorage()
  },
  get settings() {
    return { ...this._settings }
  },
  async updateSettings(updateObj) {
    Object.entries(updateObj).forEach(([ket, value]) => {
      this._settings[ket] = value
    })
    
    await setOptions(updateObj)
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

  // TODO move activeDialog to separate class
  activeDialog: {},
  activeDialogTabId: undefined,
  activeDialogTabOnActivated (tabId) {
    if (tabId !== this.activeDialogTabId)  {
      this.activeDialogTabId = tabId
      this.activeDialog = {}
    }
  },
  createBkmInActiveDialog (bookmarkId, parentId) {
    const isFirst = Object.values(this.activeDialog).filter(({ bookmarkId }) => bookmarkId).length === 0;
    this.activeDialog[parentId] = {
      ...this.activeDialog[parentId],
      bookmarkId,
      isFirst,
    }

    return this.activeDialog[parentId]
  },
  createBkmInActiveDialogFromTag (parentId) {
    this.activeDialog[parentId] = {
      fromTag: true
    }
  },
  isCreatedInActiveDialog(bookmarkId, parentId) {
    const result = this.activeDialog[parentId]?.bookmarkId === bookmarkId 
      && this.activeDialog[parentId]?.isFirst === true
      && this.activeDialog[parentId]?.fromTag !== true

    return result
  },
  removeFromActiveDialog(parentId) {
    delete this.activeDialog[parentId]
  }
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
