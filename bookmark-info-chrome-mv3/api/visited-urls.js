import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  CacheWithLimit,
} from '../data-structures/index.js'

const logVU = makeLogFunction({ module: 'visited-urls.js' })

class VisitedUrls {
  constructor () {
    this.cacheVisitedUrls = new CacheWithLimit({ name: 'cacheVisitedUrls', size: 500 });
    this.cacheTabId = new CacheWithLimit({ name: 'cacheVisitedTabIds', size: 500 });
  }

  onUpdateTab = () => { }
  onActivateTab = () => { }
  onReplaceUrlInActiveTab = () => { }
  onCloseTab = () => { }

  onMarkUrlVisited = () => { }
  onMarkUrlOpened = () => { }

  markUrlVisited ({ url, title }) {
    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    this.onMarkUrlVisited({ url, title })
  }
  markUrlOpened ({ url, title }) {
    if (url.startsWith('chrome:') || url.startsWith('about:')) {
      return
    }

    this.onMarkUrlOpened({ url, title })
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
      this.markUrlVisited({ url: oldUrl, title })
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
      this.markUrlVisited({ url, title: urlTitle })
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

      this.markUrlOpened({ url, title })
    }

    this.cacheTabId.delete(tabId)
  }

  connect({ isOn, onMarkUrlVisited, onMarkUrlOpened }) {
    if (isOn) {
      this.onUpdateTab = this._onUpdateTab
      this.onActivateTab = this._onActivateTab
      this.onReplaceUrlInActiveTab = this._onReplaceUrlInActiveTab
      this.onCloseTab = this._onCloseTab

      this.onMarkUrlOpened = onMarkUrlOpened
      this.onMarkUrlVisited = onMarkUrlVisited
    } else {
      this.onUpdateTab = () => { }
      this.onActivateTab = () => { }
      this.onReplaceUrlInTab = () => { }
      this.onCloseTab = () => { }

      this.onMarkUrlOpened = () => { }
      this.onMarkUrlVisited = () => { }

      this.cacheVisitedUrls.clear()
      this.cacheTabId.clear()
    }
  }
}

export const visitedUrls = new VisitedUrls()
