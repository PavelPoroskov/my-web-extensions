import {
  createBookmarkVisited,
  createBookmarkOpened,
} from '../bookmark-controller-api/bookmark-visited.js'
import {
  findOrCreateFolderByTitleInRoot,
} from '../bookmark-controller-api/folder-create.js'
import {
  CacheWithLimit,
  debounce,
  makeLogFunction,
} from '../api-low/index.js'
import {
  DATED_TEMPLATE_VISITED,
  DATED_TEMPLATE_OPENED,
} from '../folder-api/index.js'
import {
  removeQueryParamsIfTarget,
} from '../url-api/index.js'

const logVU = makeLogFunction({ module: 'visited-urls.js' })

const URL_MARK_OPTIONS = {
  OPENED: 'OPENED',
  VISITED: 'VISITED',
}

class VisitedUrls {
  constructor () {
    this.isOn = false

    this.cacheVisitedUrls = new CacheWithLimit({ name: 'cacheVisitedUrls', size: 500 });
    this.cacheTabId = new CacheWithLimit({ name: 'cacheVisitedTabIds', size: 500 });
  }

  useSettings({ isOn }) {
    logVU("useSettings", { isOn })
    this.isOn = isOn

    if (!this.isOn) {
      this.cacheVisitedUrls.clear()
      this.cacheTabId.clear()
    }

    if (this.isOn) {
      findOrCreateFolderByTitleInRoot(DATED_TEMPLATE_VISITED)
      findOrCreateFolderByTitleInRoot(DATED_TEMPLATE_OPENED)
    }
  }

  async _markUrl({ url, title, mark }) {
    if (!this.isOn) {
      return
    }

    if (!url) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    switch (mark) {
      case URL_MARK_OPTIONS.VISITED: {
        logVU("**** _markUrl 11 VISITED", url)
        await createBookmarkVisited({ url, title })
        break
      }
      case URL_MARK_OPTIONS.OPENED: {
        logVU("**** _markUrl 11 OPENED", url)
        await createBookmarkOpened({ url, title })
        break
      }
    }
  }

  _onReplaceUrlInActiveTab({
    tabId,
    oldUrl: inOldUrl,
    oldTitle,
    newUrl: inNewUrl,
    newTitle,
  }) {
    const oldUrl = removeQueryParamsIfTarget(inOldUrl);
    const newUrl = removeQueryParamsIfTarget(inNewUrl);
    logVU("_onReplaceUrlInTab 11/1", tabId, oldUrl)
    logVU("_onReplaceUrlInTab 11/2", tabId, newUrl)

    if (oldUrl == newUrl) {
      return
    }

    // mark oldUrl as visited
    // const title = this.cacheVisitedUrls.get(oldUrl)
    // logVU("_onReplaceUrlInTab 22", 'title', title)

    // logVU("_onReplaceUrlInTab 22 oldTitle", oldTitle)
    if (oldUrl && oldTitle) {
      // logVU("_onReplaceUrlInTab 222")
      this._markUrl({ url: oldUrl, title: oldTitle, mark: URL_MARK_OPTIONS.VISITED })
    }

    // mark newUrl as activated
    if (newUrl) {
      // logVU("_onReplaceUrlInTab 33 newTitle", newTitle)
      this.cacheVisitedUrls.add(newUrl, newTitle)
    }
  }

  _debouncedReplaceUrl = debounce(this._onReplaceUrlInActiveTab.bind(this), 40)

  updateTab(tabId, changeInfo, isActiveTab) {
    logVU("_onUpdateTab 00", tabId, changeInfo)

    let beforeData = this.cacheTabId.get(tabId)
    const updateObj = {}

    // if (changeInfo?.status == 'loading' && changeInfo?.url) {
    if (changeInfo?.status && changeInfo?.url) {
      if (changeInfo.url !== beforeData?.url) {
        updateObj.time = Date.now()

        if (beforeData) {
          updateObj.before = {
            url: beforeData.url,
            title: beforeData.title,
          }

          delete beforeData.before
        }

        beforeData = undefined
      }
    }

    if (changeInfo?.status == 'complete') {
      updateObj.isComplete = true
    }

    if (changeInfo?.url) {
      updateObj.url = changeInfo?.url
    }

    if (changeInfo?.title) {
      updateObj.title = changeInfo?.title
    }

    if (Object.keys(updateObj).length == 0) {
      return
    }

    const afterData = {
      ...beforeData,
      ...updateObj,
    }
    logVU("_onUpdateTab 55", tabId, afterData)

    this.cacheTabId.add(tabId, afterData)

    if (updateObj.title) {
      const { url } = afterData

      if (url) {
        if (this.cacheVisitedUrls.has(url)) {
          this.cacheVisitedUrls.add(url, updateObj.title)
        }
      }
    }

    if (isActiveTab && afterData.url && afterData.title != undefined && afterData.isComplete) {
      this._debouncedReplaceUrl({
        tabId,
        oldUrl: afterData?.before?.url,
        oldTitle: afterData?.before?.title,
        newUrl: afterData.url,
        newTitle: afterData.title,
      })
    }
  }

  visitTab(tabId, url, title) {
    if (!url) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    logVU("visitTab 00-", url, "-", title, "-")
    const cleanedUrl = removeQueryParamsIfTarget(url);

    this.cacheVisitedUrls.add(cleanedUrl, title)
    // this.cacheTabId.add(tabId, { url: cleanedUrl, title })
  }

  async closeTab(tabId) {
    logVU("closeTab 11", tabId)
    const cachedTabData = this.cacheTabId.get(tabId)
    logVU("closeTab 22 cachedTabData", cachedTabData)

    if (!cachedTabData) {
      return
    }
    const { url, title: cachedTitle } = cachedTabData
    logVU("closeTab 33", url)
    const title = cachedTitle || url

    if (this.cacheVisitedUrls.has(url)) {
      logVU("closeTab 44", title)
      this._markUrl({ url, title, mark: URL_MARK_OPTIONS.VISITED })
    } else {
      logVU("closeTab 55", title)
      this._markUrl({ url, title, mark: URL_MARK_OPTIONS.OPENED })
    }

    this.cacheTabId.delete(tabId)
    logVU("closeTab 99", tabId)
  }
}

export const visitedUrls = new VisitedUrls()
