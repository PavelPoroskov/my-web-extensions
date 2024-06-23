// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import {
  logSettings,
} from './debug.js'
import {
  filterFixedTagList,
  getRecentTagList
} from './recent-api.js'
import { USER_SETTINGS_DEFAULT_VALUE, USER_SETTINGS_OPTIONS, RECENT_TAG_INTERNAL_LIMIT } from '../constants.js';

const STORAGE_LOCAL__FIXED_TAG_LIST = 'FIXED_TAG_LIST'
const STORAGE_SESSION__RECENT_TAG_LIST = 'RECENT_TAG_LIST'

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
      logSettings('readSavedSettings START')

      const savedSettings = await chrome.storage.local.get(
        Object.values(USER_SETTINGS_OPTIONS)
      );
    
      this._settings = {
        ...USER_SETTINGS_DEFAULT_VALUE,
        ...savedSettings,
      };
      logSettings('readSavedSettings')
      logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  

      this._isSettingsActual = true
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

      const STORAGE_SESSION__START_TIME = 'START_TIME'
      const storedSession = await chrome.storage.session.get(STORAGE_SESSION__START_TIME)
      logSettings('storedSession', storedSession)

      if (storedSession[STORAGE_SESSION__START_TIME]) {
        this._profileStartTimeMS = storedSession[STORAGE_SESSION__START_TIME]
      } else {
        // I get start for service-worker now.
        //    It is correct if this web-extension was installed in the previous browser session
        // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
        //  tab with minimal tabId
        this._profileStartTimeMS = performance.timeOrigin
        await chrome.storage.session.set({
          [STORAGE_SESSION__START_TIME]: this._profileStartTimeMS
        })

      }

      logSettings('profileStartTimeMS', new Date(this._profileStartTimeMS).toISOString())
      this._isProfileStartTimeMSActual = true
    }
  },

  _isTagListActual: false,
  _fixedTagList: [],
  _recentTagList: [],
  get isTagListActual() {
    return this._isTagListActual
  },
  invalidateTagList () {
    this._isTagListActual = false
  },
  get fixedTagList() {
    return this._fixedTagList
  },
  get recentTagList() {
    return this._recentTagList
  },
  // async addFixedTag() {
  //   const STORAGE_LOCAL__FIXED_TAG_LIST = 'FIXED_TAG_LIST'
  //   const savedList = await chrome.storage.local.get(
  //     STORAGE_LOCAL__FIXED_TAG_LIST
  //   );
  
  // },
  async readTagList() {
    logSettings('readTagList 00')
    if (!this._isTagListActual) {
      logSettings('readTagList 11')

      if (this._settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
        logSettings('readTagList 22')
        const [savedLocal, savedSession] = await Promise.all([
          chrome.storage.local.get(STORAGE_LOCAL__FIXED_TAG_LIST),
          chrome.storage.session.get(STORAGE_SESSION__RECENT_TAG_LIST),
        ]);
      
  
        if (!savedSession[STORAGE_SESSION__RECENT_TAG_LIST]) {
          logSettings('readTagList 22 11')
          this._fixedTagList = await filterFixedTagList(savedLocal[STORAGE_LOCAL__FIXED_TAG_LIST])
          this._recentTagList = await getRecentTagList(RECENT_TAG_INTERNAL_LIMIT)
        } else {
          logSettings('readTagList 22 77')
          this._fixedTagList = savedLocal[STORAGE_LOCAL__FIXED_TAG_LIST] || []
          this._recentTagList = savedSession[STORAGE_SESSION__RECENT_TAG_LIST]
        }  
      } else {
        logSettings('readTagList 44')

        this._fixedTagList = []
        this._recentTagList = []
      }
      this._isTagListActual = true
    }
  },
  async addRecentTag({ parentId, dateAdded }) {
    logSettings('addRecentTag 00', parentId, dateAdded )
    const actualDateAdded = dateAdded || Date.now()
    logSettings('addRecentTag 11 actualDateAdded', actualDateAdded )

    const folderByIdMap = Object.fromEntries(
      this._recentTagList.map(({ parentId, title, dateAdded }) => [
        parentId,
        {
          title,
          dateAdded,
          isSourceFolder: true,
        }
      ])
    )

    const [newFolder] = await chrome.bookmarks.get(parentId)
    logSettings('addRecentTag 22 newFolder', newFolder )
    logSettings('addRecentTag 22 newFolder.title', newFolder.title )
    folderByIdMap[parentId] = {
      ...folderByIdMap[parentId],
      dateAdded: actualDateAdded,
      title: newFolder.title
    }

    this._recentTagList = Object.entries(folderByIdMap)
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, RECENT_TAG_INTERNAL_LIMIT)

    await chrome.storage.session.set({
      [STORAGE_SESSION__RECENT_TAG_LIST]: this._recentTagList
    })
  },
  async removeTag(id) {
    const isInFixedList = this._fixedTagList.some(({ parentId }) => parentId === id)

    if (isInFixedList) {
      this._fixedTagList = this._fixedTagList.filter(({ parentId }) => parentId !== id)
    }

    const isInRecentList = this._recentTagList.some(({ parentId }) => parentId === id)

    if (isInRecentList) {
      this._recentTagList = this._recentTagList.filter(({ parentId }) => parentId !== id)
    }

    if (isInFixedList || isInRecentList) {
      await Promise.all([
        isInFixedList && chrome.storage.local.set({
          [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
        }),
        isInRecentList && chrome.storage.session.set({
          [STORAGE_SESSION__RECENT_TAG_LIST]: this._recentTagList
        })
      ])
    }
  },
  async updateTag(id, title) {
    const isInFixedList = this._fixedTagList.some(({ parentId }) => parentId === id)

    if (isInFixedList) {
      this._fixedTagList = this._fixedTagList.map(
        (item) => (item.parentId === id
          ? {
            ...item,
            title,
          }
          : item
        )
      )
    }

    const isInRecentList = this._recentTagList.some(({ parentId }) => parentId === id)

    if (isInRecentList) {
      this._recentTagList = this._recentTagList.map(
        (item) => (item.parentId === id
          ? {
            ...item,
            title,
          }
          : item
        )
      )
    }

    if (isInFixedList || isInRecentList) {
      await Promise.all([
        isInFixedList && chrome.storage.local.set({
          [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
        }),
        isInRecentList && chrome.storage.session.set({
          [STORAGE_SESSION__RECENT_TAG_LIST]: this._recentTagList
        })
      ])
    }
  },
  async addFixedTag({ parentId, title }) {
    const item = this._fixedTagList.find((item) => item.parentId === parentId)

    if (!item) {
      this._fixedTagList.push({ parentId, title })
      await chrome.storage.local.set({
        [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
      })
    }
  },
  async removeFixedTag(id) {
    this._fixedTagList = this._fixedTagList.filter(({ parentId }) => parentId !== id)
    await chrome.storage.local.set({
      [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
    })
  }
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
