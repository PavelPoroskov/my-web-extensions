// console.log('IMPORTING', 'memo.js')
import { CacheWithLimit } from './cache.js'
import {
  logSettings,
} from './log-api.js'
import {
  filterFixedTagObj,
  getRecentTagObj
} from './recent-api.js'
import {
  getOptions, setOptions
} from './storage-api.js'
import {
  STORAGE_KEY
} from '../constant/index.js';

export const memo = {
  activeTabId: '',
  previousTabId: '',
  isActiveTabBookmarkManager: false,
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

      this._settings = await getOptions([
        STORAGE_KEY.CLEAR_URL,
        STORAGE_KEY.SHOW_PATH_LAYERS,
        STORAGE_KEY.SHOW_PREVIOUS_VISIT,
        STORAGE_KEY.SHOW_BOOKMARK_TITLE,
        STORAGE_KEY.ADD_BOOKMARK_IS_ON,
        STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
        STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
      ]);
      logSettings('readSavedSettings')
      logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  

      await this.readTagList()

      this._isSettingsActual = true
    }
  },
  get settings() {
    return { ...this._settings }
  },
  async updateShowTagList(value) {
    this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW] = value
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW]: value
    })
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

  _recentTagObj: {},
  _fixedTagObj: {},
  _tagList: [],
  get tagList() {
    return this._tagList
  },
  getTagList() {
    const recentTaLimit = Math.max(
      this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT] - Object.keys(this._fixedTagObj).length,
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

    if (this._settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      logSettings('readTagList 22')
      const savedObj = await getOptions([
        STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP,
        STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP,
      ]);

      if (Object.keys(savedObj[STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]).length === 0) {
        this._fixedTagObj = await filterFixedTagObj(savedObj[STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP])
        this._recentTagObj = await getRecentTagObj(this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT])
      } else {
        this._fixedTagObj = savedObj[STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]
        this._recentTagObj = savedObj[STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP] 
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

    if (this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT] < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a,b) => -(a.dateAdded - b.dateAdded))
        .slice(this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT])
        .map(({ parentId }) => parentId)

        redundantIdList.forEach((id) => {
          delete this._recentTagObj[id]
        })
    }

    this._tagList = this.getTagList()
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
    })
  },
  async removeTag(id) {
    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      delete this._fixedTagObj[id] 
      fixedTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      delete this._recentTagObj[id]
      recentTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this._tagList = this.getTagList()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  },
  async updateTag(id, title) {
    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      this._fixedTagObj[id] = title
      fixedTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      this._recentTagObj[id].title = title
      recentTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this._tagList = this.getTagList()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  },
  async addFixedTag({ parentId, title }) {
    if (!title || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = title

      this._tagList = this.getTagList()
      await setOptions({
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      })
    }
  },
  async removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this._tagList = this.getTagList()
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
    })
  },

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
