import {
  filterFixedTagObj,
  filterRecentTagObj,
  getRecentTagObj,
} from '../recent-api.js'
import {
  OTHER_BOOKMARKS_FOLDER_ID,
  getNestedRootFolderId,
  getUnclassifiedFolderId,
  isDescriptiveTitle,
} from '../special-folder.api.js'
import {
  STORAGE_KEY,
  ADD_BOOKMARK_LIST_MAX
} from '../../constant/index.js';
import {
  getOptions,
  setOptions
} from '../storage-api.js'
import {
  extensionSettings,
} from './extensionSettings.js'

class TagList {
  isTagListAvailable = true
  _recentTagObj = {}
  _fixedTagObj = {}
  _tagList = []
  LIST_LIMIT
  FORCE_FLAT_FOLDER_STRUCTURE
  HIGHLIGHT_LAST

  get list() {
    return this._tagList
  }

  async readFromStorage() {
    const settings = await extensionSettings.get()

    if (!settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      return
    }

    const savedObj = await getOptions([
      STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP,
      STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP,
      STORAGE_KEY.ADD_BOOKMARK_SESSION_STARTED,
    ]);

    this.LIST_LIMIT = settings[STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT]
    this.FORCE_FLAT_FOLDER_STRUCTURE = settings[STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = settings[STORAGE_KEY.ADD_BOOKMARK_HIGHLIGHT_LAST]

    let actualRecentTagObj = {}
    if (!savedObj[STORAGE_KEY.ADD_BOOKMARK_SESSION_STARTED]) {
      actualRecentTagObj = await getRecentTagObj(ADD_BOOKMARK_LIST_MAX)
      await setOptions({
        [STORAGE_KEY.ADD_BOOKMARK_SESSION_STARTED]: true,
      })
    }

    this._recentTagObj = {
      ...savedObj[STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP],
      ...actualRecentTagObj,
    }
    this._fixedTagObj = savedObj[STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]

    const isFlatStructure = this.FORCE_FLAT_FOLDER_STRUCTURE
    this._recentTagObj = await filterRecentTagObj(this._recentTagObj, isFlatStructure)
    this._fixedTagObj = await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj,
    })

    this._tagList = this.refillList()
  }
  refillList() {
    const recentTaLimit = Math.max(
      this.LIST_LIMIT - Object.keys(this._fixedTagObj).length,
      0
    )

    const recentTagList = Object.entries(this._recentTagObj)
      .filter(([parentId]) => !(parentId in this._fixedTagObj))
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, recentTaLimit)

    const lastTagList = Object.entries(this._recentTagObj)
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, this.HIGHLIGHT_LAST)
    const lastTagSet = new Set(
      lastTagList.map(({ parentId }) => parentId)
    )
    
    const fullList = [].concat(
      recentTagList
        .map(({ parentId, title }) => ({ parentId, title, isFixed: false })),
      Object.entries(this._fixedTagObj)
        .map(([parentId, title]) => ({ parentId, title, isFixed: true }))
    )
      .map((item) => ({ ...item, isLast: lastTagSet.has(item.parentId) }))

    return fullList
      .filter(({ title }) => !!title)
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  }
  async blockTagList(boolValue) {
    this.isTagListAvailable = !boolValue
  }
  async addRecentTag(bkmNode) {
    if (!this.isTagListAvailable) {
      return
    }

    let newFolderId
    let newFolder

    if (!bkmNode.url) {
      newFolderId = bkmNode.id
      newFolder = bkmNode
    } else {
      newFolderId = bkmNode.parentId;
      ([newFolder] = await chrome.bookmarks.get(newFolderId))
    }

    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.FORCE_FLAT_FOLDER_STRUCTURE) {
      if (!(newFolder.parentId === OTHER_BOOKMARKS_FOLDER_ID)) {
        return
      }

      const nestedRootFolderId = await getNestedRootFolderId()
      const unclassifiedFolderId = await getUnclassifiedFolderId()
      if (nestedRootFolderId && newFolder.id === nestedRootFolderId) {
        return
      }
      if (unclassifiedFolderId && newFolder.id === unclassifiedFolderId) {
        return
      }
    }
  
    if (!isDescriptiveTitle(newFolder.title)) {
      return
    }

    const dateAdded = bkmNode.dateAdded || Date.now()

    this._recentTagObj[newFolderId] = {
      dateAdded,
      title: newFolder.title
    }

    if (ADD_BOOKMARK_LIST_MAX + 10 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a,b) => -(a.dateAdded - b.dateAdded))
        .slice(ADD_BOOKMARK_LIST_MAX)
        .map(({ parentId }) => parentId)

        redundantIdList.forEach((id) => {
          delete this._recentTagObj[id]
        })
    }

    this._tagList = this.refillList()
    setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
    })
  }
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
      this._tagList = this.refillList()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  }
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
      this._tagList = this.refillList()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  }
  async addFixedTag({ parentId, title }) {
    if (!title || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = title

      this._tagList = this.refillList()
      await setOptions({
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      })
    }
  }
  async removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this._tagList = this.refillList()
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
    })
  }

  // async filterTagListForFlatFolderStructure() {
  //   const isFlatStructure = true
  //   // console.log('filterTagListForFlatFolderStructure ', this._fixedTagObj)
  //   this._recentTagObj =  await filterRecentTagObj(this._recentTagObj, isFlatStructure)
  //   this._fixedTagObj =  await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
  //   // console.log('filterTagListForFlatFolderStructure, after filter', this._fixedTagObj)
  //   this._tagList = this.refillList()
  //   await setOptions({
  //     [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj,
  //     [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj,
  //   })
  // }
}

export const tagList = new TagList()