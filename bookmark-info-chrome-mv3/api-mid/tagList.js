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
  isOn = true

  isFlatStructure = false
  isOpenGlobal = false
  AVAILABLE_ROWS = 0
  MAX_AVAILABLE_ROWS = 0
  HIGHLIGHT_LAST = false
  HIGHLIGHT_ALPHABET = false
  PINNED_TAGS_POSITION = undefined

  changeCount = 0
  changeProcessedCount = -1

  _recentTagObj = {}
  _fixedTagObj = {}

  recentListDesc = []
  recentListLimit = []
  tagList = []
  tagListFormat = []
  tagIdSet = new Set()

  get nAvailableRows() {
    return this.AVAILABLE_ROWS
  }
  _markUpdates() {
    this.changeCount += 1
  }

  async _readFromStorage({ userSettings }) {
    logTL('readFromStorage () 00')

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
    logTL('readFromStorage () 11 savedObj')
    logTL(savedObj)
    this.isOpenGlobal = savedObj[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
    this.AVAILABLE_ROWS = savedObj[INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]
    this.MAX_AVAILABLE_ROWS = this.AVAILABLE_ROWS

    let actualRecentTagObj = {}
    if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
      actualRecentTagObj = await getRecentTagObj(this.AVAILABLE_ROWS)
    }

    const savedRecentObj = savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP] || {}
    const savedRecentObj2 = Object.fromEntries(
      Object.entries(savedRecentObj).map(([parentId, item]) => [
        parentId,
        {
          parentTitle: item.parentTitle || item.title,
          dateAdded: item.dateAdded,
        }
      ])
    )
    this._recentTagObj = {
      ...savedRecentObj2,
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

    this._markUpdates()
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
        ...this._recentTagObj,
        ...actualRecentTagObj,
      }
      this._recentTagObj = await filterRecentTagObj(this._recentTagObj, this.isFlatStructure)
      Object.assign(updateObj, {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      })
    }

    await setOptions(updateObj)
    this._markUpdates()
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
    // logTL('formatList () 00', list)

    const inList = list.filter(({ parentTitle }) => !!parentTitle)
    const lastTagList = this.recentListDesc
      .slice(0, this.HIGHLIGHT_LAST)

    const lastTagSet = new Set(
      lastTagList.map(({ parentId }) => parentId)
    )

    let resultList
    if (this.PINNED_TAGS_POSITION == TAG_LIST_PINNED_TAGS_POSITION_OPTIONS.TOP) {
      resultList = inList.sort((a, b) => -(+a.isFixed - b.isFixed) || a.parentTitle.localeCompare(b.parentTitle))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ isFixed, parentTitle }) => `${isFixed ? 'F': 'R'}#${getFirstLetter(parentTitle)}`
        })
      }
    } else {
      resultList = inList.sort((a, b) => a.parentTitle.localeCompare(b.parentTitle))

      if (this.HIGHLIGHT_ALPHABET) {
        resultList = highlightAlphabet({
          list: resultList,
          fnGetFirstLetter: ({ parentTitle }) => getFirstLetter(parentTitle),
        })
      }
    }

    return resultList.map((item) => ({
      ...item,
      isLast: lastTagSet.has(item.parentId),
    }))
  }
  getListWithBookmarks(addTagList = []) {
    if (!this.isOn) {
      return []
    }

    logTL('getListWithBookmarks () 00', addTagList)

    if (this.changeProcessedCount !== this.changeCount) {
      logTL('getListWithBookmarks () 11')
      this.changeProcessedCount = this.changeCount

      this.recentListDesc = Object.entries(this._recentTagObj)
        .map(([parentId, { parentTitle, dateAdded }]) => ({ parentId, parentTitle, dateAdded }))
        .sort((a, b) => -(a.dateAdded - b.dateAdded))

      const recentTagLimit = Math.max(
        this.AVAILABLE_ROWS - Object.keys(this._fixedTagObj).length,
        0
      )

      this.recentListLimit = this.recentListDesc
        .filter(({ parentId }) => !(parentId in this._fixedTagObj))
        .slice(0, recentTagLimit)

      logTL('getListWithBookmarks () 11 this._fixedTagObj', this._fixedTagObj)

      this.tagList  = [].concat(
        Object.entries(this._fixedTagObj)
          .map(([parentId, parentTitle]) => ({
            parentId,
            parentTitle,
            isFixed: true,
          })),
        this.recentListLimit
          .map(({ parentId, parentTitle }, index) => ({ parentId, parentTitle, isFixed: false, ageIndex: index })),
      )


      this.tagIdSet = new Set(this.tagList.map(({ parentId }) => parentId))

      this.tagListFormat = this._formatList(this.tagList)
    }


    logTL('getListWithBookmarks () 22')
    const finalAddTagList = addTagList
      .filter(({ parentId }) => !this.tagIdSet.has(parentId))

    const requiredSlots = finalAddTagList.length

    if (requiredSlots === 0) {
      logTL('getListWithBookmarks () 33 length', this.tagListFormat.length)
      // logTL(this.tagListFormat)
      return this.tagListFormat
    }

    logTL('getListWithBookmarks () 44 finalAddTagList', finalAddTagList)
    const addSet = new Set(addTagList.map(({ parentId }) => parentId))

    const availableSlots = Math.max(0, this.AVAILABLE_ROWS - this.tagList.length)
    const replaceSlots = Math.max(0, requiredSlots - availableSlots)
    const replaceList = finalAddTagList.slice(0, replaceSlots)
    const connectList = finalAddTagList.slice(replaceSlots)

    let resultList = this.tagList.slice()

    if (0 < replaceList.length) {

      let iTo = resultList.length - 1
      let iFrom = replaceList.length - 1

      while (-1 < iFrom && -1 < iTo) {
        const item = resultList[iTo]

        if (!item.isFixed && !addSet.has(item.parentId)) {
          resultList[iTo].parentId = replaceList[iFrom].parentId
          resultList[iTo].parentTitle = replaceList[iFrom].parentTitle
          iFrom = iFrom - 1
        }
        iTo = iTo - 1
      }
    }
    if (0 < connectList.length) {
      const ageIndex = this.recentListLimit.length
      resultList = resultList.concat(
        connectList.map(({ parentId, parentTitle }) => ({ parentId, parentTitle, isFixed: false, ageIndex }))
      )
    }

    const tagListFormatWith = this._formatList(resultList)
    logTL('getListWithBookmarks () 99', tagListFormatWith.length)

    return tagListFormatWith
  }
  async addTag({ parentId, parentTitle }) {
    if (!this.isOn) {
      return
    }

    logTL('_addRecentTagFromFolder 00', parentId, parentTitle)
    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.isFlatStructure) {
      // if (!(newFolder.parentId === OTHER_BOOKMARKS_FOLDER_ID)) {
      //   return
      // }

      const unclassifiedFolderId = await getUnclassifiedFolderId()
      if (unclassifiedFolderId && parentId === unclassifiedFolderId) {
        return
      }
    }

    if (!isDescriptiveFolderTitle(parentTitle)) {
      return
    }

    if (isDatedFolderTitle(parentTitle)) {
      return
    }

    this._recentTagObj[parentId] = {
      dateAdded: Date.now(),
      parentTitle,
    }

    let fixedTagUpdate
    if (parentId in this._fixedTagObj) {
      this._fixedTagObj[parentId] = parentTitle
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    if (this.MAX_AVAILABLE_ROWS + 20 < Object.keys(this._recentTagObj).length) {
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
    setOptions({
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

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = parentTitle

      this._markUpdates()
      await setOptions({
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      })
    }
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

  async useSettings({ isOn, userSettings }) {
    this.isOn = isOn

    this.changeCount = 0
    this.changeProcessedCount = -1

    await this._readFromStorage({ userSettings })
  }
}

export const tagList = new TagList()
