import {
  isSpecialFolderTitle,
  isDescriptiveFolderTitle,
  isDatedFolderTitle,
} from '../folder-api/index.js'
import {
  USER_OPTION,
  INTERNAL_VALUES,
  TAG_LIST_PINNED_TAGS_POSITION_OPTIONS,
} from '../constant/index.js'
import {
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

  constructor () {
    this.isOn = false
    this.isRestoringDone = false

    this.isFlatStructure = false
    this.AVAILABLE_ROWS = 0
    this.MAX_AVAILABLE_ROWS = 0
    this.HIGHLIGHT_LAST = 0
    this.PINNED_TAGS_POSITION = undefined

    this.isOpenGlobal = false

    this.changeProcessedCount = -1
    this.changeCount = 0

    this._recentTagObj = {}
    this._fixedTagObj = {}

    this._tagList = []
    this._tagIdSet = new Set()
    this._formattedTagList = []
  }

  async useSettings({ isOn, userSettings }) {
    this.isOn = isOn

    await this._readFromStorage({ userSettings })
    this.isRestoringDone = true
  }

  get nAvailableRows() {
    return this.AVAILABLE_ROWS
  }
  _markUpdates() {
    this.changeCount += 1
  }
  _updateList() {
    if (this.changeProcessedCount !== this.changeCount) {
      this.changeProcessedCount = this.changeCount
      this._tagList = this._refillList()
      this._tagIdSet = new Set(this._tagList.map(({ parentId }) => parentId))
      this._formattedTagList = this._formatList(this._tagList)
    }

    return {
      idSet: new Set(this._tagIdSet),
      list: this._tagList.slice(),
      formattedList: this._formattedTagList.slice()
    }
  }
  get list() {
    if (!this.isOn) {
      return []
    }

    const { formattedList } = this._updateList()

    return formattedList
  }

  async _readFromStorage({ userSettings }) {
    logTL('readFromStorage () 00')

    this.isFlatStructure = userSettings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = userSettings[USER_OPTION.TAG_LIST_HIGHLIGHT_LAST]
    this.PINNED_TAGS_POSITION = userSettings[USER_OPTION.TAG_LIST_PINNED_TAGS_POSITION]

    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_SESSION_STARTED,
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
      INTERNAL_VALUES.TAG_LIST_IS_OPEN,
      INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS,
    ]);
    logTL('readFromStorage () 11 savedObj')
    logTL(savedObj)
    this.isOpenGlobal = savedObj[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
    this.AVAILABLE_ROWS = savedObj[INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]
    this.MAX_AVAILABLE_ROWS = this.AVAILABLE_ROWS

    this._recentTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP] || {}
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP] || {}

    if (Object.keys(this._recentTagObj) < this.AVAILABLE_ROWS) {
      if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
        const actualRecentTagObj = await getRecentTagObj(this.AVAILABLE_ROWS)
        this._recentTagObj = {
          ...actualRecentTagObj,
          ...this._recentTagObj,
        }
      }
    }

    this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
    this._fixedTagObj = await filterRecentTagObj(this._fixedTagObj, this.isFlatStructure)

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]: true,
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
    })
  }
  async updateAvailableRows(availableRows) {
    if (!this.isOn) {
      return
    }

    if (!availableRows) {
      return
    }

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
        ...actualRecentTagObj,
        ...this._recentTagObj,
      }
      this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
      Object.assign(updateObj, {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      })
    }

    this._markUpdates()
    await setOptions(updateObj)
  }
  async openTagList(isOpen) {
    if (!this.isOn) {
      return
    }

    this.isOpenGlobal = isOpen
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isOpen
    })
  }
  _formatList(list) {
    logTL('_formatList 00', list)
    let resultList

    if (this.PINNED_TAGS_POSITION == TAG_LIST_PINNED_TAGS_POSITION_OPTIONS.TOP) {
      logTL('_formatList 11')
      resultList = list.toSorted((a, b) => -((a.isFixed || 0 ) - (b.isFixed || 0)) || a.parentTitle.localeCompare(b.parentTitle))

      resultList = highlightAlphabet({
        list: resultList,
        fnGetFirstLetter: ({ isFixed, parentTitle }) => `${isFixed ? 'F': 'R'}#${getFirstLetter(parentTitle)}`
      })
    } else {
      resultList = list.toSorted((a, b) => a.parentTitle.localeCompare(b.parentTitle))

      resultList = highlightAlphabet({
        list: resultList,
        fnGetFirstLetter: ({ parentTitle }) => getFirstLetter(parentTitle),
      })
    }

    return resultList
  }
  _refillList() {
    const recentListSorted = Object.entries(this._recentTagObj)
      .map(([parentId, { parentTitle, dateAdded }]) => ({ parentId, parentTitle, dateAdded }))
      .sort((a, b) => -(a.dateAdded - b.dateAdded))

    const lastTagList = recentListSorted
      .slice(0, this.HIGHLIGHT_LAST)

    const lastTagSet = new Set(
      lastTagList.map(({ parentId }) => parentId)
    )

    const recentTagLimit = Math.max(
      this.AVAILABLE_ROWS - Object.keys(this._fixedTagObj).length,
      0
    )

    const tagList  = [].concat(
      Object.entries(this._fixedTagObj)
      .map(([parentId, { parentTitle, dateAdded }]) => ({
          parentId,
          parentTitle,
          dateAdded,
          isFixed: 1,
        })),
      recentListSorted
        .filter(({ parentId }) => !(parentId in this._fixedTagObj))
        .slice(0, recentTagLimit)
        .map(({ parentId, parentTitle, dateAdded }) => ({
          parentId,
          parentTitle,
          dateAdded,
        })),
    )

    return tagList.map(
      (obj) => (lastTagSet.has(obj.parentId)
        ? Object.assign({}, obj, { isLast: 1 })
        : obj
      )
    )
  }
  async addTag({ parentId, parentTitle }) {
    if (!this.isOn) {
      return
    }

    logTL('addTag 00', parentId, parentTitle)
    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.isFlatStructure) {
      // if (!(newFolder.parentId === OTHER_BOOKMARKS_FOLDER_ID)) {
      //   return
      // }

      if (isSpecialFolderTitle(parentTitle)) {
        return
      }
    }

    if (!isDescriptiveFolderTitle(parentTitle)) {
      return
    }

    if (isDatedFolderTitle(parentTitle)) {
      return
    }

    const dateAdded = Date.now()
    this._recentTagObj[parentId] = {
      parentTitle,
      dateAdded,
    }

    let fixedTagUpdate
    if (parentId in this._fixedTagObj) {
      this._fixedTagObj[parentId] = {
        parentTitle,
        dateAdded,
      }
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    if (this.MAX_AVAILABLE_ROWS && this.MAX_AVAILABLE_ROWS + 20 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { parentTitle, dateAdded }]) => ({ parentId, parentTitle, dateAdded }))
        .sort((a, b) => -(a.dateAdded - b.dateAdded))
        .slice(this.MAX_AVAILABLE_ROWS)
        .map(({ parentId }) => parentId)

      redundantIdList.forEach((id) => {
        delete this._recentTagObj[id]
      })
    }

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      ...fixedTagUpdate,
    })
  }
  async removeTag(id) {
    if (!this.isOn) {
      return
    }

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
      this._markUpdates()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  }
  async fixTag({ parentId, parentTitle }) {
    if (!this.isOn) {
      return
    }

    if (!parentTitle || !parentId) {
      return
    }

    this._fixedTagObj[parentId] = {
      dateAdded: this._recentTagObj[parentId]?.dateAdded || Date.now(),
      parentTitle,
    }

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
    })
  }
  async unfixTag(parentId) {
    if (!this.isOn) {
      return
    }

    delete this._fixedTagObj[parentId]

    this._markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
    })
  }
}

export const tagList = new TagList()
