import {
  USER_OPTION,
} from '../constant/index.js'
import {
  page,
} from '../api-mid/index.js'
import {
  getBookmarkListWithParent,
} from '../api-low/index.js';
import {
  removeQueryParamsIfTarget,
} from '../url-api/index.js'
import {
  removeBookmark,
} from '../bookmark-controller-api/bookmark-ignore.js'

function makeIsTitleMatchForEvents(patternList) {
  const isFnList = []

  patternList
    .filter(Boolean)
    .forEach((pattern) => {
      const asteriskIndex = pattern.indexOf('*')

      if (asteriskIndex == pattern.length - 1) {
        const start = pattern.slice(0, -1)
        isFnList.push((title) => title.startsWith(start))
      } else {
        isFnList.push((title) => title == pattern)
      }
    })

  return (title) => isFnList.some((isFn) => isFn(title))
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

  async onVisitUrl({ url }) {
    if (!this.isOnVisit) {
      return
    }

    if (this.deleteListOnVisit.length == 0) {
      return
    }

    const cleanUrl = removeQueryParamsIfTarget(url);
    const bookmarkListWithParent = await getBookmarkListWithParent({ url: cleanUrl })
    const deleteList = []

    const isTitleMatch = makeIsTitleMatchForEvents(this.deleteListOnVisit)

    bookmarkListWithParent.forEach(({ id, parentTitle }) => {
      if (isTitleMatch(parentTitle)) {
        deleteList.push(id)
      }
    })

    await deleteList.reduce(
      (promiseChain, bkmId) => promiseChain.then(
        () => removeBookmark(bkmId)
      ),
      Promise.resolve(),
    );
  }

  onCreateBookmark({ url }) {
    if (!this.isOnCreateBookmark) {
      return
    }

    if (this.deleteListOnCreate.length == 0) {
      return
    }

  }
}

export const urlEvents = new UrlEvents()
