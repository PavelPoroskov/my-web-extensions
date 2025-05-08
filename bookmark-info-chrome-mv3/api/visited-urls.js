import {
  createBookmarkVisited,
  createBookmarkOpened,
} from '../bookmark-controller-api/bookmark-visited.js'
import {
  findOrCreateFolderByTitleInRoot,
} from '../bookmark-controller-api/folder-create.js'
import {
  CacheWithLimit,
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
    this.cacheVisitedUrls = new CacheWithLimit({ name: 'cacheVisitedUrls', size: 500 });
    this.cacheTabId = new CacheWithLimit({ name: 'cacheVisitedTabIds', size: 500 });
  }

  onUpdateTab = () => { }
  onActivateTab = () => { }
  onReplaceUrlInActiveTab = () => { }
  onCloseTab = () => { }

  markUrl({ url, title, mark }) {
    if (!url) {
      return
    }

    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    switch (mark) {
      case URL_MARK_OPTIONS.VISITED: {
        createBookmarkVisited({ url, title })
        break
      }
      case URL_MARK_OPTIONS.OPENED: {
        createBookmarkOpened({ url, title })
        break
      }
    }
  }

  _onActivateTab(tabId, url, title) {
    logVU("_onActivateTab 00 ", url)
    const cleanedUrl = removeQueryParamsIfTarget(url);
    logVU("_onActivateTab 11 ", cleanedUrl)

    this.cacheVisitedUrls.add(cleanedUrl, title)
    this.cacheTabId.add(tabId, { url: cleanedUrl, title })
  }
  _onUpdateTab(tabId, oData) {
    const newData = {}

    if (oData?.url) {
      newData.url = oData?.url
    }

    if (oData?.title) {
      newData.title = oData?.title
    }

    if (Object.keys(newData).length == 0) {
      return
    }
    logVU("_onUpdateTab 11", tabId, newData)

    const before = this.cacheTabId.get(tabId)
    const after = {
      ...before,
      ...newData,
    }

    this.cacheTabId.add(tabId, after)
  }
  _onReplaceUrlInActiveTab({ tabId, oldUrl, newUrl, newTitle }) {
    if (oldUrl == newUrl) {
      return
    }

    logVU("_onReplaceUrlInTab 11/1", tabId, oldUrl)
    logVU("_onReplaceUrlInTab 11/2", tabId, newUrl)

    // mark oldUrl as visited
    const title = this.cacheVisitedUrls.get(oldUrl)
    logVU("_onReplaceUrlInTab 22", 'title', title)

    if (title) {
      this.markUrl({ url: oldUrl, title, mark: URL_MARK_OPTIONS.VISITED })
    }

    // mark newUrl as activated
    this.cacheVisitedUrls.add(newUrl, newTitle)
    // //
    // const cachedTabData = this.cacheTabId.get(tabId)
    // if (cachedTabData?.title) {
    //   this.cacheVisitedUrls.add(newUrl, cachedTabData?.title)
    // }
  }
  async _onCloseTab(tabId) {
    logVU("_onCloseTab 11", tabId)
    const cachedTabData = this.cacheTabId.get(tabId)
    logVU("_onCloseTab 22 cachedTabData", cachedTabData)

    if (!cachedTabData) {
      return
    }
    const { url, title: tabTitle } = cachedTabData
    logVU("_onCloseTab 33", url)

    const urlTitle = this.cacheVisitedUrls.get(url)

    if (urlTitle) {
      logVU("_onCloseUrl 44", urlTitle)
      this.markUrl({ url, title: urlTitle, mark: URL_MARK_OPTIONS.VISITED })
    } else {
      let title = tabTitle
      logVU("_onCloseUrl 55", tabTitle)

      if (!title) {
        const historyItemList = await chrome.history.search({
          text: url,
          maxResults: 1,
        })
        if (0 < historyItemList.length) {
          title = historyItemList[0].title
        }
      }

      if (!title) {
        title = url
      }

      this.markUrl({ url, title, mark: URL_MARK_OPTIONS.OPENED })
    }

    this.cacheTabId.delete(tabId)
    logVU("_onCloseUrl 99", tabId)
  }

  useSettings({ isOn }) {
    if (isOn) {
      this.onUpdateTab = this._onUpdateTab
      this.onActivateTab = this._onActivateTab
      this.onReplaceUrlInActiveTab = this._onReplaceUrlInActiveTab
      this.onCloseTab = this._onCloseTab

      findOrCreateFolderByTitleInRoot(DATED_TEMPLATE_VISITED)
      findOrCreateFolderByTitleInRoot(DATED_TEMPLATE_OPENED)

    } else {
      this.onUpdateTab = () => { }
      this.onActivateTab = () => { }
      this.onReplaceUrlInTab = () => { }
      this.onCloseTab = () => { }

      this.cacheVisitedUrls.clear()
      this.cacheTabId.clear()
    }
  }
}

export const visitedUrls = new VisitedUrls()
