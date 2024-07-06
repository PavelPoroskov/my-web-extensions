// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import {
  logSettings,
  logDebug,
} from './log-api.js'
import {
  filterFixedTagObj,
  getRecentTagObj
} from './recent-api.js'
import {
  USER_SETTINGS_DEFAULT_VALUE,
  USER_SETTINGS_OPTIONS,
  TAG_LIST_VISIBLE_LIMIT
} from '../constant/index.js';

const STORAGE_LOCAL__FIXED_TAG_MAP = 'FIXED_TAG_MAP'
const STORAGE_SESSION__RECENT_TAG_MAP = 'RECENT_TAG_MAP'

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

      await this.readTagList()

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

  _recentTagObj: {},
  _fixedTagObj: {},
  _tagList: [],
  get tagList() {
    return this._tagList
  },
  getTagList() {
    const recentTaLimit = Math.max(
      TAG_LIST_VISIBLE_LIMIT - Object.keys(this._fixedTagObj).length,
      0
    )

    const recentTagList = Object.entries(this._recentTagObj)
      .filter(([parentId]) => !(parentId in this._fixedTagObj))
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, recentTaLimit)
    
    const fullList = [].concat(
      recentTagList
        .map(({ parentId, title }) => ({ parentId, title, isFixed: false })),
      Object.entries(this._fixedTagObj)
        .map(([parentId, title]) => ({ parentId, title, isFixed: true }))
    )

    return fullList
      .filter(({ title }) => !!title)
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  },
  async readTagList() {
    logSettings('readTagList 11')

    if (this._settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      logSettings('readTagList 22')
      const [savedLocal, savedSession] = await Promise.all([
        chrome.storage.local.get(STORAGE_LOCAL__FIXED_TAG_MAP),
        chrome.storage.session.get(STORAGE_SESSION__RECENT_TAG_MAP),
      ]);

      if (!savedSession[STORAGE_SESSION__RECENT_TAG_MAP]) {
        logSettings('readTagList 22 11')
        this._fixedTagObj = await filterFixedTagObj(savedLocal[STORAGE_LOCAL__FIXED_TAG_MAP])
        this._recentTagObj = await getRecentTagObj(TAG_LIST_VISIBLE_LIMIT)
      } else {
        logSettings('readTagList 22 77')
        this._fixedTagObj = savedLocal[STORAGE_LOCAL__FIXED_TAG_MAP] || {}
        this._recentTagObj = savedSession[STORAGE_SESSION__RECENT_TAG_MAP] 
      }
      logSettings('readTagList this._recentTagObj ', this._recentTagObj)
      this._tagList = this.getTagList()
      logSettings('readTagList this._tagList ', this._tagList)
    } else {
      logSettings('readTagList 44')

      this._fixedTagObj = {}
      this._recentTagObj = {}
      this._tagList = []
    }
  },
  async addRecentTag(bkmNode) {
    let newFolderId
    let newFolder

    if (bkmNode.id && !bkmNode.url) {
      newFolderId = bkmNode.id
      newFolder = bkmNode
    } else {
      newFolderId = bkmNode.parentId;
      ([newFolder] = await chrome.bookmarks.get(newFolderId))
    }

    const dateAdded = bkmNode.dateAdded || Date.now()

    logSettings('addRecentTag 00', newFolderId, dateAdded )
    logSettings('addRecentTag 22 newFolder', newFolder )
    logSettings('addRecentTag 22 newFolder.title', newFolder.title )

    this._recentTagObj[newFolderId] = {
      dateAdded,
      title: newFolder.title
    }

    if (TAG_LIST_VISIBLE_LIMIT < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a,b) => -(a.dateAdded - b.dateAdded))
        .slice(TAG_LIST_VISIBLE_LIMIT)
        .map(({ parentId }) => parentId)

        redundantIdList.forEach((id) => {
          delete this._recentTagObj[id]
        })
    }

    this._tagList = this.getTagList()
    await chrome.storage.session.set({
      [STORAGE_SESSION__RECENT_TAG_MAP]: this._recentTagObj
    })
  },
  async removeTag(id) {
    const isInFixedList = id in this._fixedTagObj

    if (isInFixedList) {
      delete this._fixedTagObj[id] 
    }

    const isInRecentList = id in this._recentTagObj

    if (isInRecentList) {
      delete this._recentTagObj[id]
    }

    if (isInFixedList || isInRecentList) {
      this._tagList = this.getTagList()
      await Promise.all([
        isInFixedList && chrome.storage.local.set({
          [STORAGE_LOCAL__FIXED_TAG_MAP]: this._fixedTagObj
        }),
        isInRecentList && chrome.storage.session.set({
          [STORAGE_SESSION__RECENT_TAG_MAP]: this._recentTagObj
        })
      ])
    }
  },
  async updateTag(id, title) {
    const isInFixedList = id in this._fixedTagObj

    if (isInFixedList) {
      this._fixedTagObj[id] = title
    }

    const isInRecentList = id in this._recentTagObj

    if (isInRecentList) {
      this._recentTagObj[id].title = title
    }

    if (isInFixedList || isInRecentList) {
      this._tagList = this.getTagList()
      await Promise.all([
        isInFixedList && chrome.storage.local.set({
          [STORAGE_LOCAL__FIXED_TAG_MAP]: this._fixedTagObj
        }),
        isInRecentList && chrome.storage.session.set({
          [STORAGE_SESSION__RECENT_TAG_MAP]: this._recentTagObj
        })
      ])
    }
  },
  async addFixedTag({ parentId, title }) {
    if (!title || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = title

      this._tagList = this.getTagList()
      await chrome.storage.local.set({
        [STORAGE_LOCAL__FIXED_TAG_MAP]: this._fixedTagObj
      })
    }
  },
  async removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this._tagList = this.getTagList()
    await chrome.storage.local.set({
      [STORAGE_LOCAL__FIXED_TAG_MAP]: this._fixedTagObj
    })
  },

  activeDialog: {},
  activeDialogTabId: undefined,
  activeDialogTabOnActivated (tabId) {
    logDebug('### activeDialogTabOnActivated', tabId)
    if (tabId !== this.activeDialogTabId)  {
      this.activeDialogTabId = tabId
      this.activeDialog = {}
    }
  },
  createBkmInActiveDialog (bookmarkId, parentId) {
    logDebug('### createBkmInActiveDialog', bookmarkId, parentId)
    const isFirst = Object.values(this.activeDialog).filter(({ bookmarkId }) => bookmarkId).length === 0;
    this.activeDialog[parentId] = {
      ...this.activeDialog[parentId],
      bookmarkId,
      isFirst,
    }
  },
  createBkmInActiveDialogFromTag (parentId) {
    logDebug('### createBkmInActiveDialogFromTag', parentId)
    this.activeDialog[parentId] = {
      fromTag: true
    }
  },
  isCreatedInActiveDialog(bookmarkId, parentId) {
    const result = this.activeDialog[parentId]?.bookmarkId === bookmarkId 
      && this.activeDialog[parentId]?.isFirst === true
      && this.activeDialog[parentId]?.fromTag !== true
    logDebug('### isCreatedInActiveDialog', bookmarkId, parentId, result)

    return result
  },
  removeFromActiveDialog(parentId) {
    delete this.activeDialog[parentId]
  }
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
