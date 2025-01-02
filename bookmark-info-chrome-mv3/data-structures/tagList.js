import {
  filterFixedTagObj,
  filterRecentTagObj,
  getRecentTagObj,
} from '../api/recent.api.js'
import {
  getUnclassifiedFolderId,
  isDescriptiveFolderTitle,
} from '../api/special-folder.api.js'
import {
  getOptions,
  setOptions
} from '../api/storage.api.js'
import {
  USER_OPTION,
  INTERNAL_VALUES,
  TAG_LIST_MAX_LIST_LENGTH,
  TAG_LIST_PINNED_TAGS_POSITION_OPTIONS,
} from '../api/storage.api.config.js'
import {
  extensionSettings,
} from './extensionSettings.js'
import {
  highlightAlphabet,
} from './tagList-highlight.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logTL = makeLogFunction({ module: 'tagList.js' })

class TagList {
  _recentTagObj = {}
  _fixedTagObj = {}
  _tagList = []

  USE_TAG_LIST = false
  LIST_LIMIT
  USE_FLAT_FOLDER_STRUCTURE
  HIGHLIGHT_LAST
  HIGHLIGHT_ALPHABET

  changeCount = 0
  changeProcessedCount = -1

  addRecentTagFromFolder = () => { }
  addRecentTagFromBkm = () => { }
  removeTag = () => { }

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

  _enableTagList(isEnabled) {
    logTL('_enableTagList 00', isEnabled)
    if (isEnabled) {
      this.addRecentTagFromFolder = this._addRecentTagFromFolder
      this.addRecentTagFromBkm = this._addRecentTagFromBkm
      this.removeTag = this._removeTag
    } else {
      this.addRecentTagFromFolder = () => { }
      this.addRecentTagFromBkm = () => { }
      this.removeTag = () => { }
    }
  }
  blockTagList(isBlocking) {
    if (this.USE_TAG_LIST) {
      this._enableTagList(!isBlocking)
    }
  }
  async readFromStorage() {
    const settings = await extensionSettings.get()

    this.USE_TAG_LIST = settings[USER_OPTION.USE_TAG_LIST]
    this._enableTagList(this.USE_TAG_LIST)

    this.LIST_LIMIT = settings[USER_OPTION.TAG_LIST_LIST_LENGTH]
    this.USE_FLAT_FOLDER_STRUCTURE = settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = settings[USER_OPTION.TAG_LIST_HIGHLIGHT_LAST]
    this.HIGHLIGHT_ALPHABET = settings[USER_OPTION.TAG_LIST_HIGHLIGHT_ALPHABET]
    this.PINNED_TAGS_POSITION = settings[USER_OPTION.TAG_LIST_PINNED_TAGS_POSITION]

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
    this._recentTagObj = await filterRecentTagObj(this._recentTagObj, isFlatStructure)
    this._fixedTagObj = await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
    // console.log('filterTagListForFlatFolderStructure, after filter', this._fixedTagObj)
    this.markUpdates()

    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
    })
  }
  refillList() {
    const recentTagLimit = Math.max(
      this.LIST_LIMIT - Object.keys(this._fixedTagObj).length,
      0
    )

    const recentTagList = Object.entries(this._recentTagObj)
      .filter(([parentId]) => !(parentId in this._fixedTagObj))
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a, b) => -(a.dateAdded - b.dateAdded))
      .slice(0, recentTagLimit)

    const lastTagList = Object.entries(this._recentTagObj)
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a, b) => -(a.dateAdded - b.dateAdded))
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
      .filter(({ title }) => !!title)
      .map((item) => ({
        ...item,
        isLast: lastTagSet.has(item.parentId),
      }))

    let resultList
    if (this.PINNED_TAGS_POSITION == TAG_LIST_PINNED_TAGS_POSITION_OPTIONS.TOP) {
      resultList = fullList.sort((a, b) => -(+a.isFixed - b.isFixed) || a.title.localeCompare(b.title))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ isFixed, title }) => `${isFixed ? 'F': 'R'}#${title.at(0).toUpperCase()}`
        })
      }
    } else {
      resultList = fullList.sort((a, b) => a.title.localeCompare(b.title))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ title }) => title.at(0).toUpperCase(),
        })
      }
    }

    return resultList
  }
  async _addRecentTagFromFolder(folderNode) {
    logTL('_addRecentTagFromFolder 00', folderNode)
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
        .sort((a, b) => -(a.dateAdded - b.dateAdded))
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
  async _addRecentTagFromBkm(bkmNode) {
    const parentId = bkmNode?.parentId

    if (parentId) {
      const [folderNode] = await chrome.bookmarks.get(parentId)
      await this.addRecentTagFromFolder(folderNode)
    }
  }
  async _removeTag(id) {
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
