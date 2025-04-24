import {
  createBookmarkVisited,
  createBookmarkOpened,
} from '../bookmark-controller-api/bookmark-create.js'
import {
  CacheWithLimit,
  makeLogFunction,
} from '../api-low/index.js'

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

  markUrl ({ url, title, mark }) {
    // if (url == 'about:newtab') {
    //   return
    // }

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
    logVU("_onActivateTab", url)
    this.cacheVisitedUrls.add(url, title)
    this.cacheTabId.add(tabId, { url, title })
  }
  _onUpdateTab(tabId, oData) {
    logVU("_onUpdateTab 11", tabId, oData)

    const before = this.cacheTabId.get(tabId)
    const after = {
      ...before,
      ...oData,
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
      this.markUr({ url: oldUrl, title, mark: URL_MARK_OPTIONS.VISITED })
    }

    // mark newUrl as activated
    this.cacheVisitedUrls.add(newUrl, newTitle)
  }
  async _onCloseTab(tabId) {
    logVU("_onCloseTab 11", tabId)
    const { url, title: tabTitle } = this.cacheTabId.get(tabId)

    const urlTitle = this.cacheVisitedUrls.get(url)

    if (urlTitle) {
      logVU("onCloseUrl 22", urlTitle)
      this.markUrl({ url, title: urlTitle, mark: URL_MARK_OPTIONS.VISITED })
    } else {
      let title = tabTitle

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
  }

  useSettings({ isOn }) {
    if (isOn) {
      this.onUpdateTab = this._onUpdateTab
      this.onActivateTab = this._onActivateTab
      this.onReplaceUrlInActiveTab = this._onReplaceUrlInActiveTab
      this.onCloseTab = this._onCloseTab
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
