import {
  getUnclassifiedFolderId,
  isDescriptiveFolderTitle,
  isDatedFolderTitle,
} from '../folder-api/index.js'
import {
  USER_OPTION,
  INTERNAL_VALUES,
  TAG_LIST_PINNED_TAGS_POSITION_OPTIONS,
} from '../constant/index.js'
import {
  filterFixedTagObj,
  filterRecentTagObj,
  getRecentTagObj,
} from './tagList-getRecent.js'
import {
  highlightAlphabet,
  getFirstLetter,
} from './tagList-highlight.js'
import {
  getOptions,
  setOptions,
  makeLogFunction,
} from '../api-low/index.js'

const logTL = makeLogFunction({ module: 'tagList.js' })

class TagList {
  isOn = false
  isFlatStructure = false

  _recentTagObj = {}
  _fixedTagObj = {}
  _nFixedTags = 0
  _tagList = []

  changeCount = 0
  changeProcessedCount = 0


  isOpenGlobal = false
  AVAILABLE_ROWS = 0
  MAX_AVAILABLE_ROWS = 0
  HIGHLIGHT_LAST = false
  HIGHLIGHT_ALPHABET = false
  PINNED_TAGS_POSITION = undefined

  addRecentTagFromFolder = () => { }
  removeTag = () => { }

  addFixedTag = () => { }
  removeFixedTag = () => { }

  openTagList = () => { }
  updateAvailableRows = () => { }

  get list() {
    if (this.changeProcessedCount !== this.changeCount) {
      this.changeProcessedCount = this.changeCount
      this._tagList = this.refillList()
      this._nFixedTags = Object.keys(this._fixedTagObj).length
    }

    return this._tagList
  }
  get nFixedTags() {
    if (this.changeProcessedCount !== this.changeCount) {
      this.changeProcessedCount = this.changeCount
      this._tagList = this.refillList()
      this._nFixedTags = Object.keys(this._fixedTagObj).length
    }
    logTL('get nFixedTags() 00', this._nFixedTags)

    return this._nFixedTags
  }
  get nAvailableRows() {
    return this.AVAILABLE_ROWS
  }
  markUpdates() {
    this.changeCount += 1
  }

  async readFromStorage({ userSettings }) {
    this.isFlatStructure = userSettings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = userSettings[USER_OPTION.TAG_LIST_HIGHLIGHT_LAST]
    this.HIGHLIGHT_ALPHABET = userSettings[USER_OPTION.TAG_LIST_HIGHLIGHT_ALPHABET]
    this.PINNED_TAGS_POSITION = userSettings[USER_OPTION.TAG_LIST_PINNED_TAGS_POSITION]

    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_SESSION_STARTED,
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
      INTERNAL_VALUES.TAG_LIST_IS_OPEN,
      INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS,
    ]);
    this.isOpenGlobal = savedObj[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
    this.AVAILABLE_ROWS = savedObj[INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]
    this.MAX_AVAILABLE_ROWS = this.AVAILABLE_ROWS

    let actualRecentTagObj = {}
    if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
      actualRecentTagObj = await getRecentTagObj(this.AVAILABLE_ROWS)
    }

    this._recentTagObj = {
      ...savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP],
      ...actualRecentTagObj,
    }
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP]

    this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
    this._fixedTagObj = await filterFixedTagObj(this._fixedTagObj, this.isFlatStructure)
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]: true,
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
    })

    this.markUpdates()
  }
  async _updateAvailableRows(availableRows) {
    logTL('updateAvailableRows () 00', availableRows)
    const beforeAvailableRows = this.AVAILABLE_ROWS
    this.AVAILABLE_ROWS = availableRows
    this.MAX_AVAILABLE_ROWS = Math.max(this.MAX_AVAILABLE_ROWS, this.AVAILABLE_ROWS)

    const updateObj = {
      [INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]: availableRows,
    }

    if (beforeAvailableRows < availableRows) {
      let actualRecentTagObj = await getRecentTagObj(this.AVAILABLE_ROWS)
      this._recentTagObj = {
        ...this._recentTagObj,
        ...actualRecentTagObj,
      }
      this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
      Object.assign(updateObj, {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      })
    }

    await setOptions(updateObj)
    this.markUpdates()
  }
  async _openTagList(isOpen) {
    this.isOpenGlobal = isOpen
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isOpen
    })
  }
  refillList() {
    const recentTagLimit = Math.max(
      this.AVAILABLE_ROWS - Object.keys(this._fixedTagObj).length,
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
        .map(({ parentId, title }, index) => ({ parentId, title, isFixed: false, ageIndex: index })),
      Object.entries(this._fixedTagObj)
        .map(([parentId, title]) => ({
          parentId,
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
          fnGetFirstLetter: ({ isFixed, title }) => `${isFixed ? 'F': 'R'}#${getFirstLetter(title)}`
        })
      }
    } else {
      resultList = fullList.sort((a, b) => a.title.localeCompare(b.title))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ title }) => getFirstLetter(title),
        })
      }
    }

    return resultList
  }
  async _addRecentTagFromFolder(folderNode) {
    logTL('_addRecentTagFromFolder 00', folderNode)
    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.isFlatStructure) {
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

    if (isDatedFolderTitle(folderNode.title)) {
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

    if (this.MAX_AVAILABLE_ROWS + 20 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a, b) => -(a.dateAdded - b.dateAdded))
        .slice(this.MAX_AVAILABLE_ROWS)
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
  // async _addRecentTagFromBkm(bkmNode) {
  //   const parentId = bkmNode?.parentId

  //   if (parentId) {
  //     const [folderNode] = await chrome.bookmarks.get(parentId)
  //     await this.addRecentTagFromFolder(folderNode)
  //   }
  // }
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
  async _addFixedTag({ parentId, title }) {
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
  async _removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this.markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
    })
  }

  useSettings({ isOn, userSettings }) {
    this.isOn = isOn

    if (isOn) {
      this.addRecentTagFromFolder = this._addRecentTagFromFolder
      this.removeTag = this._removeTag

      this.addFixedTag = this._addFixedTag
      this.removeFixedTag = this._removeFixedTag

      this.openTagList = this._openTagList
      this.updateAvailableRows = this._updateAvailableRows

      // tagList.list
      // tagList.isOpenGlobal
      // tagList.nAvailableRows
      // tagList.nFixedTags
    } else {
      this.addRecentTagFromFolder = () => { }
      this.removeTag = () => { }

      this.addFixedTag = () => { }
      this.removeFixedTag = () => { }

      this.openTagList = () => { }
      this.updateAvailableRows = () => { }
    }


    if (isOn) {
      this.changeCount = 0
      this.changeProcessedCount = 0

      this.readFromStorage({ userSettings })
    } else {

      this.isFlatStructure = false

      this._recentTagObj = {}
      this._fixedTagObj = {}
      this._nFixedTags = 0
      this._tagList = []

      this.changeCount = 0
      this.changeProcessedCount = 0

      this.isOpenGlobal = false
      this.AVAILABLE_ROWS = 0
      this.MAX_AVAILABLE_ROWS = 0
      this.HIGHLIGHT_LAST = false
      this.HIGHLIGHT_ALPHABET = false
      this.PINNED_TAGS_POSITION = undefined
    }
  }
}

export const tagList = new TagList()
