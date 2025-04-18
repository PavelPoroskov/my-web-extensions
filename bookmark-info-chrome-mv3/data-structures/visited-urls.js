import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  CacheWithLimit,
} from './cache.js'

const logVU = makeLogFunction({ module: 'visited-urls.js' })

class VisitedUrls {
  constructor () {
    this.cacheUrl = new CacheWithLimit({ name: 'cacheVisitedUrls', size: 500 });
    this.cacheTabId = new CacheWithLimit({ name: 'cacheVisitedTabIds', size: 500 });
  }

  onVisitUrl = () => { }
  onCloseUrl = () => { }
  onCloseTab = () => { }
  onMarkUrlVisited = () => { }

  _onVisitUrl(url, title, tabId) {
    logVU("onVisitUrl", url)
    // this.cacheUrl.add(url, { title, tabId })
    this.cacheUrl.add(url, title)
    this.cacheTabId.add(tabId, url)
  }
  _onCloseUrl(url) {
    logVU("onCloseUrl 11", url)
    // value = this.cacheUrl.get(url)
    // if (value != undefined) {
    //   const { title, tabId } = value

    const title = this.cacheUrl.get(url)
    if (title != undefined) {
      logVU("onCloseUrl 22", title)
      this.onMarkUrlVisited({ url, title })
      this.cacheUrl.delete(url)

      // urlInTab = this.cacheTabId.get(tabId)
      // if (urlInTab == url) {
      //   this.cacheTabId.delete(tabId)
      // }
    }
  }
  _onCloseTab(tabId) {
    const url = this.cacheTabId.get(tabId)

    if (url != undefined) {
      this.onCloseUrl(url)
      this.cacheTabId.delete(tabId)
    }
  }

  connect({ isOn, onMarkUrlVisited }) {
    if (isOn) {
      this.onVisitUrl = this._onVisitUrl
      this.onCloseUrl = this._onCloseUrl
      this.onCloseTab = this._onCloseTab
      this.onMarkUrlVisited = onMarkUrlVisited
    } else {
      this.onOpenUrl = () => { }
      this.onCloseUrl = () => { }
      this.onCloseTab = () => { }
      this.onMarkUrlVisited = () => { }
      this.cacheUrl.clear()
      this.cacheTabId.clear()
    }
  }
}

export const visitedUrls = new VisitedUrls()
