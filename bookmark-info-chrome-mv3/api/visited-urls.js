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
    this.isOn = false
    this.cacheVisitedUrls = new CacheWithLimit({ name: 'cacheVisitedUrls', size: 500 });
    this.cacheTabId = new CacheWithLimit({ name: 'cacheVisitedTabIds', size: 500 });
  }

  _markUrl({ url, title, mark }) {
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

  visitTab(tabId, url, title) {
    if (!this.isOn) {
      return
    }

    logVU("visitTab 00 ", url)
    const cleanedUrl = removeQueryParamsIfTarget(url);
    logVU("visitTab 11 ", cleanedUrl)

    this.cacheVisitedUrls.add(cleanedUrl, title)
    this.cacheTabId.add(tabId, { url: cleanedUrl, title })
  }
  updateTab(tabId, changeInfo, isActiveTab) {
    if (!this.isOn) {
      return
    }

    let beforeData = this.cacheTabId.get(tabId)
    const updateObj = {}

    if (changeInfo?.status == 'loading') {
      updateObj.time = Date.now()

      if (beforeData) {
        updateObj.before = {
          url: beforeData.url,
          title: beforeData.title,
        }
      }

      beforeData = undefined
    } if (changeInfo?.status == 'complete') {
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
    logVU("_onUpdateTab 11", tabId, updateObj)

    const afterData = {
      ...beforeData,
      ...updateObj,
    }

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
      this._onReplaceUrlInActiveTab({
        tabId,
        oldUrl: afterData?.before?.url,
        newUrl: afterData.url,
        newTitle: afterData.title,
      })
    }
  }
  _onReplaceUrlInActiveTab({ tabId, oldUrl: inOldUrl, newUrl: inNewUrl, newTitle }) {
    const oldUrl = removeQueryParamsIfTarget(inOldUrl);
    const newUrl = removeQueryParamsIfTarget(inNewUrl);

    if (oldUrl == newUrl) {
      return
    }

    logVU("_onReplaceUrlInTab 11/1", tabId, oldUrl)
    logVU("_onReplaceUrlInTab 11/2", tabId, newUrl)

    // mark oldUrl as visited
    const title = this.cacheVisitedUrls.get(oldUrl)
    logVU("_onReplaceUrlInTab 22", 'title', title)

    if (title) {
      this._markUrl({ url: oldUrl, title, mark: URL_MARK_OPTIONS.VISITED })
    }

    // mark newUrl as activated
    this.cacheVisitedUrls.add(newUrl, newTitle)
    // //
    // const cachedTabData = this.cacheTabId.get(tabId)
    // if (cachedTabData?.title) {
    //   this.cacheVisitedUrls.add(newUrl, cachedTabData?.title)
    // }
  }
  async closeTab(tabId) {
    if (!this.isOn) {
      return
    }

    logVU("closeTab 11", tabId)
    const cachedTabData = this.cacheTabId.get(tabId)
    logVU("closeTab 22 cachedTabData", cachedTabData)

    if (!cachedTabData) {
      return
    }
    const { url, title: tabTitle } = cachedTabData
    logVU("closeTab 33", url)

    const urlTitle = this.cacheVisitedUrls.get(url)

    if (urlTitle) {
      logVU("closeTab 44", urlTitle)
      this._markUrl({ url, title: urlTitle, mark: URL_MARK_OPTIONS.VISITED })
    } else {
      let title = tabTitle
      logVU("closeTab 55", tabTitle)

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

      this._markUrl({ url, title, mark: URL_MARK_OPTIONS.OPENED })
    }

    this.cacheTabId.delete(tabId)
    logVU("closeTab 99", tabId)
  }

  useSettings({ isOn }) {
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
}

export const visitedUrls = new VisitedUrls()
