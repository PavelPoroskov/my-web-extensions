import {
  filterFixedTagObj,
  filterRecentTagObj,
  getRecentTagObj,
} from '../recent.api.js'
import {
  getUnclassifiedFolderId,
  isDescriptiveFolderTitle,
} from '../special-folder.api.js'
import {
  getOptions,
  setOptions
} from '../storage.api.js'
import {
  USER_OPTION,
  INTERNAL_VALUES,
  TAG_LIST_MAX_LIST_LENGTH,
} from '../storage.api.config.js'
import {
  extensionSettings,
} from './extensionSettings.js'

class TagList {
  isTagListAvailable = true
  _recentTagObj = {}
  _fixedTagObj = {}
  _tagList = []
  LIST_LIMIT
  USE_FLAT_FOLDER_STRUCTURE
  HIGHLIGHT_LAST

  changeCount = 0
  changeProcessedCount = -1

  get list() {
    if (this.changeProcessedCount !== this.changeCount) {
      this.changeProcessedCount = this.changeCount
      this._tagList = this.refillList()
    }

    return this._tagList
  }
  markUpdates() {
    this.changeCount += 1
  }

  async readFromStorage() {
    const settings = await extensionSettings.get()

    if (!settings[USER_OPTION.TAG_LIST_USE]) {
      return
    }

    this.LIST_LIMIT = settings[USER_OPTION.TAG_LIST_LIST_LENGTH]
    this.USE_FLAT_FOLDER_STRUCTURE = settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = settings[USER_OPTION.TAG_LIST_HIGHLIGHT_LAST]

    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_SESSION_STARTED,
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
    ]);

    let actualRecentTagObj = {}
    if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
      actualRecentTagObj = await getRecentTagObj(TAG_LIST_MAX_LIST_LENGTH)
    }

    this._recentTagObj = {
      ...savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP],
      ...actualRecentTagObj,
    }
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP]

    if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
      const isFlatStructure = this.USE_FLAT_FOLDER_STRUCTURE
      this._recentTagObj = await filterRecentTagObj(this._recentTagObj, isFlatStructure)
      this._fixedTagObj = await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
      await setOptions({
        [INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]: true,
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
      })
    }

    this.markUpdates()
  }
  async filterTagListForFlatFolderStructure() {
    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
    ]);
    this._recentTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP]
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP]

    const isFlatStructure = true
    // console.log('filterTagListForFlatFolderStructure ', this._fixedTagObj)
    this._recentTagObj =  await filterRecentTagObj(this._recentTagObj, isFlatStructure)
    this._fixedTagObj =  await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
    // console.log('filterTagListForFlatFolderStructure, after filter', this._fixedTagObj)
    this.markUpdates()

    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
    })
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
        .map(([parentId, title]) => ({
          parentId,
          // title: this._recentTagObj[parentId]?.title || title,
          title,
          isFixed: true,
        }))
    )
      .map((item) => ({ ...item, isLast: lastTagSet.has(item.parentId) }))

    return fullList
      .filter(({ title }) => !!title)
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  }
  async blockTagList(boolValue) {
    this.isTagListAvailable = !boolValue
  }

  async addRecentTagFromFolder(folderNode) {
    if (!this.isTagListAvailable) {
      return
    }

    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.USE_FLAT_FOLDER_STRUCTURE) {
      // if (!(newFolder.parentId === OTHER_BOOKMARKS_FOLDER_ID)) {
      //   return
      // }

      const unclassifiedFolderId = await getUnclassifiedFolderId()
      if (unclassifiedFolderId && folderNode.id === unclassifiedFolderId) {
        return
      }
    }
  
    if (!isDescriptiveFolderTitle(folderNode.title)) {
      return
    }

    this._recentTagObj[folderNode.id] = {
      dateAdded: Date.now(),
      title: folderNode.title
    }

    let fixedTagUpdate
    if (folderNode.id in this._fixedTagObj) {
      this._fixedTagObj[folderNode.id] = folderNode.title
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    if (TAG_LIST_MAX_LIST_LENGTH + 10 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a,b) => -(a.dateAdded - b.dateAdded))
        .slice(TAG_LIST_MAX_LIST_LENGTH)
        .map(({ parentId }) => parentId)

        redundantIdList.forEach((id) => {
          delete this._recentTagObj[id]
        })
    }

    this.markUpdates()
    setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      ...fixedTagUpdate,
    })
  }
  async addRecentTagFromBkm(bkmNode) {
    if (!this.isTagListAvailable) {
      return
    }

    const parentId = bkmNode?.parentId

    if (parentId) {
      const [folderNode] = await chrome.bookmarks.get(parentId)
      await this.addRecentTagFromFolder(folderNode)
    }
  }
  async removeTag(id) {
    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      delete this._fixedTagObj[id] 
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      delete this._recentTagObj[id]
      recentTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this.markUpdates()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  }
  // async updateTag(id, title) {
  //   const isInFixedList = id in this._fixedTagObj
  //   let fixedTagUpdate

  //   if (isInFixedList) {
  //     this._fixedTagObj[id] = title
  //     fixedTagUpdate = {
  //       [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
  //     }
  //   }

  //   const isInRecentList = id in this._recentTagObj
  //   let recentTagUpdate

  //   if (isInRecentList) {
  //     this._recentTagObj[id].title = title
  //     recentTagUpdate = {
  //       [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj
  //     }
  //   }

  //   if (isInFixedList || isInRecentList) {
  //     this.markUpdates()
  //     await setOptions({
  //       ...fixedTagUpdate,
  //       ...recentTagUpdate,
  //     })
  //   }
  // }
  async addFixedTag({ parentId, title }) {
    if (!title || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = title

      this.markUpdates()
      await setOptions({
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      })
    }
  }
  async removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this.markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
    })
  }
}

export const tagList = new TagList()