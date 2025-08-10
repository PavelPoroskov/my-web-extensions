import {
  USER_OPTION,
} from '../constant/index.js'
import {
  page,
} from '../api-mid/index.js'
import {
  getBookmarkListWithParent,
} from '../bookmark-list-api/bookmark-list-with-parent.js';
import {
  removeQueryParamsIfTarget,
} from '../url-api/index.js'
import {
  removeBookmark,
} from '../bookmark-controller-api/bookmark-ignore.js'
import {
  getTitleForPattern,
} from '../folder-api/index.js';

function makeIsTitleMatchForEvents(patternList) {
  const isFnList = []

  patternList
    .filter(Boolean)
    .map((pattern) => pattern.toLowerCase())
    .forEach((pattern) => {
      const asteriskIndex = pattern.indexOf('*')

      if (asteriskIndex == pattern.length - 1 && 0 < asteriskIndex) {
        const start = pattern.slice(0, -1)
        isFnList.push((title) => title.startsWith(start))
      } else {
        isFnList.push((title) => title == pattern)
      }
    })

  return (title) => {
    const titleLow = title.toLowerCase()

    return isFnList.some((isFn) => isFn(titleLow))
  }
}

function isTitleMatchForEvents({ title, pattern }) {
  let result = false
  const titleLow = title.toLowerCase()
  const patternLow = pattern.toLowerCase()

  const asteriskIndex = patternLow.indexOf('*')

  if (asteriskIndex == patternLow.length - 1 && 0 < asteriskIndex) {
    const start = patternLow.slice(0, -1)
    result = titleLow.startsWith(start)
  } else {
    result = (titleLow == patternLow)
  }

  return result
}

class UrlEvents {
  constructor () {
    this.isOnClearUrl = false

    this.isOnCreateBookmark = false
    this.deleteListOnCreate = []

    this.isOnVisit = false
    this.deleteListOnVisit = []
  }

  useSettings({ userSettings }) {
    this.isOnClearUrl = userSettings[USER_OPTION.CLEAR_URL_ON_PAGE_OPEN],

    this.isOnCreateBookmark = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_CREATING]
    this.deleteListOnCreate = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_CREATING_LIST]

    this.isOnVisit = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_VISITING]
    this.deleteListOnVisit = userSettings[USER_OPTION.DELETE_BOOKMARK_ON_VISITING_LIST]
  }

  async onPageReady({ tabId, url }) {
    this.onVisitUrl({ url })

    if (!this.isOnClearUrl) {
      return
    }

    const cleanUrl = removeQueryParamsIfTarget(url);

    if (url !== cleanUrl) {
      await page.changeUrlInTab({ tabId, url: cleanUrl })
    }
  }

  async _removeBookmarksByPatterns({ url, patternList }) {
    // console.log('_removeBookmarksByPatterns() 00 ')
    // console.log(url)
    // console.log('patternList ', patternList)
    if (patternList.length == 0) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    const cleanUrl = removeQueryParamsIfTarget(url);
    const bookmarkListWithParent = await getBookmarkListWithParent(cleanUrl)
    const deleteList = []

    const isTitleMatch = makeIsTitleMatchForEvents(patternList)

    bookmarkListWithParent.forEach(({ id, parentTitle }) => {
      const normalizedParentTitle = getTitleForPattern(parentTitle)

      if (isTitleMatch(normalizedParentTitle)) {
        deleteList.push(id)
      }
    })

    // console.log('deleteList ', deleteList)

    await deleteList.reduce(
      (promiseChain, bkmId) => promiseChain.then(
        () => removeBookmark(bkmId)
      ),
      Promise.resolve(),
    );
  }

  async onVisitUrl({ url }) {
    if (!this.isOnVisit) {
      return
    }

    await this._removeBookmarksByPatterns({ url, patternList: this.deleteListOnVisit })
  }

  async onCreateBookmark({ url, parentTitle }) {
    // console.log('onCreateBookmark() 00')
    // console.log(url)
    // console.log('parentTitle ', parentTitle)
    if (!this.isOnCreateBookmark) {
      return
    }

    if (this.deleteListOnCreate.length == 0) {
      return
    }

    const createDeleteTemplateList = []

    this.deleteListOnCreate
      .filter(Boolean)
      .map((template) => {
        const parts = template.split('->')

        if (parts.length == 2) {
          createDeleteTemplateList.push({
            createTemplate: parts[0].trim(),
            deleteTemplate: parts[1].trim(),
          })
        }
      })

    const normalizedParentTitle = getTitleForPattern(parentTitle)

    const deleteTemplateList = createDeleteTemplateList
      .filter(({ createTemplate }) => isTitleMatchForEvents({ title: normalizedParentTitle, pattern: createTemplate }))
      .map(({ deleteTemplate }) => deleteTemplate)

    // console.log('deleteTemplateList ', deleteTemplateList)

    await this._removeBookmarksByPatterns({ url, patternList: deleteTemplateList })
  }
}

export const urlEvents = new UrlEvents()
